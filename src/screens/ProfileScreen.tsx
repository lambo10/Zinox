import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS } from '../theme/colors';
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
} from 'lucide-react-native';
import { pickImageFromLibrary, takePhotoWithCamera } from '../services/imagePickerService';
import { triggerLocalNotification } from '../services/notificationService';

export const ProfileScreen: React.FC = () => {
  const { user, updateAvatar, notificationsEnabled, toggleNotifications, resetDailyMetrics } =
    useZinoxStore();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.card]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User color={COLORS.primary} size={40} />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.8}
              >
                <Camera color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userTitle}>{user.title}</Text>

            <View style={styles.levelTag}>
              <Sparkles color={COLORS.warning} size={14} />
              <Text style={styles.levelTagText}>{user.level} (Level 5)</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Flame color={COLORS.danger} size={20} fill={COLORS.danger} />
              <Text style={styles.statVal}>{user.streak} Days</Text>
              <Text style={styles.statLbl}>Balance Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Zap color={COLORS.warning} size={20} fill={COLORS.warning} />
              <Text style={styles.statVal}>{user.points} XP</Text>
              <Text style={styles.statLbl}>Zinox Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Award color={COLORS.primary} size={20} />
              <Text style={styles.statVal}>4 Badges</Text>
              <Text style={styles.statLbl}>Upskill Level</Text>
            </View>
          </View>
        </View>

        {/* Native Feature Settings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Native Feature Integrations</Text>
        </View>

        {/* Expo Notifications Settings */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Bell color={COLORS.primary} size={20} />
            </View>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Expo Push Notifications</Text>
              <Text style={styles.settingSub}>Work-Life Break & Upskill Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.cardBgLight, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={handleTestPushNotification}
            activeOpacity={0.8}
          >
            <Bell color={COLORS.primary} size={16} />
            <Text style={styles.actionBtnSecondaryText}>Trigger Instant Native Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Expo ImagePicker Avatar Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Camera color={COLORS.secondary} size={20} />
            </View>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Expo Camera & ImagePicker</Text>
              <Text style={styles.settingSub}>Custom Profile Picture Simulator</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
          >
            <Camera color={COLORS.secondary} size={16} />
            <Text style={styles.actionBtnSecondaryText}>Change Profile Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earned Upskilling Badges</Text>
        </View>
        <View style={styles.badgesGrid}>
          <View style={styles.badgeItem}>
            <Shield color={COLORS.primary} size={24} />
            <Text style={styles.badgeItemTitle}>System Architect</Text>
            <Text style={styles.badgeItemSub}>RAG Mastery</Text>
          </View>

          <View style={styles.badgeItem}>
            <Award color={COLORS.warning} size={24} />
            <Text style={styles.badgeItemTitle}>Zen Leader</Text>
            <Text style={styles.badgeItemSub}>Mindful Focus</Text>
          </View>

          <View style={styles.badgeItem}>
            <CheckCircle color={COLORS.success} size={24} />
            <Text style={styles.badgeItemTitle}>14d Streak</Text>
            <Text style={styles.badgeItemSub}>Hydration Hero</Text>
          </View>
        </View>

        {/* Reset Actions */}
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => {
            resetDailyMetrics();
            Alert.alert('Metrics Reset', 'Daily work-life metrics have been reset to zero.');
          }}
        >
          <Trash2 color={COLORS.danger} size={18} />
          <Text style={styles.dangerBtnText}>Reset Today's Balance Progress</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Photo Choice Modal */}
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
          <View style={styles.photoSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Update Profile Photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <X color={COLORS.textPrimary} size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sheetOption} onPress={handlePickLibrary}>
              <ImageIcon color={COLORS.primary} size={22} />
              <Text style={styles.sheetOptionText}>Choose from Photo Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handleTakePhoto}>
              <Camera color={COLORS.secondary} size={22} />
              <Text style={styles.sheetOptionText}>Take New Photo with Camera</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
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
