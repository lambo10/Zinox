import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { HomeScreen } from './src/screens/HomeScreen';
import { BalanceScreen } from './src/screens/BalanceScreen';
import { UpskillScreen } from './src/screens/UpskillScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { useZinoxStore } from './src/store/useZinoxStore';
import { supabase } from './src/services/supabaseClient';
import { COLORS } from './src/theme/colors';

import { Home, HeartPulse, BookOpen, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const ZinoxDarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
    border: COLORS.cardBorder,
    primary: COLORS.primary,
  },
};

export default function App() {
  const { session, setSession, authLoading } = useZinoxStore();

  useEffect(() => {
    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Foreground notifications listener
    if (Platform.OS !== 'web') {
      try {
        const notifSub = Notifications.addNotificationReceivedListener((notification) => {
          console.log('Notification received:', notification.request.content.title);
        });
        return () => {
          notifSub.remove();
          subscription.unsubscribe();
        };
      } catch (e) {
        console.log('Notification listener warning:', e);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing Zinox...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      {session ? (
        <NavigationContainer theme={ZinoxDarkTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.textSecondary,
              tabBarLabelStyle: styles.tabBarLabel,
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: 'Dashboard',
                tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Balance"
              component={BalanceScreen}
              options={{
                tabBarLabel: 'Balance',
                tabBarIcon: ({ color, size }) => <HeartPulse color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Upskill"
              component={UpskillScreen}
              options={{
                tabBarLabel: 'Upskill',
                tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                tabBarLabel: 'Profile',
                tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      ) : (
        <AuthScreen />
      )}
    </SafeAreaProvider>
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
  tabBar: {
    backgroundColor: COLORS.cardBg,
    borderTopColor: COLORS.cardBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
