-- =========================================================
-- HRMS Database Schema (PostgreSQL)
-- Single-institution system. Roles: 'admin', 'employee'
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- ---------------------------------------------------------
-- USERS  (auth + role)
-- ---------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     TEXT UNIQUE NOT NULL,   -- e.g. ODJD260704007 (system-generated, see api-contract.md)
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    photo_url       TEXT,
    created_at      TIMESTAMP DEFAULT now()
);

-- Tracks the daily serial counter used to generate employee_id
CREATE TABLE employee_id_counters (
    date_key        DATE PRIMARY KEY,   -- the join/start date
    last_serial     INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------
-- EMPLOYEES  (1:1 extension of users — job/personal details)
-- ---------------------------------------------------------
CREATE TABLE employees (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    job_title       TEXT,
    department      TEXT,
    phone           TEXT,
    address         TEXT,
    basic_pay       NUMERIC(12, 2) DEFAULT 0,
    allowances      NUMERIC(12, 2) DEFAULT 0,
    deductions      NUMERIC(12, 2) DEFAULT 0,
    -- net_pay is NOT stored — always computed as basic_pay + allowances - deductions
    date_joined     DATE DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------
CREATE TABLE attendance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half-day', 'leave')),
    check_in        TIMESTAMP,
    check_out       TIMESTAMP,
    UNIQUE (user_id, date)   -- one attendance record per user per day
);

-- ---------------------------------------------------------
-- LEAVE REQUESTS
-- ---------------------------------------------------------
CREATE TABLE leave_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type          TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    remarks             TEXT,
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id         UUID REFERENCES users(id),
    reviewer_comment    TEXT,
    created_at          TIMESTAMP DEFAULT now(),
    updated_at          TIMESTAMP DEFAULT now(),
    CHECK (end_date >= start_date)
);

-- ---------------------------------------------------------
-- Indexes for common queries
-- ---------------------------------------------------------
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_leave_user ON leave_requests(user_id);
CREATE INDEX idx_leave_status ON leave_requests(status);