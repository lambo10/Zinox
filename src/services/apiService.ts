import { DailyQuote } from '../store/useZinoxStore';
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

/**
 * Fetches daily inspiration quote from Supabase Postgres `zinox_quotes` table,
 * falling back to public quote API or pre-seeded fallback list.
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

    // Try public API if DB is empty
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
 * Sync user profile to Supabase Postgres `zinox_profiles` table
 */
export async function syncProfileToSupabase(profile: {
  name: string;
  title: string;
  avatar?: string | null;
  streak: number;
  points: number;
  level: string;
}) {
  try {
    const { error } = await supabase.from(TABLES.PROFILES).upsert({
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
    console.log('Supabase profile sync offline fallback');
  }
}

/**
 * Log daily balance metrics to Supabase Postgres `zinox_balance_logs` table
 */
export async function logBalanceMetricsToSupabase(metrics: {
  waterDrank: number;
  waterGoal: number;
  eyeRests: number;
  eyeRestGoal: number;
  stretchesDone: number;
  stretchGoal: number;
  focusMinutes: number;
}) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from(TABLES.BALANCE_LOGS).upsert({
      water_drank: metrics.waterDrank,
      water_goal: metrics.waterGoal,
      eye_rests: metrics.eyeRests,
      eye_rest_goal: metrics.eyeRestGoal,
      stretches_done: metrics.stretchesDone,
      stretch_goal: metrics.stretchGoal,
      focus_minutes: metrics.focusMinutes,
      log_date: todayStr,
    });
    if (error) console.log('Supabase balance log error:', error.message);
  } catch (e) {
    console.log('Supabase balance log offline fallback');
  }
}

/**
 * Log upskill progress to Supabase Postgres `zinox_upskill_progress` table
 */
export async function logUpskillProgressToSupabase(
  courseId: string,
  lessonId?: string,
  completed: boolean = true,
  quizScore?: number
) {
  try {
    const { error } = await supabase.from(TABLES.UPSKILL_PROGRESS).insert({
      course_id: courseId,
      lesson_id: lessonId || null,
      completed,
      quiz_score: quizScore || 0,
      updated_at: new Date().toISOString(),
    });
    if (error) console.log('Supabase upskill progress error:', error.message);
  } catch (e) {
    console.log('Supabase upskill log offline fallback');
  }
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
