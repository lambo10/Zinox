import { useZinoxStore } from '../store/useZinoxStore';

export type ThemeMode = 'dark' | 'light';

export const DARK_COLORS = {
  background: '#090B13',
  cardBg: '#141829',
  cardBgLight: '#1C223B',
  cardBgGlass: 'rgba(20, 24, 41, 0.85)',
  cardBorder: '#2A3254',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Brand & Accent Colors
  primary: '#8B5CF6',     // Violet Neon
  primaryDark: '#6D28D9',
  secondary: '#06B6D4',   // Cyber Cyan
  secondaryDark: '#0891B2',
  success: '#10B981',     // Emerald Balance
  successLight: '#A7F3D0',
  warning: '#F59E0B',     // Amber Energy
  danger: '#F43F5E',      // Rose Streak
  accentGlow: 'rgba(139, 92, 246, 0.15)',
  iosBlue: '#0A84FF',
  iosSystemGray: '#1C1C1E',
  iosSystemGray2: '#2C2C2E',
  iosSystemGray3: '#3A3A3C',

  // Gradients
  gradientPrimary: ['#8B5CF6', '#06B6D4'],
  gradientBalance: ['#10B981', '#06B6D4'],
  gradientStreak: ['#F43F5E', '#F59E0B'],
  gradientCard: ['#1A1E36', '#121526'],
  gradientGlass: ['rgba(30, 36, 62, 0.8)', 'rgba(15, 18, 32, 0.8)'],
};

export const LIGHT_COLORS = {
  background: '#F1F5F9',
  cardBg: '#FFFFFF',
  cardBgLight: '#F8FAFC',
  cardBgGlass: 'rgba(255, 255, 255, 0.90)',
  cardBorder: '#E2E8F0',
  cardBorderSubtle: 'rgba(0, 0, 0, 0.06)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Brand & Accent Colors
  primary: '#7C3AED',     // Deep Violet
  primaryDark: '#5B21B6',
  secondary: '#0891B2',   // Deep Cyan
  secondaryDark: '#0E7490',
  success: '#059669',     // Emerald
  successLight: '#D1FAE5',
  warning: '#D97706',     // Amber
  danger: '#E11D48',      // Rose
  accentGlow: 'rgba(124, 58, 237, 0.12)',
  iosBlue: '#007AFF',
  iosSystemGray: '#E5E5EA',
  iosSystemGray2: '#D1D1D6',
  iosSystemGray3: '#C7C7CC',

  // Gradients
  gradientPrimary: ['#7C3AED', '#0891B2'],
  gradientBalance: ['#059669', '#0891B2'],
  gradientStreak: ['#E11D48', '#D97706'],
  gradientCard: ['#FFFFFF', '#F8FAFC'],
  gradientGlass: ['rgba(255, 255, 255, 0.95)', 'rgba(241, 245, 249, 0.95)'],
};

export const getThemeColors = (mode: ThemeMode) => (mode === 'light' ? LIGHT_COLORS : DARK_COLORS);

export const useThemeColors = () => {
  const themeMode = useZinoxStore((state) => state.themeMode);
  return getThemeColors(themeMode);
};

// Default export COLORS object for backward compatibility
export const COLORS = { ...DARK_COLORS };

export const updateGlobalColors = (mode: ThemeMode) => {
  Object.assign(COLORS, mode === 'light' ? LIGHT_COLORS : DARK_COLORS);
};

export const SHADOWS = {
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iosFloat: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};
