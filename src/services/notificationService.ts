import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Set up notification behavior for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
}

export async function triggerLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
        return;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
          return;
        }
      }
    }
    Alert.alert(`🔔 ${title}`, body);
    return;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please enable notifications in your system settings.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚡ ${title}`,
        body: body,
        sound: true,
        data: data || { app: 'Zinox' },
      },
      trigger: null, // trigger immediately
    });
  } catch (error) {
    console.log('Error triggering notification:', error);
    Alert.alert(`🔔 ${title}`, body);
  }
}

export async function scheduleBreakReminder(secondsFromNow: number = 10) {
  const title = 'Zinox Work-Life Balance Break';
  const body = 'Time to step away from your screen, stretch your shoulders, and drink a glass of water!';

  if (Platform.OS === 'web') {
    setTimeout(() => {
      triggerLocalNotification(title, body);
    }, secondsFromNow * 1000);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🧘 ${title}`,
        body: body,
        sound: true,
      },
      trigger: {
        seconds: secondsFromNow,
      },
    });
  } catch (e) {
    console.log('Scheduled break reminder fallback:', e);
  }
}
