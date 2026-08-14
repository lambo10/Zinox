-- =========================================================
-- Zinox Production Postgres Schema with Supabase Auth
-- NOTE: Every table starts with the required `zinox_` prefix.
-- COPY AND PASTE THIS ENTIRE FILE INTO YOUR SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/tefvknjmgafecdjdffiu/sql/new
-- =========================================================

-- 1. Profiles Table (zinox_profiles)
CREATE TABLE IF NOT EXISTS public.zinox_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL DEFAULT 'Lambert Nnadi',
    user_title TEXT NOT NULL DEFAULT 'Senior Software Developer',
    email TEXT,
    avatar_url TEXT,
    streak_days INT NOT NULL DEFAULT 14,
    points INT NOT NULL DEFAULT 1250,
    level_name TEXT NOT NULL DEFAULT 'Zen Master',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop legacy foreign key constraint on auth.users if it exists
ALTER TABLE IF EXISTS public.zinox_profiles DROP CONSTRAINT IF EXISTS zinox_profiles_id_fkey;

-- Ensure Unique Index on Email for On Conflict resolution
CREATE UNIQUE INDEX IF NOT EXISTS zinox_profiles_email_idx ON public.zinox_profiles (email);

ALTER TABLE public.zinox_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write access to zinox_profiles" ON public.zinox_profiles;
CREATE POLICY "Allow public read/write access to zinox_profiles" ON public.zinox_profiles FOR ALL USING (true) WITH CHECK (true);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_zinox_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.zinox_profiles (id, email, user_name, user_title)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Lambert Nnadi'),
        COALESCE(new.raw_user_meta_data->>'title', 'Senior Software Developer')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        user_name = EXCLUDED.user_name,
        user_title = EXCLUDED.user_title;
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
    water_drank INT NOT NULL DEFAULT 5,
    water_goal INT NOT NULL DEFAULT 8,
    eye_rests INT NOT NULL DEFAULT 3,
    eye_rest_goal INT NOT NULL DEFAULT 5,
    stretches_done INT NOT NULL DEFAULT 2,
    stretch_goal INT NOT NULL DEFAULT 3,
    focus_minutes INT NOT NULL DEFAULT 110,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_zinox_user_daily_log UNIQUE (user_id, log_date)
);

ALTER TABLE public.zinox_balance_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write access to zinox_balance_logs" ON public.zinox_balance_logs;
CREATE POLICY "Allow public read/write access to zinox_balance_logs" ON public.zinox_balance_logs FOR ALL USING (true) WITH CHECK (true);


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
DROP POLICY IF EXISTS "Allow public read/write access to zinox_upskill_progress" ON public.zinox_upskill_progress;
CREATE POLICY "Allow public read/write access to zinox_upskill_progress" ON public.zinox_upskill_progress FOR ALL USING (true) WITH CHECK (true);


-- 4. Daily Mindset Quotes Table (zinox_quotes)
CREATE TABLE IF NOT EXISTS public.zinox_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT DEFAULT 'Inspiration',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.zinox_quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write access to zinox_quotes" ON public.zinox_quotes;
CREATE POLICY "Allow public read/write access to zinox_quotes" ON public.zinox_quotes FOR ALL USING (true) WITH CHECK (true);


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
DROP POLICY IF EXISTS "Allow public read/write access to zinox_courses" ON public.zinox_courses;
CREATE POLICY "Allow public read/write access to zinox_courses" ON public.zinox_courses FOR ALL USING (true) WITH CHECK (true);


-- =========================================================
-- Initial Seed Production Data for Lambert Nnadi
-- =========================================================

-- Seed Lambert Nnadi Profile safely without constraint errors
INSERT INTO public.zinox_profiles (id, user_name, user_title, email, streak_days, points, level_name)
SELECT gen_random_uuid(), 'Lambert Nnadi', 'Senior Software Developer', 'nnadi406@gmail.com', 14, 1250, 'Zen Master'
WHERE NOT EXISTS (
    SELECT 1 FROM public.zinox_profiles WHERE email = 'nnadi406@gmail.com'
);

-- Seed Production Quotes
INSERT INTO public.zinox_quotes (quote, author, category) VALUES
('Small daily improvements over time lead to stunning long-term results.', 'Robin Sharma', 'Upskilling'),
('Rest is not idleness, and to lie sometimes on the grass under trees on a summer day is by no means a waste of time.', 'John Lubbock', 'Work-Life Balance'),
('Focus is a muscle. The more you protect it, the sharper your engineering impact becomes.', 'Cal Newport', 'Productivity'),
('Sharpen your saw before cutting down the tree. Upskilling today saves hours tomorrow.', 'Stephen Covey', 'Upskilling')
ON CONFLICT DO NOTHING;

