-- Covering index so 90d uptime aggregations are index-only scans.
-- IF NOT EXISTS because the index was created manually on prod on 2026-08-17
-- to fix slow /api/sites before this migration deployed.
CREATE INDEX IF NOT EXISTS "Ping_siteId_checkedAt_isUp_responseTime_idx" ON "Ping"("siteId", "checkedAt", "isUp", "responseTime");
