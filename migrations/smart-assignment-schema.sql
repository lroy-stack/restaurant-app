-- Smart Table Assignment System Schema
-- Execute via: ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -f /path/to/smart-assignment-schema.sql"

-- Table utilization tracking
CREATE TABLE IF NOT EXISTS restaurante.table_utilization_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id TEXT NOT NULL REFERENCES restaurante.tables(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hour_slot INTEGER NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23),
    utilization_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000, -- 0.0000 to 1.0000
    revenue_generated DECIMAL(10,2) DEFAULT 0.00,
    total_covers INTEGER DEFAULT 0,
    avg_party_size DECIMAL(4,2) DEFAULT 0.00,
    turn_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(table_id, date, hour_slot)
);

-- Assignment algorithm performance tracking
CREATE TABLE IF NOT EXISTS restaurante.assignment_performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    algorithm_used TEXT NOT NULL CHECK (algorithm_used IN ('optimal', 'balanced', 'historical')),
    party_size INTEGER NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    assigned_table_ids TEXT[] NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    processing_time_ms INTEGER NOT NULL,
    utilization_impact JSONB, -- Before/after utilization metrics
    revenue_impact DECIMAL(10,2),
    success_outcome BOOLEAN, -- Did customer actually show up?
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),

    INDEX idx_assignment_performance_algorithm (algorithm_used),
    INDEX idx_assignment_performance_date (requested_date),
    INDEX idx_assignment_performance_confidence (confidence_score DESC)
);

-- Historical pattern learning data
CREATE TABLE IF NOT EXISTS restaurante.reservation_success_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_size INTEGER NOT NULL,
    time_slot TEXT NOT NULL, -- Format: "HH:MM-HH:MM" (e.g., "19:00-21:30")
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
    table_zone TEXT NOT NULL,
    table_configuration TEXT[], -- Table IDs that worked well together
    success_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    avg_duration_minutes INTEGER,
    avg_revenue_per_cover DECIMAL(8,2),
    sample_size INTEGER NOT NULL DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(party_size, time_slot, day_of_week, season, table_zone)
);

-- Zone utilization targets
CREATE TABLE IF NOT EXISTS restaurante.zone_utilization_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT NOT NULL,
    target_utilization DECIMAL(5,4) NOT NULL DEFAULT 0.7500, -- 75% target
    peak_hours INTEGER[] NOT NULL DEFAULT ARRAY[19,20,21], -- 7PM-9PM
    max_utilization DECIMAL(5,4) NOT NULL DEFAULT 0.9500, -- 95% max
    priority_weight DECIMAL(4,3) NOT NULL DEFAULT 1.000,

    UNIQUE(zone_name)
);

-- Indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_utilization_metrics_date_hour
ON restaurante.table_utilization_metrics(date, hour_slot);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_utilization_metrics_table_recent
ON restaurante.table_utilization_metrics(table_id, date DESC, hour_slot);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_success_patterns_lookup
ON restaurante.reservation_success_patterns(party_size, day_of_week, time_slot);

-- RLS Policies
ALTER TABLE restaurante.table_utilization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.assignment_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.reservation_success_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.zone_utilization_targets ENABLE ROW LEVEL SECURITY;

-- Staff access policies
CREATE POLICY "staff_can_view_utilization" ON restaurante.table_utilization_metrics
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE id = (auth.uid())::text
        AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
);

CREATE POLICY "system_can_update_utilization" ON restaurante.table_utilization_metrics
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "staff_can_view_performance" ON restaurante.assignment_performance_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE id = (auth.uid())::text
        AND role IN ('ADMIN', 'MANAGER')
    )
);

CREATE POLICY "system_can_log_performance" ON restaurante.assignment_performance_logs
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Initial zone targets
INSERT INTO restaurante.zone_utilization_targets (zone_name, target_utilization, peak_hours, priority_weight)
VALUES
    ('WINDOW', 0.8000, ARRAY[19,20,21], 1.200),
    ('CENTER', 0.7500, ARRAY[19,20,21], 1.000),
    ('BAR', 0.7000, ARRAY[18,19,20,21,22], 0.900),
    ('TERRACE', 0.6500, ARRAY[19,20,21], 0.800)
ON CONFLICT (zone_name) DO NOTHING;