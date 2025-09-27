-- =============================================
-- ENIGMA SMART TABLE ASSIGNMENT SYSTEM
-- Migration: 004_smart_assignment_schema.sql
-- Description: Schema for intelligent table assignment algorithms
-- =============================================

-- Table Utilization Metrics (Real-time tracking)
CREATE TABLE IF NOT EXISTS restaurante.table_utilization_metrics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    table_id TEXT NOT NULL REFERENCES restaurante.tables(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour < 24),
    utilization_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    revenue_generated DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reservation_count INTEGER NOT NULL DEFAULT 0,
    average_duration_minutes INTEGER NOT NULL DEFAULT 0,
    zone_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignment Performance Logs (Algorithm monitoring)
CREATE TABLE IF NOT EXISTS restaurante.assignment_performance_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    algorithm_type TEXT NOT NULL CHECK (algorithm_type IN ('optimal', 'balanced', 'historical')),
    reservation_id TEXT REFERENCES restaurante.reservations(id),
    party_size INTEGER NOT NULL,
    assigned_table_ids TEXT[] NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    execution_time_ms INTEGER NOT NULL,
    success_outcome BOOLEAN,
    revenue_impact DECIMAL(10,2),
    utilization_improvement DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservation Success Patterns (Historical learning)
CREATE TABLE IF NOT EXISTS restaurante.reservation_success_patterns (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    party_size INTEGER NOT NULL,
    time_slot INTEGER NOT NULL CHECK (time_slot >= 0 AND time_slot < 24),
    preferred_zone TEXT,
    table_configuration TEXT, -- JSON describing successful table combinations
    success_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    successful_attempts INTEGER NOT NULL DEFAULT 0,
    average_revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zone Utilization Targets (Dynamic balancing)
CREATE TABLE IF NOT EXISTS restaurante.zone_utilization_targets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    zone_name TEXT NOT NULL UNIQUE,
    target_utilization_percentage DECIMAL(5,2) NOT NULL DEFAULT 75.00,
    current_utilization_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    peak_hour_start INTEGER NOT NULL DEFAULT 19,
    peak_hour_end INTEGER NOT NULL DEFAULT 22,
    max_capacity INTEGER NOT NULL DEFAULT 0,
    priority_weight DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for Fast Queries (<200ms requirement)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_utilization_metrics_table_date_hour
ON restaurante.table_utilization_metrics (table_id, date, hour);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_utilization_metrics_zone_date_hour
ON restaurante.table_utilization_metrics (zone_name, date, hour)
WHERE zone_name IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignment_performance_algorithm_created
ON restaurante.assignment_performance_logs (algorithm_type, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignment_performance_confidence
ON restaurante.assignment_performance_logs (confidence_score DESC, execution_time_ms ASC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_success_patterns_party_time_zone
ON restaurante.reservation_success_patterns (party_size, time_slot, preferred_zone);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_success_patterns_success_rate
ON restaurante.reservation_success_patterns (success_rate DESC)
WHERE success_rate >= 80.00;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_utilization_current
ON restaurante.zone_utilization_targets (current_utilization_percentage ASC);

-- RLS Policies for Data Security
ALTER TABLE restaurante.table_utilization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.assignment_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.reservation_success_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.zone_utilization_targets ENABLE ROW LEVEL SECURITY;

-- Staff and admin access to all analytics data
CREATE POLICY "Staff can view table utilization metrics" ON restaurante.table_utilization_metrics
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
);

CREATE POLICY "Staff can view assignment performance logs" ON restaurante.assignment_performance_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
);

CREATE POLICY "Staff can view success patterns" ON restaurante.reservation_success_patterns
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
);

CREATE POLICY "Staff can view zone targets" ON restaurante.zone_utilization_targets
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
);

-- Admin/Manager can manage all analytics data
CREATE POLICY "Managers can modify utilization metrics" ON restaurante.table_utilization_metrics
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER')
    )
);

CREATE POLICY "Managers can modify assignment logs" ON restaurante.assignment_performance_logs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER')
    )
);

CREATE POLICY "Managers can modify success patterns" ON restaurante.reservation_success_patterns
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER')
    )
);

CREATE POLICY "Managers can modify zone targets" ON restaurante.zone_utilization_targets
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM restaurante.users
        WHERE users.id = auth.uid()::TEXT
        AND users.role IN ('ADMIN', 'MANAGER')
    )
);

-- Initialize default zone targets (assuming standard restaurant zones)
INSERT INTO restaurante.zone_utilization_targets (zone_name, target_utilization_percentage, max_capacity, priority_weight)
VALUES
    ('main_dining', 75.00, 120, 1.00),
    ('terrace', 70.00, 40, 0.85),
    ('bar_area', 80.00, 20, 1.10),
    ('private_room', 65.00, 16, 1.20),
    ('window_seats', 85.00, 24, 1.15)
ON CONFLICT (zone_name) DO NOTHING;

-- Trigger to update utilization metrics automatically
CREATE OR REPLACE FUNCTION update_table_utilization_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update utilization metrics when reservation status changes
    IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) OR TG_OP = 'INSERT' THEN
        INSERT INTO restaurante.table_utilization_metrics (
            table_id,
            date,
            hour,
            utilization_percentage,
            reservation_count,
            zone_name
        )
        SELECT
            UNNEST(NEW.table_ids) as table_id,
            NEW.reservation_date as date,
            EXTRACT(HOUR FROM NEW.reservation_time) as hour,
            CASE
                WHEN NEW.status = 'CONFIRMED' THEN 25.00
                WHEN NEW.status = 'SEATED' THEN 75.00
                WHEN NEW.status = 'COMPLETED' THEN 100.00
                ELSE 0.00
            END as utilization_percentage,
            1 as reservation_count,
            COALESCE((
                SELECT zone_name
                FROM restaurante.zone_utilization_targets
                LIMIT 1
            ), 'main_dining') as zone_name
        ON CONFLICT (table_id, date, hour) DO UPDATE SET
            utilization_percentage = EXCLUDED.utilization_percentage,
            reservation_count = table_utilization_metrics.reservation_count + 1,
            updated_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reservations table
DROP TRIGGER IF EXISTS trigger_update_utilization_metrics ON restaurante.reservations;
CREATE TRIGGER trigger_update_utilization_metrics
    AFTER INSERT OR UPDATE ON restaurante.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_table_utilization_metrics();