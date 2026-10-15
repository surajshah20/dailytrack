-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    daily_target_minutes INT DEFAULT 480,
    week_starts_on SMALLINT DEFAULT 1, -- 1 = Monday, 0 = Sunday
    theme VARCHAR(20) DEFAULT 'dark',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories / Projects Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    icon VARCHAR(50) DEFAULT 'folder',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_category UNIQUE (user_id, name)
);

-- 4. Recurring Task Rules Table
CREATE TABLE IF NOT EXISTS recurring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_minutes INT DEFAULT 0,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekday', 'weekly', 'monthly')),
    days_of_week INT[], -- e.g. [1, 2, 3, 4, 5]
    day_of_month INT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    recurring_rule_id UUID REFERENCES recurring_rules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    estimated_minutes INT DEFAULT 0,
    actual_minutes INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    position INT DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_task_recurrence ON tasks (user_id, recurring_rule_id, task_date) 
WHERE recurring_rule_id IS NOT NULL;

-- 6. Work Sessions Table (Timer & Manual Sessions)
CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    is_running BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Work Sessions
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON work_sessions(user_id, session_date);
-- Enforces that a user can only have at most 1 active running session at any given moment
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_user_session ON work_sessions(user_id) WHERE is_running = TRUE;

-- 7. Daily Reflections Table
CREATE TABLE IF NOT EXISTS daily_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reflection_date DATE NOT NULL,
    accomplishments TEXT,
    challenges TEXT,
    tomorrow_focus TEXT,
    general_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_reflection_date UNIQUE (user_id, reflection_date)
);

CREATE INDEX IF NOT EXISTS idx_reflections_user_date ON daily_reflections(user_id, reflection_date);