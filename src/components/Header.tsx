import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS } from '../theme/colors';
import { Flame, Bell, Sparkles, User } from 'lucide-react-native';
import { triggerLocalNotification } from '../services/notificationService';

interface HeaderProps {
  onPressProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPressProfile }) => {
  const { user } = useZinoxStore();

  const handleNotificationPress = () => {
    triggerLocalNotification(
      'Daily Upskilling & Rest Reminder',
      'You are on a 14-day streak! Keep up the work-life balance and complete today’s 10-min RAG module.'
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity style={styles.profileSection} onPress={onPressProfile} activeOpacity={0.8}>
        <View style={styles.avatarWrapper}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User color={COLORS.primary} size={24} />
            </View>
          )}
          <View style={styles.onlineBadge} />
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            <Sparkles color={COLORS.warning} size={14} style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.userTitle}>{user.title}</Text>
        </View>
      </TouchableOpacity>

      {/* Badges & Actions */}
      <View style={styles.rightSection}>
        {/* Streak Badge */}
        <View style={styles.streakBadge}>
          <Flame color={COLORS.danger} size={16} fill={COLORS.danger} />
          <Text style={styles.streakText}>{user.streak}d</Text>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Bell color={COLORS.textPrimary} size={20} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
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
