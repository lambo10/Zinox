import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

export const SUPABASE_URL = 'https://tefvknjmgafecdjdffiu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_DOZYYTKQYlPZ618A0hHFCg_etYACexP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Table Name Constants with `zinox_` prefix requirement
export const TABLES = {
  PROFILES: 'zinox_profiles',
  BALANCE_LOGS: 'zinox_balance_logs',
  UPSKILL_PROGRESS: 'zinox_upskill_progress',
  QUOTES: 'zinox_quotes',
} as const;

export interface ZinoxProfile {
  id: string;
  user_name: string;
  user_title: string;
  avatar_url?: string | null;
  streak_days: number;
  points: number;
  level_name: string;
  updated_at?: string;
}

export interface ZinoxBalanceLog {
  id?: string;
  user_id: string;
  water_drank: number;
  water_goal: number;
  eye_rests: number;
  eye_rest_goal: number;
  stretches_done: number;
  stretch_goal: number;
  focus_minutes: number;
  log_date: string;
}

export interface ZinoxUpskillProgress {
  id?: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  completed: boolean;
  quiz_score?: number;
  updated_at?: string;
}
