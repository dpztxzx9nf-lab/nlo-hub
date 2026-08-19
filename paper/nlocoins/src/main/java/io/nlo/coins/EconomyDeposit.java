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
    private final NLOCoinPlugin plugin;
    private final Path gameplayDb;

    EconomyDeposit(NLOCoinPlugin plugin, Path gameplayDb) {
        this.plugin = plugin;
        this.gameplayDb = gameplayDb;
    }

    boolean alreadyApplied(UUID playerId, long grantId, long coins) {
        return ledgerHit(playerId, grantId, coins) != null;
    }

    boolean deposit(Player player, GrantModels.Grant grant) {
        UUID playerId = player.getUniqueId();
        if (alreadyApplied(playerId, grant.id(), grant.coins())) {
            return true;
        }
        if (nlopAvailable()) {
            long before = balance(playerId);
            String command = "season admin balance " + player.getName() + " add " + grant.coins()
                    + " " + reason(grant.id());
            Bukkit.dispatchCommand(Bukkit.getConsoleSender(), command);
            return alreadyApplied(playerId, grant.id(), grant.coins())
                    || credited(before, balance(playerId), grant.coins());
        }
        if (vaultDeposit(player, grant.coins())) {
            return true;
        }
        if (essentialsGive(player.getName(), grant.coins())) {
            return true;
        }
        return alreadyApplied(playerId, grant.id(), grant.coins());
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

    static boolean credited(long before, long after, long amount) {
        return before >= 0L && after >= 0L && amount > 0L && after - before >= amount;
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
            return -1L;
        }
    }

    private Long ledgerHit(UUID playerId, long grantId, long coins) {
        String reason = reason(grantId);
        try {
            Class.forName("org.sqlite.JDBC");
            try (Connection connection = DriverManager.getConnection(jdbcUrl());
                    PreparedStatement query = connection.prepareStatement(
                            "SELECT id FROM ledger_entries WHERE account_uuid=? AND type='ADMIN_ADJUSTMENT'"
                                    + " AND delta=? AND lower(reference)=? ORDER BY id DESC LIMIT 1")) {
                query.setString(1, playerId.toString());
                query.setLong(2, coins);
                query.setString(3, reason);
                try (ResultSet rows = query.executeQuery()) {
                    return rows.next() ? rows.getLong(1) : null;
                }
            }
        } catch (Exception failure) {
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
}
