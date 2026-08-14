import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, useThemeColors } from '../theme/colors';
import { Flame, Bell, Sparkles, User } from 'lucide-react-native';
import { triggerLocalNotification } from '../services/notificationService';
import { AnimatedPressable } from './AnimatedPressable';

interface HeaderProps {
  onPressProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPressProfile }) => {
  const { user } = useZinoxStore();
  const colors = useThemeColors();

  // Animation values
  const pulseDotOpacity = useSharedValue(0.6);
  const flameScale = useSharedValue(1);

  useEffect(() => {
    pulseDotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );

    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 900 }),
        withTiming(1.0, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseDotOpacity.value,
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const handleNotificationPress = () => {
    triggerLocalNotification(
      'Daily Upskilling & Rest Reminder ⚡',
      'You are on a 14-day streak! Keep up the work-life balance and complete today’s 10-min RAG module.'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Section */}
      <AnimatedPressable
        style={styles.profileSection}
        onPress={onPressProfile}
        activeScale={0.97}
      >
        <View style={styles.avatarWrapper}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={[styles.avatarImage, { borderColor: colors.primary }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.cardBgLight, borderColor: colors.primary }]}>
              <User color={colors.primary} size={24} />
            </View>
          )}
          <Animated.View style={[styles.onlineBadge, pulseStyle, { backgroundColor: colors.success, borderColor: colors.background }]} />
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
            <Sparkles color={colors.warning} size={14} style={{ marginLeft: 4 }} />
          </View>
          <Text style={[styles.userTitle, { color: colors.textSecondary }]}>{user.title}</Text>
        </View>
      </AnimatedPressable>

      {/* Badges & Actions */}
      <View style={styles.rightSection}>
        {/* Streak Badge */}
        <View style={styles.streakBadge}>
          <Animated.View style={flameStyle}>
            <Flame color={colors.danger} size={16} fill={colors.danger} />
          </Animated.View>
          <Text style={[styles.streakText, { color: colors.danger }]}>{user.streak}d</Text>
        </View>

        {/* Notification Bell */}
        <AnimatedPressable
          style={[styles.iconButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={handleNotificationPress}
          activeScale={0.92}
        >
          <Bell color={colors.textPrimary} size={20} />
          <Animated.View style={[styles.bellDot, pulseStyle, { backgroundColor: colors.secondary }]} />
        </AnimatedPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.cardBgLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userInfo: {
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  streakText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
});

