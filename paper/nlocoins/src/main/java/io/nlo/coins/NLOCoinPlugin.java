package io.nlo.coins;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;

public final class NLOCoinPlugin extends JavaPlugin implements Listener {
    private GrantClient client;
    private EconomyDeposit economy;
    private final Set<Long> inFlight = ConcurrentHashMap.newKeySet();
    private final AtomicInteger online = new AtomicInteger();
    private final AtomicBoolean polling = new AtomicBoolean();
    private volatile long lastWarnAt;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        String secret = resolveSecret();
        String hub = getConfig().getString("hub-url", "https://nlo.gg");
        if (secret.isBlank()) {
            getLogger().severe("NLO_INTERNAL_SECRET is missing. Shop coins will not deliver.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }
        client = new GrantClient(hub, secret);
        Path db = getServer().getWorldContainer().toPath()
                .resolve(getConfig().getString("gameplay-db", "plugins/NLOP/gameplay.db"));
        economy = new EconomyDeposit(this, db);
        getServer().getPluginManager().registerEvents(this, this);
        online.set(Bukkit.getOnlinePlayers().size());
        long pollTicks = Math.max(5L, getConfig().getLong("poll-seconds", 15L)) * 20L;
        getServer().getScheduler().runTaskTimerAsynchronously(this, this::pollSafe, 100L, pollTicks);
        getLogger().info("NLOCoins delivering shop packs from " + hub);
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        online.incrementAndGet();
        long delay = Math.max(1L, getConfig().getLong("join-delay-ticks", 40L));
        getServer().getScheduler().runTaskLater(this, () -> drainPlayer(event.getPlayer()), delay);
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        online.updateAndGet(n -> Math.max(0, n - 1));
    }

    private void pollSafe() {
        if (online.get() <= 0) {
            return;
        }
        if (!polling.compareAndSet(false, true)) {
            return;
        }
        try {
            List<GrantModels.Grant> pending = client.pending();
            if (pending.isEmpty()) {
                return;
            }
            getServer().getScheduler().runTask(this, () -> {
                for (GrantModels.Grant grant : pending) {
                    Player player = onlineFor(grant.ign());
                    if (player != null) {
                        deliver(player, grant);
                    }
                }
            });
        } catch (Exception failure) {
            warnSparse("Coin grant poll failed: " + failure.getMessage());
        } finally {
            polling.set(false);
        }
    }

    private void drainPlayer(Player player) {
        if (!player.isOnline()) {
            return;
        }
        getServer().getScheduler().runTaskAsynchronously(this, () -> {
            try {
                List<GrantModels.Grant> pending = client.pending();
                getServer().getScheduler().runTask(this, () -> {
                    for (GrantModels.Grant grant : pending) {
                        if (IgnNames.matches(grant.ign(), player.getName())) {
                            deliver(player, grant);
                        }
                    }
                });
            } catch (Exception failure) {
                warnSparse("Coin grant login drain failed: " + failure.getMessage());
            }
        });
    }

    private void deliver(Player player, GrantModels.Grant grant) {
        if (!inFlight.add(grant.id())) {
            return;
        }
        getServer().getScheduler().runTaskAsynchronously(this, () -> {
            boolean leased = false;
            boolean handedOff = false;
            try {
                if (economy.alreadyApplied(player.getUniqueId(), grant.id(), grant.coins())) {
                    client.delivered(grant.id(), player.getName());
                    tell(player, grant);
                    return;
                }
                leased = client.claim(grant.id());
                if (!leased) {
                    return;
                }
                handedOff = true;
                getServer().getScheduler().runTask(this, () -> {
                    boolean ok = false;
                    try {
                        ok = economy.deposit(player, grant);
                    } finally {
                        boolean delivered = ok;
                        getServer().getScheduler().runTaskAsynchronously(this, () -> {
                            try {
                                if (delivered) {
                                    if (client.delivered(grant.id(), player.getName())) {
                                        tell(player, grant);
                                    } else {
                                        client.release(grant.id());
                                    }
                                } else {
                                    client.release(grant.id());
                                }
                            } catch (Exception failure) {
                                client.release(grant.id());
                                getLogger().log(Level.WARNING, "Could not mark grant " + grant.id(), failure);
                            } finally {
                                inFlight.remove(grant.id());
                            }
                        });
                    }
                });
            } catch (Exception failure) {
                if (leased) {
                    client.release(grant.id());
                }
                getLogger().log(Level.WARNING, "Grant " + grant.id() + " failed", failure);
            } finally {
                if (!handedOff) {
                    inFlight.remove(grant.id());
                }
            }
        });
    }

    private void tell(Player player, GrantModels.Grant grant) {
        getServer().getScheduler().runTask(this, () -> {
            if (player.isOnline()) {
                player.sendMessage("§6NLO §8| §f" + grant.coins() + " shop coins delivered.");
            }
        });
    }

    private void warnSparse(String message) {
        long now = System.currentTimeMillis();
        if (now - lastWarnAt < 60_000L) {
            return;
        }
        lastWarnAt = now;
        getLogger().warning(message);
    }

    private Player onlineFor(String claimed) {
        for (Player player : Bukkit.getOnlinePlayers()) {
            if (IgnNames.matches(claimed, player.getName())) {
                return player;
            }
        }
        return null;
    }

    private String resolveSecret() {
        String env = System.getenv("NLO_INTERNAL_SECRET");
        if (env != null && !env.isBlank()) {
            return env.trim();
        }
        String configured = getConfig().getString("internal-secret", "");
        if (configured != null && !configured.isBlank()) {
            return configured.trim();
        }
        String file = getConfig().getString("secret-file", "/opt/nlo/nlo.env");
        if (file == null || file.isBlank()) {
            return "";
        }
        Path path = Path.of(file);
        if (!Files.isRegularFile(path)) {
            return "";
        }
        try {
            for (String line : Files.readAllLines(path)) {
                String trimmed = line.trim();
                if (trimmed.startsWith("NLO_INTERNAL_SECRET=")) {
                    return trimmed.substring("NLO_INTERNAL_SECRET=".length()).trim();
                }
            }
        } catch (IOException ignored) {
            return "";
        }
        return "";
    }
}
