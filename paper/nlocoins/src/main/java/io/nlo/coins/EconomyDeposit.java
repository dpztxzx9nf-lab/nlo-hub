package io.nlo.coins;

import java.lang.reflect.Method;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Locale;
import java.util.UUID;
import java.util.logging.Level;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.Plugin;

final class EconomyDeposit {
    static final long SETTLE_MS = 4_000L;
    static final long SETTLE_STEP_MS = 50L;

    private final NLOCoinPlugin plugin;
    private final Path gameplayDb;

    EconomyDeposit(NLOCoinPlugin plugin, Path gameplayDb) {
        this.plugin = plugin;
        this.gameplayDb = gameplayDb;
    }

    record Settlement(long before, long after, Long ledgerId, Long ledgerAfter, boolean confirmed) {
        String summary(GrantModels.Grant grant, Player player) {
            return "grant=" + grant.id()
                    + " ign=" + player.getName()
                    + " uuid=" + player.getUniqueId()
                    + " coins=" + grant.coins()
                    + " before=" + before
                    + " after=" + after
                    + " expected=" + expectedAfter(before, grant.coins())
                    + " ledger=" + (ledgerId == null ? "none" : ledgerId)
                    + " ledgerAfter=" + (ledgerAfter == null ? "none" : ledgerAfter)
                    + " confirmed=" + confirmed;
        }
    }

    boolean alreadyApplied(UUID playerId, long grantId, long coins) {
        return ledgerHit(playerId, grantId, coins) != null;
    }

    long balanceOf(UUID playerId) {
        return balance(playerId);
    }

    boolean apply(Player player, GrantModels.Grant grant) {
        UUID playerId = player.getUniqueId();
        if (alreadyApplied(playerId, grant.id(), grant.coins())) {
            return true;
        }
        if (nlopAvailable()) {
            String command = "season admin balance " + player.getName() + " add " + grant.coins()
                    + " " + reason(grant.id());
            plugin.getLogger().info("Shop credit command " + command);
            return Bukkit.dispatchCommand(Bukkit.getConsoleSender(), command);
        }
        if (vaultDeposit(player, grant.coins())) {
            plugin.getLogger().warning("Shop grant " + grant.id() + " used Vault; NLOP was not available.");
            return true;
        }
        if (essentialsGive(player.getName(), grant.coins())) {
            plugin.getLogger().warning("Shop grant " + grant.id() + " used Essentials eco; NLOP was not available.");
            return true;
        }
        return false;
    }

    Settlement awaitConfirmed(Player player, GrantModels.Grant grant, long before) {
        UUID playerId = player.getUniqueId();
        long deadline = System.currentTimeMillis() + SETTLE_MS;
        Settlement last = snapshot(playerId, grant.id(), grant.coins(), before);
        while (!upToDate(last, grant.coins()) && System.currentTimeMillis() < deadline) {
            sleepQuietly(SETTLE_STEP_MS);
            last = snapshot(playerId, grant.id(), grant.coins(), before);
        }
        boolean confirmed = upToDate(last, grant.coins());
        Settlement result = new Settlement(before, last.after, last.ledgerId, last.ledgerAfter, confirmed);
        if (confirmed) {
            plugin.getLogger().info("Shop credit settled " + result.summary(grant, player));
        } else {
            plugin.getLogger().warning("Shop credit NOT settled " + result.summary(grant, player));
        }
        return result;
    }

    static long expectedAfter(long before, long coins) {
        if (before < 0L || coins < 0L) {
            return -1L;
        }
        return before + coins;
    }

    static boolean credited(long before, long after, long amount) {
        return before >= 0L && after >= 0L && amount > 0L && after - before >= amount;
    }

    static boolean upToDate(Settlement snap, long coins) {
        if (snap == null || coins <= 0L) {
            return false;
        }
        boolean moved = credited(snap.before, snap.after, coins);
        if (snap.ledgerId == null) {
            return moved;
        }
        if (snap.ledgerAfter != null && snap.after >= 0L && snap.after == snap.ledgerAfter) {
            return true;
        }
        return moved;
    }

