-- =========================================================
-- Zinox Production Postgres Schema with Supabase Auth
-- NOTE: Every table starts with the required `zinox_` prefix.
-- =========================================================

-- 1. Profiles Table (zinox_profiles)
CREATE TABLE IF NOT EXISTS public.zinox_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL DEFAULT 'Alex Vance',
    user_title TEXT NOT NULL DEFAULT 'Senior Software Architect',
    email TEXT,
    avatar_url TEXT,
    streak_days INT NOT NULL DEFAULT 1,
    points INT NOT NULL DEFAULT 100,
    level_name TEXT NOT NULL DEFAULT 'Zen Explorer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on zinox_profiles
ALTER TABLE public.zinox_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own zinox profile" ON public.zinox_profiles
    FOR ALL USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_zinox_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.zinox_profiles (id, email, user_name, user_title)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'title', 'Tech Specialist')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_zinox_auth_user_created ON auth.users;
CREATE TRIGGER on_zinox_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_zinox_user();


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
    CONSTRAINT unique_zinox_user_daily_log UNIQUE (user_id, log_date)
);

ALTER TABLE public.zinox_balance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own zinox balance logs" ON public.zinox_balance_logs
    FOR ALL USING (auth.uid() = user_id);


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

ALTER TABLE public.zinox_upskill_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own zinox upskill progress" ON public.zinox_upskill_progress
    FOR ALL USING (auth.uid() = user_id);


-- 4. Daily Mindset Quotes Table (zinox_quotes)
CREATE TABLE IF NOT EXISTS public.zinox_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT DEFAULT 'Inspiration',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.zinox_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for zinox_quotes" ON public.zinox_quotes FOR SELECT USING (true);


-- 5. Courses Table (zinox_courses)
CREATE TABLE IF NOT EXISTS public.zinox_courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    lessons_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    quiz_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.zinox_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for zinox_courses" ON public.zinox_courses FOR SELECT USING (true);


-- Initial Seed Data
INSERT INTO public.zinox_quotes (quote, author, category) VALUES
('Small daily improvements over time lead to stunning long-term results.', 'Robin Sharma', 'Upskilling'),
('Rest is not idleness, and to lie sometimes on the grass under trees on a summer day is by no means a waste of time.', 'John Lubbock', 'Work-Life Balance'),
('Focus is a muscle. The more you protect it, the sharper your engineering impact becomes.', 'Cal Newport', 'Productivity'),
('Sharpen your saw before cutting down the tree. Upskilling today saves hours tomorrow.', 'Stephen Covey', 'Upskilling')
ON CONFLICT DO NOTHING;