-- Seed Production Courses into zinox_courses
INSERT INTO public.zinox_courses (id, title, category, description, duration, difficulty, lessons_json, quiz_json) VALUES
('course-1', 'AI Engineering: RAG & System Prompting', 'AI & Code', 'Master Retrieval-Augmented Generation architectures, embeddings, and context window optimization.', '15 mins', 'Intermediate',
 '[{"id":"l1","title":"Understanding Vector Embeddings & Similarity Search","duration":"5 mins","content":"Vector embeddings transform text into dense numerical representations. Using cosine similarity algorithms, models retrieve precise semantic context from knowledge bases fast.","completed":true},{"id":"l2","title":"Chunking Strategies & Hybrid Search","duration":"5 mins","content":"Effective chunking balances token budget and semantic coherence. Overlapping sliding windows (e.g. 512 tokens with 50-token overlap) prevent context fragmentation.","completed":false},{"id":"l3","title":"System Prompt Engineering Best Practices","duration":"5 mins","content":"Structure system instructions using explicit XML or Markdown tags (<context>, <instructions>, <constraints>) to improve adherence and minimize hallucinations.","completed":false}]'::jsonb,
 '[{"question":"Which metric is commonly used to measure distance between vector embeddings?","options":["Manhattan Distance","Cosine Similarity","Hamming Code","Standard Deviation"],"correctIndex":1,"explanation":"Cosine similarity measures the angle between vectors, ideal for high-dimensional semantic spaces."},{"question":"Why is text chunking important in RAG?","options":["It formats output into HTML","It fits context window limits while preserving semantic meaning","It encrypts sensitive database records","It speeds up GPU compilation"],"correctIndex":1,"explanation":"Chunking breaks large documents into manageable segments suitable for embedding and LLM prompt windows."}]'::jsonb),

('course-2', 'Mindful Tech Leadership: Preventing Burnout', 'Leadership', 'Practical strategies for managing cognitive load, setting Async boundaries, and high-impact delegation.', '10 mins', 'Beginner',
 '[{"id":"l1","title":"The Neuroscience of Context Switching","duration":"3 mins","content":"Task switching incurs cognitive debt. It takes an average of 23 minutes to refocus after a distraction. Batching communication creates protected focus blocks.","completed":true},{"id":"l2","title":"Asynchronous Communication Frameworks","duration":"4 mins","content":"Defaulting to rich async documents (RFCs, decision logs) reduces real-time meeting fatigue and empowers distributed team autonomy.","completed":true},{"id":"l3","title":"Micro-Rest Protocols for Engineers","duration":"3 mins","content":"The 20-20-20 rule and 90-minute ultradian rhythm rest breaks recharge prefrontal cortex energy before fatigue sets in.","completed":false}]'::jsonb,
 '[{"question":"How long does it take on average to regain deep focus after a context interruption?","options":["2 minutes","5 minutes","23 minutes","1 hour"],"correctIndex":2,"explanation":"Research indicates cognitive context switching costs average ~23 minutes of focus recovery time."}]'::jsonb),

('course-3', 'React Native 0.74+ & Reanimated 3 Mastery', 'Architecture', 'Build 60FPS fluid mobile UIs with worklets, shared element transitions, and gesture handler hooks.', '20 mins', 'Advanced',
 '[{"id":"l1","title":"UI Thread vs JS Thread Worklets","duration":"6 mins","content":"Reanimated worklets run directly on the UI thread via JSI (JavaScript Interface), bypassing asynchronous bridge overhead for smooth animations.","completed":false},{"id":"l2","title":"useSharedValue & useAnimatedStyle Hooks","duration":"7 mins","content":"Shared values hold mutable animation values accessed across threads. useAnimatedStyle generates reactive dynamic styles driven by worklets.","completed":false},{"id":"l3","title":"Gesture Driven Physics Animations","duration":"7 mins","content":"Combine Gesture.Pan() with withSpring() and withDecay() physics curves to build interactive swipeable cards and drawer sheets.","completed":false}]'::jsonb,
 '[{"question":"Where do Reanimated worklets execute animation frames?","options":["Main Network Thread","JS Event Loop Thread","UI Thread (Native)","Node Web Worker"],"correctIndex":2,"explanation":"Worklets compile into C++ functions executed directly on the UI thread for instant 60 FPS feedback."}]'::jsonb),

('course-4', 'Digital Wellness & Ergonomics for Developers', 'Wellness', 'Posture alignment, circadian lighting hacks, and reducing eye fatigue during intense coding marathons.', '8 mins', 'Beginner',
 '[{"id":"l1","title":"Monitor Height & Lumbar Posture setup","duration":"4 mins","content":"Top edge of monitor should align at eye level. Elbows bent at 90 degrees with neutral wrist positioning avoids carpal strain.","completed":true},{"id":"l2","title":"Circadian Light & Blue Light Management","duration":"4 mins","content":"Morning natural light exposure boosts melatonin synthesis for nighttime deep sleep recovery.","completed":true}]'::jsonb,
 '[{"question":"Where should the top of your primary display monitor be positioned?","options":["Above eye level","At or slightly below eye level","Chambered near desk level","45 degrees tilted up"],"correctIndex":1,"explanation":"Aligning top of screen with eye level maintains neutral neck alignment and reduces cervical strain."}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
