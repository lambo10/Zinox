import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator, Dimensions, LayoutChangeEvent } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { HomeScreen } from './src/screens/HomeScreen';
import { BalanceScreen } from './src/screens/BalanceScreen';
import { UpskillScreen } from './src/screens/UpskillScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { useZinoxStore } from './src/store/useZinoxStore';
import { supabase } from './src/services/supabaseClient';
import { COLORS, SHADOWS, SPRING_CONFIG, useThemeColors, DARK_COLORS, LIGHT_COLORS } from './src/theme/colors';
import { AnimatedPressable } from './src/components/AnimatedPressable';

import { Home, HeartPulse, BookOpen, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const ZinoxDarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: DARK_COLORS.background,
    card: DARK_COLORS.cardBg,
    text: DARK_COLORS.textPrimary,
    border: DARK_COLORS.cardBorder,
    primary: DARK_COLORS.primary,
  },
};

const ZinoxLightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: LIGHT_COLORS.background,
    card: LIGHT_COLORS.cardBg,
    text: LIGHT_COLORS.textPrimary,
    border: LIGHT_COLORS.cardBorder,
    primary: LIGHT_COLORS.primary,
  },
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Zinox ErrorBoundary caught runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Application Error</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || this.state.error?.toString() || 'An unexpected error occurred.'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Custom iOS Floating Bottom Tab Bar Component with Reanimated Pill Slider & Icon Scale
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const themeMode = useZinoxStore((s) => s.themeMode);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerPadding = 4;
  const tabWidth = containerWidth > 0 ? (containerWidth - containerPadding * 2) / state.routes.length : 0;

  const translateX = useSharedValue(containerPadding);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(state.index * tabWidth + containerPadding, SPRING_CONFIG);
    }
  }, [state.index, tabWidth]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: tabWidth,
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[
        styles.tabBarWrapper,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <BlurView
        intensity={85}
        tint={themeMode === 'dark' ? 'dark' : 'light'}
        style={[
          styles.tabBarContainer,
          SHADOWS.iosFloat,
          {
            backgroundColor: themeMode === 'dark' ? 'rgba(20, 24, 41, 0.65)' : 'rgba(255, 255, 255, 0.70)',
            borderColor: colors.cardBorder,
          },
        ]}
        onLayout={handleLayout}
      >
        {/* Animated Sliding Pill Indicator */}
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.activePillIndicator,
              pillAnimatedStyle,
              { backgroundColor: colors.accentGlow, borderColor: colors.primary },
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              try {
                Haptics.selectionAsync();
              } catch (e) {}
              navigation.navigate(route.name);
            }
          };

          const getIcon = () => {
            const color = isFocused ? colors.primary : colors.textSecondary;
            const size = 20;
            switch (route.name) {
              case 'Home':
                return <Home color={color} size={size} />;
              case 'Balance':
                return <HeartPulse color={color} size={size} />;
              case 'Upskill':
                return <BookOpen color={color} size={size} />;
              case 'Profile':
                return <User color={color} size={size} />;
              default:
                return null;
            }
          };

          const getLabel = () => {
            if (options.tabBarLabel !== undefined) {
              return options.tabBarLabel as string;
            }
            return route.name;
          };

          return (
            <AnimatedPressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeScale={0.92}
              enableHaptics={false}
            >
              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
                {getIcon()}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary : colors.textSecondary },
                  isFocused && styles.activeTabLabel,
                ]}
              >
                {getLabel()}
              </Text>
            </AnimatedPressable>
          );
        })}
      </BlurView>
    </View>
  );
};

export default function App() {
  const { session, setSession, authLoading, themeMode } = useZinoxStore();
  const colors = useThemeColors();

  useEffect(() => {
    let isMounted = true;

    // Safety fallback timeout to ensure authLoading resolves even if Supabase is offline
    const timeoutId = setTimeout(() => {
      if (isMounted && useZinoxStore.getState().authLoading) {
        console.warn('Auth loading timeout: unblocking UI');
        useZinoxStore.setState({ authLoading: false });
      }
    }, 2500);

    // Check initial auth session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (isMounted) setSession(session);
      })
      .catch((err) => {
        console.error('Supabase getSession error:', err);
        if (isMounted) useZinoxStore.setState({ authLoading: false });
      });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setSession(session);
    });

    // Foreground notifications listener
    if (Platform.OS !== 'web') {
      try {
        const notifSub = Notifications.addNotificationReceivedListener((notification) => {
          console.log('Notification received:', notification.request.content.title);
        });
        return () => {
          isMounted = false;
          clearTimeout(timeoutId);
          notifSub.remove();
          subscription.unsubscribe();
        };
      } catch (e) {
        console.log('Notification listener warning:', e);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Initializing Zinox...</Text>
      </View>
    );
  }

  const activeNavTheme = themeMode === 'dark' ? ZinoxDarkTheme : ZinoxLightTheme;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
        {session ? (
          <NavigationContainer theme={activeNavTheme}>
            <Tab.Navigator
              tabBar={(props) => <CustomTabBar {...props} />}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  tabBarLabel: 'Dashboard',
                }}
              />
              <Tab.Screen
                name="Balance"
                component={BalanceScreen}
                options={{
                  tabBarLabel: 'Balance',
                }}
              />
              <Tab.Screen
                name="Upskill"
                component={UpskillScreen}
                options={{
                  tabBarLabel: 'Upskill',
                }}
              />
              <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  tabBarLabel: 'Profile',
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        ) : (
          <AuthScreen />
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgGlass,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: 64,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  activePillIndicator: {
    position: 'absolute',
    left: 0,
    top: 5,
    bottom: 5,
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.45)',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  errorContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: COLORS.danger,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});


