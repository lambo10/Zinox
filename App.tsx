import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { HomeScreen } from './src/screens/HomeScreen';
import { BalanceScreen } from './src/screens/BalanceScreen';
import { UpskillScreen } from './src/screens/UpskillScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
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
  useEffect(() => {
    // Setup foreground notification listener
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification.request.content.title);
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.background} />
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