    private Settlement snapshot(UUID playerId, long grantId, long coins, long before) {
        LedgerRow row = ledgerHit(playerId, grantId, coins);
        long after = balance(playerId);
        return new Settlement(
                before,
                after,
                row == null ? null : row.id,
                row == null ? null : row.balanceAfter,
                false);
    }

    private boolean nlopAvailable() {
        Plugin nlop = Bukkit.getPluginManager().getPlugin("NLOP");
        return nlop != null && nlop.isEnabled();
    }

    private boolean vaultDeposit(Player player, long coins) {
        try {
            Class<?> economyClass = Class.forName("net.milkbowl.vault.economy.Economy");
            Object registration = Bukkit.getServicesManager().getRegistration(economyClass);
            if (registration == null) {
                return false;
            }
            Method provider = registration.getClass().getMethod("getProvider");
            Object economy = provider.invoke(registration);
            if (economy == null) {
                return false;
            }
            Method deposit = economy.getClass().getMethod("depositPlayer", String.class, double.class);
            Object result = deposit.invoke(economy, player.getName(), (double) coins);
            if (result == null) {
                return true;
            }
            Method transactionSuccess = result.getClass().getMethod("transactionSuccess");
            return Boolean.TRUE.equals(transactionSuccess.invoke(result));
        } catch (ClassNotFoundException missing) {
            return false;
        } catch (Exception failure) {
            plugin.getLogger().log(Level.WARNING, "Vault deposit failed", failure);
            return false;
        }
    }

    private boolean essentialsGive(String playerName, long coins) {
        if (Bukkit.getPluginManager().getPlugin("Essentials") == null
                && Bukkit.getPluginManager().getPlugin("EssentialsX") == null) {
            return false;
        }
        return Bukkit.dispatchCommand(
                Bukkit.getConsoleSender(),
                "eco give " + playerName + " " + coins);
    }

    private long balance(UUID playerId) {
        try {
            Class.forName("org.sqlite.JDBC");
            try (Connection connection = DriverManager.getConnection(jdbcUrl());
                    PreparedStatement query = connection.prepareStatement(
                            "SELECT balance FROM accounts WHERE uuid=?")) {
                query.setString(1, playerId.toString());
                try (ResultSet rows = query.executeQuery()) {
                    return rows.next() ? rows.getLong(1) : -1L;
                }
            }
        } catch (Exception failure) {
            plugin.getLogger().log(Level.WARNING, "Could not read NLOP balance for " + playerId, failure);
            return -1L;
        }
    }

    private LedgerRow ledgerHit(UUID playerId, long grantId, long coins) {
        String reason = reason(grantId);
        try {
            Class.forName("org.sqlite.JDBC");
            try (Connection connection = DriverManager.getConnection(jdbcUrl());
                    PreparedStatement query = connection.prepareStatement(
                            "SELECT id, balance_after FROM ledger_entries WHERE account_uuid=? AND type='ADMIN_ADJUSTMENT'"
                                    + " AND delta=? AND lower(reference)=? ORDER BY id DESC LIMIT 1")) {
                query.setString(1, playerId.toString());
                query.setLong(2, coins);
                query.setString(3, reason);
                try (ResultSet rows = query.executeQuery()) {
                    if (!rows.next()) {
                        return null;
                    }
                    return new LedgerRow(rows.getLong(1), rows.getLong(2));
                }
            }
        } catch (Exception failure) {
            plugin.getLogger().log(Level.WARNING, "Could not read NLOP ledger for grant " + grantId, failure);
            return null;
        }
    }

    private String jdbcUrl() {
        return "jdbc:sqlite:file:" + gameplayDb.toAbsolutePath().toString().replace('\\', '/')
                + "?busy_timeout=5000";
    }

    static String reason(long grantId) {
        return ("nlo-shop-" + grantId).toLowerCase(Locale.ROOT);
    }

    private static void sleepQuietly(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }

    private record LedgerRow(long id, long balanceAfter) {}
}
