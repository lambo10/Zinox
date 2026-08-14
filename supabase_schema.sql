-- =========================================================
-- Zinox App Supabase Postgres Schema Definition
-- NOTE: All tables must use the `zinox_` prefix as requested.
-- =========================================================

-- 1. Profiles Table (zinox_profiles)
CREATE TABLE IF NOT EXISTS public.zinox_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL DEFAULT 'Alex Vance',
    user_title TEXT NOT NULL DEFAULT 'Senior Software Architect',
    avatar_url TEXT,
    streak_days INT NOT NULL DEFAULT 14,
    points INT NOT NULL DEFAULT 1250,
    level_name TEXT NOT NULL DEFAULT 'Zen Master',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on zinox_profiles
ALTER TABLE public.zinox_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access to zinox_profiles" ON public.zinox_profiles FOR ALL USING (true);


-- 2. Balance Logs Table (zinox_balance_logs)
CREATE TABLE IF NOT EXISTS public.zinox_balance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.zinox_profiles(id) ON DELETE CASCADE,
    water_drank INT NOT NULL DEFAULT 0,
    water_goal INT NOT NULL DEFAULT 8,
    eye_rests INT NOT NULL DEFAULT 0,
    eye_rest_goal INT NOT NULL DEFAULT 5,
    stretches_done INT NOT NULL DEFAULT 0,
    stretch_goal INT NOT NULL DEFAULT 3,
    focus_minutes INT NOT NULL DEFAULT 0,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_daily_log UNIQUE (user_id, log_date)
);

-- Enable RLS on zinox_balance_logs
ALTER TABLE public.zinox_balance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to zinox_balance_logs" ON public.zinox_balance_logs FOR ALL USING (true);


-- 3. Upskill Progress Table (zinox_upskill_progress)
CREATE TABLE IF NOT EXISTS public.zinox_upskill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.zinox_profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    lesson_id TEXT,
    completed BOOLEAN DEFAULT false,
    quiz_score INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on zinox_upskill_progress
ALTER TABLE public.zinox_upskill_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to zinox_upskill_progress" ON public.zinox_upskill_progress FOR ALL USING (true);


-- 4. Daily Mindset Quotes Table (zinox_quotes)
CREATE TABLE IF NOT EXISTS public.zinox_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT DEFAULT 'Inspiration',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on zinox_quotes
ALTER TABLE public.zinox_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to zinox_quotes" ON public.zinox_quotes FOR SELECT USING (true);


-- =========================================================
-- Initial Seed Data
-- =========================================================
INSERT INTO public.zinox_quotes (quote, author, category) VALUES
('Small daily improvements over time lead to stunning long-term results.', 'Robin Sharma', 'Upskilling'),
('Rest is not idleness, and to lie sometimes on the grass under trees on a summer day is by no means a waste of time.', 'John Lubbock', 'Work-Life Balance'),
('Focus is a muscle. The more you protect it, the sharper your engineering impact becomes.', 'Cal Newport', 'Productivity'),
('Sharpen your saw before cutting down the tree. Upskilling today saves hours tomorrow.', 'Stephen Covey', 'Upskilling')
ON CONFLICT DO NOTHING;
