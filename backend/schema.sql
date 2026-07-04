-- =========================================================
-- HRMS Database Schema (Supabase PostgreSQL)
-- =========================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- EMPLOYEE ID COUNTERS
-- Tracks the daily serial counter used to generate employee_id
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_id_counters (
    date_key        DATE PRIMARY KEY,
    last_serial     INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------
-- PROFILES (extends auth.users)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id     TEXT UNIQUE NOT NULL,   -- System-generated, e.g. ODJD260704007
    login_id        TEXT UNIQUE NOT NULL,   -- System-generated, e.g. john.doe, john.doe1
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    photo_url       TEXT,
    job_title       TEXT,
    department      TEXT,
    phone           TEXT,
    address         TEXT,
    salary          NUMERIC(12, 2) DEFAULT 0.00,
    date_joined     DATE DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    status          TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half-day', 'leave')),
    check_in        TIMESTAMP WITH TIME ZONE,
    check_out       TIMESTAMP WITH TIME ZONE,
    working_hours   NUMERIC(4, 2) DEFAULT 0.00,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, date)   -- one attendance record per user per day
);

-- ---------------------------------------------------------
-- LEAVE REQUESTS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    leave_type          TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    remarks             TEXT,
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_comment    TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (end_date >= start_date)
);

-- ---------------------------------------------------------
-- PAYROLL
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year            INTEGER NOT NULL,
    basic_salary    NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    allowances      NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deductions      NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary      NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, month, year)
);

-- ---------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- CONCURRENCY-SAFE ID GENERATION FUNCTION
-- Generates unique employee_id in format:
-- OD + First letter of first name + First letter of last name + Joining Date (YYMMDD) + 3 digit daily sequence
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_employee_id(first_name TEXT, last_name TEXT, join_date DATE)
RETURNS TEXT AS $$
DECLARE
    first_char  TEXT;
    last_char   TEXT;
    date_str    TEXT;
    serial_num  INTEGER;
    serial_str  TEXT;
    emp_id      TEXT;
BEGIN
    -- Extract first letters and convert to uppercase, default to 'X' if empty
    first_char := COALESCE(UPPER(SUBSTRING(TRIM(first_name), 1, 1)), 'X');
    last_char  := COALESCE(UPPER(SUBSTRING(TRIM(last_name), 1, 1)), 'X');
    
    -- Format join_date as YYMMDD
    date_str := TO_CHAR(join_date, 'YYMMDD');
    
    -- Atomically upsert and increment the serial sequence for the joining date
    INSERT INTO employee_id_counters (date_key, last_serial)
    VALUES (join_date, 1)
    ON CONFLICT (date_key)
    DO UPDATE SET last_serial = employee_id_counters.last_serial + 1
    RETURNING last_serial INTO serial_num;
    
    -- Format the serial number to be 3-digit zero-padded (e.g. 001, 002)
    serial_str := LPAD(serial_num::TEXT, 3, '0');
    
    -- Construct full employee_id
    emp_id := 'OD' || first_char || last_char || date_str || serial_str;
    
    RETURN emp_id;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------
-- Indexes for query optimization
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_user_date ON payroll(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
