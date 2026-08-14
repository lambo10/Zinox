import { create } from 'zustand';
import { updateGlobalColors, ThemeMode } from '../theme/colors';
import {
  syncProfileToSupabase,
  logBalanceMetricsToSupabase,
  logUpskillProgressToSupabase,
  fetchUserProfileFromSupabase,
  fetchTodayBalanceLogs,
  signOutUser,
  bootstrapSupabaseData,
} from '../services/apiService';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  completed: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UpskillCourse {
  id: string;
  title: string;
  category: 'AI & Code' | 'Leadership' | 'Wellness' | 'Architecture';
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  completed: boolean;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface UserProfile {
  name: string;
  title: string;
  avatar: string | null;
  streak: number;
  points: number;
  level: string;
}

export interface BalanceMetrics {
  waterDrank: number;
  waterGoal: number;
  eyeRests: number;
  eyeRestGoal: number;
  stretchesDone: number;
  stretchGoal: number;
  focusMinutes: number;
  screenTimeMinutes: number;
}

export interface DailyQuote {
  quote: string;
  author: string;
  category: string;
}

interface ZinoxState {
  session: any;
  userId: string | null;
  userEmail: string | null;
  authLoading: boolean;

  user: UserProfile;
  metrics: BalanceMetrics;
  courses: UpskillCourse[];
  dailyQuote: DailyQuote;
  notificationsEnabled: boolean;
  activeCourseId: string | null;
  themeMode: ThemeMode;

  // Actions
  setSession: (session: any) => void;
  signOut: () => Promise<void>;
  loadUserDataFromBackend: (userId: string) => Promise<void>;

  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  updateAvatar: (uri: string | null) => void;
  updateUserProfile: (name: string, title: string) => void;
  logWater: () => void;
  logEyeRest: () => void;
  logStretch: () => void;
  addFocusMinutes: (minutes: number) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  completeCourseQuiz: (courseId: string, scorePercentage: number) => void;
  setDailyQuote: (quote: DailyQuote) => void;
  toggleNotifications: () => void;
  resetDailyMetrics: () => void;
}

const INITIAL_COURSES: UpskillCourse[] = [
  {
    id: 'course-1',
    title: 'AI Engineering: RAG & System Prompting',
    category: 'AI & Code',
    description: 'Master Retrieval-Augmented Generation architectures, embeddings, and context window optimization.',
    duration: '15 mins',
    difficulty: 'Intermediate',
    progress: 40,
    completed: false,
    lessons: [
      {
        id: 'l1',
        title: 'Understanding Vector Embeddings & Similarity Search',
        duration: '5 mins',
        content: 'Vector embeddings transform text into dense numerical representations. Using cosine similarity algorithms, models retrieve precise semantic context from knowledge bases fast.',
        completed: true,
      },
      {
        id: 'l2',
        title: 'Chunking Strategies & Hybrid Search',
        duration: '5 mins',
        content: 'Effective chunking balances token budget and semantic coherence. Overlapping sliding windows (e.g. 512 tokens with 50-token overlap) prevent context fragmentation.',
        completed: false,
      },
      {
        id: 'l3',
        title: 'System Prompt Engineering Best Practices',
        duration: '5 mins',
        content: 'Structure system instructions using explicit XML or Markdown tags (<context>, <instructions>, <constraints>) to improve adherence and minimize hallucinations.',
        completed: false,
      },
    ],
    quiz: [
      {
        question: 'Which metric is commonly used to measure distance between vector embeddings?',
        options: ['Manhattan Distance', 'Cosine Similarity', 'Hamming Code', 'Standard Deviation'],
        correctIndex: 1,
        explanation: 'Cosine similarity measures the angle between vectors, ideal for high-dimensional semantic spaces.',
      },
      {
        question: 'Why is text chunking important in RAG?',
        options: [
          'It formats output into HTML',
          'It fits context window limits while preserving semantic meaning',
          'It encrypts sensitive database records',
          'It speeds up GPU compilation'
        ],
        correctIndex: 1,
        explanation: 'Chunking breaks large documents into manageable segments suitable for embedding and LLM prompt windows.',
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Mindful Tech Leadership: Preventing Burnout',
    category: 'Leadership',
    description: 'Practical strategies for managing cognitive load, setting Async boundaries, and high-impact delegation.',
    duration: '10 mins',
    difficulty: 'Beginner',
    progress: 75,
    completed: false,
    lessons: [
      {
        id: 'l1',
        title: 'The Neuroscience of Context Switching',
        duration: '3 mins',
        content: 'Task switching incurs cognitive debt. It takes an average of 23 minutes to refocus after a distraction. Batching communication creates protected focus blocks.',
        completed: true,
      },
      {
        id: 'l2',
        title: 'Asynchronous Communication Frameworks',
        duration: '4 mins',
        content: 'Defaulting to rich async documents (RFCs, decision logs) reduces real-time meeting fatigue and empowers distributed team autonomy.',
        completed: true,
      },
      {
        id: 'l3',
        title: 'Micro-Rest Protocols for Engineers',
        duration: '3 mins',
        content: 'The 20-20-20 rule and 90-minute ultradian rhythm rest breaks recharge prefrontal cortex energy before fatigue sets in.',
        completed: false,
      },
    ],
    quiz: [
      {
        question: 'How long does it take on average to regain deep focus after a context interruption?',
        options: ['2 minutes', '5 minutes', '23 minutes', '1 hour'],
        correctIndex: 2,
        explanation: 'Research indicates cognitive context switching costs average ~23 minutes of focus recovery time.',
      },
    ],
  },
  {
    id: 'course-3',
    title: 'React Native 0.74+ & Reanimated 3 Mastery',
    category: 'Architecture',
    description: 'Build 60FPS fluid mobile UIs with worklets, shared element transitions, and gesture handler hooks.',
    duration: '20 mins',
    difficulty: 'Advanced',
    progress: 10,
    completed: false,
    lessons: [
      {
        id: 'l1',
        title: 'UI Thread vs JS Thread Worklets',
        duration: '6 mins',
        content: 'Reanimated worklets run directly on the UI thread via JSI (JavaScript Interface), bypassing asynchronous bridge overhead for smooth animations.',
        completed: false,
      },
      {
        id: 'l2',
        title: 'useSharedValue & useAnimatedStyle Hooks',
        duration: '7 mins',
        content: 'Shared values hold mutable animation values accessed across threads. useAnimatedStyle generates reactive dynamic styles driven by worklets.',
        completed: false,
      },
      {
        id: 'l3',
        title: 'Gesture Driven Physics Animations',
        duration: '7 mins',
        content: 'Combine Gesture.Pan() with withSpring() and withDecay() physics curves to build interactive swipeable cards and drawer sheets.',
        completed: false,
      },
    ],
    quiz: [
      {
        question: 'Where do Reanimated worklets execute animation frames?',
        options: ['Main Network Thread', 'JS Event Loop Thread', 'UI Thread (Native)', 'Node Web Worker'],
        correctIndex: 2,
        explanation: 'Worklets compile into C++ functions executed directly on the UI thread for instant 60 FPS feedback.',
      },
    ],
  },
  {
    id: 'course-4',
    title: 'Digital Wellness & Ergonomics for Developers',
    category: 'Wellness',
    description: 'Posture alignment, circadian lighting hacks, and reducing eye fatigue during intense coding marathons.',
    duration: '8 mins',
    difficulty: 'Beginner',
    progress: 100,
    completed: true,
    lessons: [
      {
        id: 'l1',
        title: 'Monitor Height & Lumbar Posture setup',
        duration: '4 mins',
        content: 'Top edge of monitor should align at eye level. Elbows bent at 90 degrees with neutral wrist positioning avoids carpal strain.',
        completed: true,
      },
      {
        id: 'l2',
        title: 'Circadian Light & Blue Light Management',
        duration: '4 mins',
        content: 'Morning natural light exposure boosts melatonin synthesis for nighttime deep sleep recovery.',
        completed: true,
      },
    ],
    quiz: [
      {
        question: 'Where should the top of your primary display monitor be positioned?',
        options: ['Above eye level', 'At or slightly below eye level', 'Chambered near desk level', '45 degrees tilted up'],
        correctIndex: 1,
        explanation: 'Aligning top of screen with eye level maintains neutral neck alignment and reduces cervical strain.',
      },
    ],
  },
];

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Zinox User',
  title: 'Software Developer',
  avatar: null,
  streak: 1,
  points: 100,
  level: 'Zen Explorer',
};

const DEFAULT_METRICS: BalanceMetrics = {
  waterDrank: 0,
  waterGoal: 8,
  eyeRests: 0,
  eyeRestGoal: 5,
  stretchesDone: 0,
  stretchGoal: 3,
  focusMinutes: 0,
  screenTimeMinutes: 240,
};

export const useZinoxStore = create<ZinoxState>((set, get) => ({
  session: null,
  userId: null,
  userEmail: null,
  authLoading: true,

  user: DEFAULT_USER_PROFILE,
  metrics: DEFAULT_METRICS,
  courses: INITIAL_COURSES,
  dailyQuote: {
    quote: 'Balance is not something you find, it is something you create.',
    author: 'Jana Kingsford',
    category: 'Mindfulness',
  },
  notificationsEnabled: true,
  activeCourseId: null,
  themeMode: 'dark',

  setThemeMode: (mode) => {
    updateGlobalColors(mode);
    set({ themeMode: mode });
  },

  toggleThemeMode: () => {
    const nextMode: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
    updateGlobalColors(nextMode);
    set({ themeMode: nextMode });
  },

  setSession: (session) => {
    const userId = session?.user?.id || null;
    const email = session?.user?.email || null;
    set({ session, userId, userEmail: email, authLoading: false });

    if (userId) {
      get().loadUserDataFromBackend(userId);
    }
  },

  signOut: async () => {
    await signOutUser();
    set({
      session: null,
      userId: null,
      userEmail: null,
      authLoading: false,
      user: DEFAULT_USER_PROFILE,
      metrics: DEFAULT_METRICS,
    });
  },

  loadUserDataFromBackend: async (userId: string) => {
    // 0. Bootstrap tables if empty
    await bootstrapSupabaseData();

    // 1. Fetch Profile from Supabase
    const backendProfile = await fetchUserProfileFromSupabase(userId);
    if (backendProfile) {
      set({ user: backendProfile });
    } else {
      // Build clean initial profile specifically for this user
      const sessionUser = get().session?.user;
      const fallbackName = sessionUser?.user_metadata?.full_name || sessionUser?.email?.split('@')[0] || 'Zinox User';
      const fallbackTitle = sessionUser?.user_metadata?.title || 'Software Developer';

      const initialProfile: UserProfile = {
        name: fallbackName,
        title: fallbackTitle,
        avatar: null,
        streak: 1,
        points: 100,
        level: 'Zen Explorer',
      };

      set({ user: initialProfile });
      await syncProfileToSupabase(userId, initialProfile);
    }

    // 2. Fetch Balance Logs from Supabase
    const backendLogs = await fetchTodayBalanceLogs(userId);
    if (backendLogs) {
      set((state) => ({ metrics: { ...state.metrics, ...backendLogs } }));
    } else {
      set({ metrics: DEFAULT_METRICS });
    }
  },

  updateAvatar: (uri) =>
    set((state) => {
      const updatedUser = { ...state.user, avatar: uri };
      syncProfileToSupabase(state.userId, updatedUser);
      return { user: updatedUser };
    }),

  updateUserProfile: (name, title) =>
    set((state) => {
      const updatedUser = { ...state.user, name, title };
      syncProfileToSupabase(state.userId, updatedUser);
      return { user: updatedUser };
    }),

  logWater: () =>
    set((state) => {
      const newWater = Math.min(state.metrics.waterDrank + 1, state.metrics.waterGoal + 4);
      const updatedMetrics = { ...state.metrics, waterDrank: newWater };
      const updatedUser = { ...state.user, points: state.user.points + 25 };
      logBalanceMetricsToSupabase(state.userId, updatedMetrics);
      syncProfileToSupabase(state.userId, updatedUser);
      return { metrics: updatedMetrics, user: updatedUser };
    }),

  logEyeRest: () =>
    set((state) => {
      const newRest = Math.min(state.metrics.eyeRests + 1, state.metrics.eyeRestGoal + 3);
      const updatedMetrics = { ...state.metrics, eyeRests: newRest };
      const updatedUser = { ...state.user, points: state.user.points + 40 };
      logBalanceMetricsToSupabase(state.userId, updatedMetrics);
      syncProfileToSupabase(state.userId, updatedUser);
      return { metrics: updatedMetrics, user: updatedUser };
    }),

  logStretch: () =>
    set((state) => {
      const newStretch = Math.min(state.metrics.stretchesDone + 1, state.metrics.stretchGoal + 2);
      const updatedMetrics = { ...state.metrics, stretchesDone: newStretch };
      const updatedUser = { ...state.user, points: state.user.points + 50 };
      logBalanceMetricsToSupabase(state.userId, updatedMetrics);
      syncProfileToSupabase(state.userId, updatedUser);
      return { metrics: updatedMetrics, user: updatedUser };
    }),

  addFocusMinutes: (minutes) =>
    set((state) => {
      const updatedMetrics = {
        ...state.metrics,
        focusMinutes: state.metrics.focusMinutes + minutes,
      };
      const updatedUser = { ...state.user, points: state.user.points + minutes * 2 };
      logBalanceMetricsToSupabase(state.userId, updatedMetrics);
      syncProfileToSupabase(state.userId, updatedUser);
      return { metrics: updatedMetrics, user: updatedUser };
    }),

  completeLesson: (courseId, lessonId) =>
    set((state) => {
      const updatedCourses = state.courses.map((course) => {
        if (course.id !== courseId) return course;
        const updatedLessons = course.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed: true } : l
        );
        const completedCount = updatedLessons.filter((l) => l.completed).length;
        const progress = Math.round((completedCount / updatedLessons.length) * 100);
        return {
          ...course,
          lessons: updatedLessons,
          progress,
          completed: progress === 100,
        };
      });

      const updatedUser = { ...state.user, points: state.user.points + 50 };
      logUpskillProgressToSupabase(state.userId, courseId, lessonId, true);
      syncProfileToSupabase(state.userId, updatedUser);

      return {
        courses: updatedCourses,
        user: updatedUser,
      };
    }),

  completeCourseQuiz: (courseId, scorePercentage) =>
    set((state) => {
      const updatedCourses = state.courses.map((course) => {
        if (course.id !== courseId) return course;
        return { ...course, completed: true, progress: 100 };
      });
      const bonusPoints = Math.round(scorePercentage * 2);
      const updatedUser = { ...state.user, points: state.user.points + bonusPoints };
      logUpskillProgressToSupabase(state.userId, courseId, undefined, true, scorePercentage);
      syncProfileToSupabase(state.userId, updatedUser);

      return {
        courses: updatedCourses,
        user: updatedUser,
      };
    }),

  setDailyQuote: (quote) => set({ dailyQuote: quote }),

  toggleNotifications: () =>
    set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

  resetDailyMetrics: () =>
    set((state) => {
      const updatedMetrics = {
        ...state.metrics,
        waterDrank: 0,
        eyeRests: 0,
        stretchesDone: 0,
        focusMinutes: 0,
      };
      logBalanceMetricsToSupabase(state.userId, updatedMetrics);
      return { metrics: updatedMetrics };
    }),
}));
