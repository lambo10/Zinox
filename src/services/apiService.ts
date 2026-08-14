import { DailyQuote, UpskillCourse } from '../store/useZinoxStore';
import { supabase, TABLES } from './supabaseClient';

const FALLBACK_QUOTES: DailyQuote[] = [
  {
    quote: 'Small daily improvements over time lead to stunning long-term results.',
    author: 'Robin Sharma',
    category: 'Upskilling',
  },
  {
    quote: 'Rest is not idleness, and to lie sometimes on the grass under trees on a summer day is by no means a waste of time.',
    author: 'John Lubbock',
    category: 'Work-Life Balance',
  },
  {
    quote: 'Focus is a muscle. The more you protect it, the sharper your engineering impact becomes.',
    author: 'Cal Newport',
    category: 'Productivity',
  },
  {
    quote: 'Sharpen your saw before cutting down the tree. Upskilling today saves hours tomorrow.',
    author: 'Stephen Covey',
    category: 'Upskilling',
  },
];

// ==========================================
// 🔐 SUPABASE AUTHENTICATION SERVICES
// ==========================================

export async function signUpUser(email: string, password: string, name: string, title: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          title: title,
        },
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.log('Supabase Sign Up error:', err.message);
    return { success: false, error: err.message || 'Sign up failed' };
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.log('Supabase Sign In error:', err.message);
    return { success: false, error: err.message || 'Invalid email or password' };
  }
}

export async function signOutUser() {
  try {
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    console.log('Supabase Sign Out error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getCurrentUserSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (e) {
    return null;
  }
}


// ==========================================
// 🗄️ SUPABASE POSTGRES BACKEND DATA CRUD
// ==========================================

/**
 * Fetch profile from `zinox_profiles` table
 */
export async function fetchUserProfileFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      return {
        name: data.user_name || 'Alex Vance',
        title: data.user_title || 'Software Engineer',
        avatar: data.avatar_url || null,
        streak: data.streak_days || 1,
        points: data.points || 100,
        level: data.level_name || 'Zen Explorer',
      };
    }
  } catch (e) {
    console.log('Error fetching user profile from Supabase:', e);
  }
  return null;
}

/**
 * Sync user profile to Supabase Postgres `zinox_profiles` table
 */
export async function syncProfileToSupabase(
  userId: string | null,
  profile: {
    name: string;
    title: string;
    avatar?: string | null;
    streak: number;
    points: number;
    level: string;
  }
) {
  if (!userId) return;
  try {
    const { error } = await supabase.from(TABLES.PROFILES).upsert({
      id: userId,
      user_name: profile.name,
      user_title: profile.title,
      avatar_url: profile.avatar,
      streak_days: profile.streak,
      points: profile.points,
      level_name: profile.level,
      updated_at: new Date().toISOString(),
    });
    if (error) console.log('Supabase profile sync error:', error.message);
  } catch (e) {
    console.log('Supabase profile sync fallback');
  }
}

/**
 * Fetch today's balance log from Supabase Postgres `zinox_balance_logs`
 */
export async function fetchTodayBalanceLogs(userId: string) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from(TABLES.BALANCE_LOGS)
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', todayStr)
      .single();

    if (!error && data) {
      return {
        waterDrank: data.water_drank || 0,
        waterGoal: data.water_goal || 8,
        eyeRests: data.eye_rests || 0,
        eyeRestGoal: data.eye_rest_goal || 5,
        stretchesDone: data.stretches_done || 0,
        stretchGoal: data.stretch_goal || 3,
        focusMinutes: data.focus_minutes || 0,
        screenTimeMinutes: 280,
      };
    }
  } catch (e) {
    console.log('Error fetching balance log from Supabase:', e);
  }
  return null;
}

/**
 * Log daily balance metrics to Supabase Postgres `zinox_balance_logs`
 */
export async function logBalanceMetricsToSupabase(
  userId: string | null,
  metrics: {
    waterDrank: number;
    waterGoal: number;
    eyeRests: number;
    eyeRestGoal: number;
    stretchesDone: number;
    stretchGoal: number;
    focusMinutes: number;
  }
) {
  if (!userId) return;
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from(TABLES.BALANCE_LOGS).upsert(
      {
        user_id: userId,
        water_drank: metrics.waterDrank,
        water_goal: metrics.waterGoal,
        eye_rests: metrics.eyeRests,
        eye_rest_goal: metrics.eyeRestGoal,
        stretches_done: metrics.stretchesDone,
        stretch_goal: metrics.stretchGoal,
        focus_minutes: metrics.focusMinutes,
        log_date: todayStr,
      },
      { onConflict: 'user_id,log_date' }
    );
    if (error) console.log('Supabase balance log error:', error.message);
  } catch (e) {
    console.log('Supabase balance log fallback');
  }
}

/**
 * Log upskill progress to Supabase Postgres `zinox_upskill_progress`
 */
export async function logUpskillProgressToSupabase(
  userId: string | null,
  courseId: string,
  lessonId?: string,
  completed: boolean = true,
  quizScore?: number
) {
  if (!userId) return;
  try {
    const { error } = await supabase.from(TABLES.UPSKILL_PROGRESS).insert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId || null,
      completed,
      quiz_score: quizScore || 0,
      updated_at: new Date().toISOString(),
    });
    if (error) console.log('Supabase upskill progress error:', error.message);
  } catch (e) {
    console.log('Supabase upskill log fallback');
  }
}

/**
 * Fetch daily inspiration quote from `zinox_quotes`
 */
export async function fetchDailyQuote(): Promise<DailyQuote> {
  try {
    const { data, error } = await supabase
      .from(TABLES.QUOTES)
      .select('quote, author, category')
      .limit(10);

    if (!error && data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex] as DailyQuote;
    }

    const response = await fetch('https://dummyjson.com/quotes/random');
    if (response.ok) {
      const resData = await response.json();
      return {
        quote: resData.quote || resData.content,
        author: resData.author || 'Anonymous',
        category: 'Inspiration',
      };
    }
  } catch (error) {
    console.log('Supabase/Network quote fetch fallback');
  }

  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[randomIndex];
}

/**
 * Simulated GraphQL client execution connected with Supabase real-time
 */
export async function executeGraphQLQuery() {
  try {
    const { data } = await supabase.from(TABLES.QUOTES).select('id, quote').limit(1);
    return {
      status: 'success',
      graphql: true,
      data: data || {
        featuredSkill: 'AI Vector Search & Embeddings',
      },
    };
  } catch (e) {
    console.log('GraphQL mock fallback');
  }

  return {
    status: 'success',
    graphql: true,
    data: {
      featuredSkill: 'AI Vector Search & Embeddings',
    },
  };
}
