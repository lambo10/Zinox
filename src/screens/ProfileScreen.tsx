import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS, SPRING_CONFIG, useThemeColors, ThemeMode } from '../theme/colors';
import {
  User,
  Camera,
  Image as ImageIcon,
  Flame,
  Award,
  Bell,
  CheckCircle,
  Shield,
  Trash2,
  X,
  Sparkles,
  Zap,
  Moon,
  Sun,
} from 'lucide-react-native';
import { pickImageFromLibrary, takePhotoWithCamera } from '../services/imagePickerService';
import { triggerLocalNotification } from '../services/notificationService';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { SegmentedControl, SegmentOption } from '../components/SegmentedControl';

export const ProfileScreen: React.FC = () => {
  const colors = useThemeColors();
  const {
    user,
    updateAvatar,
    notificationsEnabled,
    toggleNotifications,
    resetDailyMetrics,
    signOut,
    themeMode,
    setThemeMode,
  } = useZinoxStore();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const themeOptions: SegmentOption<ThemeMode>[] = [
    { key: 'dark', label: 'Dark Mode 🌙' },
    { key: 'light', label: 'Light Mode ☀️' },
  ];

  // Animations
  const flamePulse = useSharedValue(1);
  const sheetTranslateY = useSharedValue(300);

  useEffect(() => {
    flamePulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1.0, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (showPhotoModal) {
      sheetTranslateY.value = withSpring(0, SPRING_CONFIG);
    } else {
      sheetTranslateY.value = 300;
    }
  }, [showPhotoModal]);

  const flameAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flamePulse.value }],
  }));

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const handlePickLibrary = async () => {
    setShowPhotoModal(false);
    const uri = await pickImageFromLibrary();
    if (uri) {
      updateAvatar(uri);
      triggerLocalNotification(
        'Profile Photo Updated! 📸',
        'Your new profile avatar has been saved successfully.'
      );
    }
  };

  const handleTakePhoto = async () => {
    setShowPhotoModal(false);
    const uri = await takePhotoWithCamera();
    if (uri) {
      updateAvatar(uri);
      triggerLocalNotification(
        'Profile Photo Captured! 📷',
        'Your new photo has been set as your Zinox avatar.'
      );
    }
  };

  const handleTestPushNotification = () => {
    triggerLocalNotification(
      'Zinox Smart Push Alert ⚡',
      'Hydration Check: Time for your 6th water glass today! Keep up your 14-day balance streak.'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={[styles.avatarImage, { borderColor: colors.primary }]} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.cardBgLight, borderColor: colors.primary }]}>
                  <User color={colors.primary} size={40} />
                </View>
              )}
              <AnimatedPressable
                style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.cardBg }]}
                onPress={() => setShowPhotoModal(true)}
                activeScale={0.82}
              >
                <Camera color="#FFFFFF" size={16} />
              </AnimatedPressable>
            </View>

            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
            <Text style={[styles.userTitle, { color: colors.textSecondary }]}>{user.title}</Text>

            <View style={styles.levelTag}>
              <Sparkles color={colors.warning} size={14} />
              <Text style={styles.levelTagText}>{user.level} (Level 5)</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsBar, { backgroundColor: colors.cardBgLight }]}>
            <View style={styles.statItem}>
              <Animated.View style={flameAnimStyle}>
                <Flame color={colors.danger} size={20} fill={colors.danger} />
              </Animated.View>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{user.streak} Days</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Balance Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statItem}>
              <Zap color={colors.warning} size={20} fill={colors.warning} />
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{user.points} XP</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Zinox Score</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statItem}>
              <Award color={colors.primary} size={20} />
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>4 Badges</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Upskill Level</Text>
            </View>
          </View>
        </View>

        {/* App Appearance & Theme Settings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>App Appearance & Theme</Text>
        </View>
        <View style={[styles.settingCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              {themeMode === 'dark' ? (
                <Moon color={colors.primary} size={20} />
              ) : (
                <Sun color={colors.warning} size={20} />
              )}
            </View>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Interface Color Theme</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                {themeMode === 'dark' ? 'Sleek OLED Dark Mode' : 'Clean Modern Light Mode'}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <SegmentedControl
              options={themeOptions}
              selectedKey={themeMode}
              onSelect={(newMode) => setThemeMode(newMode)}
            />
          </View>
        </View>

        {/* Native Feature Settings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Native Feature Integrations</Text>
        </View>

        {/* Expo Notifications Settings */}
        <View style={[styles.settingCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Bell color={colors.primary} size={20} />
            </View>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Expo Push Notifications</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Work-Life Break & Upskill Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.cardBgLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <AnimatedPressable
            style={[styles.actionBtnSecondary, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}
            onPress={handleTestPushNotification}
            activeScale={0.96}
          >
            <Bell color={colors.primary} size={16} />
            <Text style={[styles.actionBtnSecondaryText, { color: colors.textPrimary }]}>Trigger Instant Native Notification</Text>
          </AnimatedPressable>
        </View>

        {/* Expo ImagePicker Avatar Setting */}
        <View style={[styles.settingCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Camera color={colors.secondary} size={20} />
            </View>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Expo Camera & ImagePicker</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Custom Profile Picture Simulator</Text>
            </View>
          </View>

          <AnimatedPressable
            style={[styles.actionBtnSecondary, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}
            onPress={() => setShowPhotoModal(true)}
            activeScale={0.96}
          >
            <Camera color={colors.secondary} size={16} />
            <Text style={[styles.actionBtnSecondaryText, { color: colors.textPrimary }]}>Change Profile Avatar</Text>
          </AnimatedPressable>
        </View>

        {/* Achievements Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Earned Upskilling Badges</Text>
        </View>
        <View style={styles.badgesGrid}>
          <AnimatedPressable style={[styles.badgeItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} activeScale={0.92}>
            <Shield color={colors.primary} size={24} />
            <Text style={[styles.badgeItemTitle, { color: colors.textPrimary }]}>System Architect</Text>
            <Text style={[styles.badgeItemSub, { color: colors.textSecondary }]}>RAG Mastery</Text>
          </AnimatedPressable>

          <AnimatedPressable style={[styles.badgeItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} activeScale={0.92}>
            <Award color={colors.warning} size={24} />
            <Text style={[styles.badgeItemTitle, { color: colors.textPrimary }]}>Zen Leader</Text>
            <Text style={[styles.badgeItemSub, { color: colors.textSecondary }]}>Mindful Focus</Text>
          </AnimatedPressable>

          <AnimatedPressable style={[styles.badgeItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} activeScale={0.92}>
            <CheckCircle color={colors.success} size={24} />
            <Text style={[styles.badgeItemTitle, { color: colors.textPrimary }]}>14d Streak</Text>
            <Text style={[styles.badgeItemSub, { color: colors.textSecondary }]}>Hydration Hero</Text>
          </AnimatedPressable>
        </View>

        {/* Reset Actions */}
        <AnimatedPressable
          style={styles.dangerBtn}
          onPress={() => {
            resetDailyMetrics();
            Alert.alert('Metrics Reset', 'Daily work-life metrics have been reset to zero.');
          }}
          activeScale={0.96}
        >
          <Trash2 color={colors.danger} size={18} />
          <Text style={styles.dangerBtnText}>Reset Today's Balance Progress</Text>
        </AnimatedPressable>

        {/* Sign Out Button */}
        <AnimatedPressable style={[styles.signOutBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} onPress={signOut} activeScale={0.96}>
          <Text style={[styles.signOutBtnText, { color: colors.textSecondary }]}>Sign Out of Zinox</Text>
        </AnimatedPressable>
      </ScrollView>

      {/* Reanimated iOS Action Sheet Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoModal(false)}
        >
          <Animated.View style={[styles.photoSheet, sheetAnimStyle, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Update Profile Photo</Text>
              <AnimatedPressable onPress={() => setShowPhotoModal(false)} activeScale={0.88}>
                <X color={colors.textPrimary} size={20} />
              </AnimatedPressable>
            </View>

            <AnimatedPressable style={[styles.sheetOption, { backgroundColor: colors.cardBgLight }]} onPress={handlePickLibrary} activeScale={0.96}>
              <ImageIcon color={colors.primary} size={22} />
              <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>Choose from Photo Library</Text>
            </AnimatedPressable>

            <AnimatedPressable style={[styles.sheetOption, { backgroundColor: colors.cardBgLight }]} onPress={handleTakePhoto} activeScale={0.96}>
              <Camera color={colors.secondary} size={22} />
              <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>Take New Photo with Camera</Text>
            </AnimatedPressable>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.cardBgLight,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBg,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  userTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
    gap: 6,
  },
  levelTagText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '700',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginTop: 18,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.cardBorder,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  settingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextGroup: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBgLight,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  badgeItem: {
    width: '31%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgeItemTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  badgeItemSub: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  dangerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  signOutBtn: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  photoSheet: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBgLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  sheetOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

