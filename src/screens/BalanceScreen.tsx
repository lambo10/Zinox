import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useZinoxStore } from '../store/useZinoxStore';
import { FocusTimer } from '../components/FocusTimer';
import { COLORS, SHADOWS } from '../theme/colors';
import { Droplet, Eye, Activity, Clock, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react-native';
import { triggerLocalNotification } from '../services/notificationService';

export const BalanceScreen: React.FC = () => {
  const { metrics, logWater, logEyeRest, logStretch, resetDailyMetrics } = useZinoxStore();

  const handleQuickRestAlert = () => {
    logEyeRest();
    triggerLocalNotification(
      '20-20-20 Eye Rest Completed 👁️',
      'Look at an object 20 feet away for 20 seconds. Great job relaxing your ocular muscles!'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Work-Life Balance Hub</Text>
        <Text style={styles.subtitle}>
          Harmonize deep coding focus with physical ergonomics and eye care.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overall Wellness Summary Card */}
        <View style={[styles.summaryCard, SHADOWS.card]}>
          <View style={styles.summaryTop}>
            <View style={styles.iconCircle}>
              <HeartPulse color={COLORS.success} size={24} />
            </View>
            <View style={styles.summaryTextGroup}>
              <Text style={styles.summaryHeading}>Daily Balance Health</Text>
              <Text style={styles.summarySub}>Optimal Ergonomic Rhythm</Text>
            </View>
            <TouchableOpacity onPress={resetDailyMetrics} style={styles.resetBtn}>
              <RefreshCw color={COLORS.textSecondary} size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            {/* Water */}
            <View style={styles.gridCard}>
              <Droplet color={COLORS.secondary} size={20} />
              <Text style={styles.gridVal}>
                {metrics.waterDrank}/{metrics.waterGoal}
              </Text>
              <Text style={styles.gridLbl}>Water Glasses</Text>
              <TouchableOpacity style={styles.gridAddBtn} onPress={logWater}>
                <Text style={styles.gridAddText}>+ Log</Text>
              </TouchableOpacity>
            </View>

            {/* Eye Rests */}
            <View style={styles.gridCard}>
              <Eye color={COLORS.primary} size={20} />
              <Text style={styles.gridVal}>
                {metrics.eyeRests}/{metrics.eyeRestGoal}
              </Text>
              <Text style={styles.gridLbl}>Eye Rests</Text>
              <TouchableOpacity style={styles.gridAddBtn} onPress={handleQuickRestAlert}>
                <Text style={styles.gridAddText}>+ Rest</Text>
              </TouchableOpacity>
            </View>

            {/* Stretches */}
            <View style={styles.gridCard}>
              <Activity color={COLORS.success} size={20} />
              <Text style={styles.gridVal}>
                {metrics.stretchesDone}/{metrics.stretchGoal}
              </Text>
              <Text style={styles.gridLbl}>Stretches</Text>
              <TouchableOpacity style={styles.gridAddBtn} onPress={logStretch}>
                <Text style={styles.gridAddText}>+ Stretch</Text>
              </TouchableOpacity>
            </View>

            {/* Focus Mins */}
            <View style={styles.gridCard}>
              <Clock color={COLORS.warning} size={20} />
              <Text style={styles.gridVal}>{metrics.focusMinutes}m</Text>
              <Text style={styles.gridLbl}>Deep Focus</Text>
              <View style={styles.badgeMuted}>
                <Text style={styles.badgeMutedText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Interactive Focus & Break Timer */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pomodoro & Mindful Rest Timer</Text>
        </View>
        <FocusTimer />

        {/* Ergonomic Tips Card */}
        <View style={styles.tipsCard}>
          <ShieldCheck color={COLORS.secondary} size={22} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.tipsTitle}>20-20-20 Rule for Developer Eye Care</Text>
            <Text style={styles.tipsBody}>
              Every 20 minutes of screen time, look at an object 20 feet away for 20 seconds. Reduces dry eyes and fatigue by 60%.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextGroup: {
    flex: 1,
    marginLeft: 12,
  },
  summaryHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summarySub: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardBgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  gridLbl: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  gridAddBtn: {
    backgroundColor: COLORS.cardBg,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  gridAddText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badgeMuted: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeMutedText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tipsBody: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
});
