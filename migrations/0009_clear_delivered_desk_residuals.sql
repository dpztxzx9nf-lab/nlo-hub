-- One-shot residual cleanup after desk-clears-on-delivery.
-- Desk = undelivered holding account only.
-- Zero any wallet that still holds coins but has no open grant.
-- Safe: anyone with a pending/delivering pack keeps their balance.
UPDATE nlo_wallets w
SET coins = 0,
    updated_at = now()
WHERE coins > 0
  AND NOT EXISTS (
    SELECT 1
    FROM nlo_coin_grants g
    WHERE g.user_id = w.user_id
      AND g.status IN ('pending', 'delivering')
  );
