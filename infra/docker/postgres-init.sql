-- Pre-seed core infrastructure components for the NOC Dashboard
-- These represent the mission-critical systems being monitored

CREATE TABLE IF NOT EXISTS "SystemComponent" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

INSERT INTO "SystemComponent" (id, name, category) VALUES
('RDBMS_CLUSTER_01', 'Primary Postgres Cluster', 'DATABASE'),
('CACHE_LAYER_01', 'Redis Cache Cluster', 'CACHE'),
('AUTH_SERVICE', 'Identity & Access Provider', 'SERVICE'),
('PAYMENT_GATEWAY', 'Transaction Processor', 'GATEWAY')
ON CONFLICT (id) DO NOTHING;

-- Note: Prisma will handle the schema for WorkItem, RCA, etc.
-- This script ensures lookup data exists for the frontend surveillance view.
