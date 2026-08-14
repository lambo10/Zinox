import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useZinoxStore } from '../store/useZinoxStore';
import { FocusTimer } from '../components/FocusTimer';
import { COLORS, SHADOWS, useThemeColors } from '../theme/colors';
import { Droplet, Eye, Activity, Clock, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react-native';
import { triggerLocalNotification } from '../services/notificationService';
import { AnimatedPressable } from '../components/AnimatedPressable';

export const BalanceScreen: React.FC = () => {
  const { metrics, logWater, logEyeRest, logStretch, resetDailyMetrics } = useZinoxStore();
  const colors = useThemeColors();

  // Animations
  const fadeHeader = useSharedValue(0);
  const fadeSummary = useSharedValue(0);
  const fadeTips = useSharedValue(0);
  const resetSpin = useSharedValue(0);

  useEffect(() => {
    fadeHeader.value = withTiming(1, { duration: 400 });
    fadeSummary.value = withDelay(150, withTiming(1, { duration: 400 }));
    fadeTips.value = withDelay(300, withTiming(1, { duration: 400 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeHeader.value,
    transform: [{ translateY: (1 - fadeHeader.value) * 15 }],
  }));

  const summaryStyle = useAnimatedStyle(() => ({
    opacity: fadeSummary.value,
    transform: [{ translateY: (1 - fadeSummary.value) * 15 }],
  }));

  const tipsStyle = useAnimatedStyle(() => ({
    opacity: fadeTips.value,
    transform: [{ translateY: (1 - fadeTips.value) * 15 }],
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${resetSpin.value * 360}deg` }],
  }));

  const handleReset = () => {
    resetSpin.value = withTiming(1, { duration: 500 }, () => {
      resetSpin.value = 0;
    });
    resetDailyMetrics();
    triggerLocalNotification(
      'Daily Metrics Reset 🔄',
      'Your work-life balance logs for today have been reset.'
    );
  };

  const handleQuickRestAlert = () => {
    logEyeRest();
    triggerLocalNotification(
      'Eye Rest Logged! 👁️',
      '20-20-20 rule rest completed. Earned +40 Zinox XP.'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Work-Life Balance Hub</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Real-time wellness tracking & developer ergonomic management.
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overall Wellness Summary Card */}
        <Animated.View style={[styles.summaryCard, SHADOWS.card, summaryStyle, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.summaryTop}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <HeartPulse color={colors.success} size={24} />
            </View>
            <View style={styles.summaryTextGroup}>
              <Text style={[styles.summaryHeading, { color: colors.textPrimary }]}>Daily Balance Health</Text>
              <Text style={[styles.summarySub, { color: colors.textSecondary }]}>Optimal Ergonomic Rhythm</Text>
            </View>
            <AnimatedPressable onPress={handleReset} style={[styles.resetBtn, { backgroundColor: colors.cardBgLight }]} activeScale={0.88}>
              <Animated.View style={spinStyle}>
                <RefreshCw color={colors.textSecondary} size={16} />
              </Animated.View>
            </AnimatedPressable>
          </View>

          <View style={styles.gridContainer}>
            {/* Water */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
              <Droplet color={colors.secondary} size={20} />
              <Text style={[styles.gridVal, { color: colors.textPrimary }]}>
                {metrics.waterDrank}/{metrics.waterGoal}
              </Text>
              <Text style={[styles.gridLbl, { color: colors.textSecondary }]}>Water Glasses</Text>
              <AnimatedPressable style={[styles.gridAddBtn, { backgroundColor: colors.primary }]} onPress={logWater} activeScale={0.92}>
                <Text style={styles.gridAddText}>+ Log</Text>
              </AnimatedPressable>
            </View>

            {/* Eye Rests */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
              <Eye color={colors.primary} size={20} />
              <Text style={[styles.gridVal, { color: colors.textPrimary }]}>
                {metrics.eyeRests}/{metrics.eyeRestGoal}
              </Text>
              <Text style={[styles.gridLbl, { color: colors.textSecondary }]}>Eye Rests</Text>
              <AnimatedPressable style={[styles.gridAddBtn, { backgroundColor: colors.primary }]} onPress={handleQuickRestAlert} activeScale={0.92}>
                <Text style={styles.gridAddText}>+ Rest</Text>
              </AnimatedPressable>
            </View>

            {/* Stretches */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
              <Activity color={colors.success} size={20} />
              <Text style={[styles.gridVal, { color: colors.textPrimary }]}>
                {metrics.stretchesDone}/{metrics.stretchGoal}
              </Text>
              <Text style={[styles.gridLbl, { color: colors.textSecondary }]}>Stretches</Text>
              <AnimatedPressable style={[styles.gridAddBtn, { backgroundColor: colors.primary }]} onPress={logStretch} activeScale={0.92}>
                <Text style={styles.gridAddText}>+ Stretch</Text>
              </AnimatedPressable>
            </View>

            {/* Focus Mins */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
              <Clock color={colors.warning} size={20} />
              <Text style={[styles.gridVal, { color: colors.textPrimary }]}>{metrics.focusMinutes}m</Text>
              <Text style={[styles.gridLbl, { color: colors.textSecondary }]}>Deep Focus</Text>
              <View style={[styles.badgeMuted, { backgroundColor: colors.cardBg }]}>
                <Text style={[styles.badgeMutedText, { color: colors.textMuted }]}>Active</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Interactive Focus & Break Timer */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pomodoro & Mindful Rest Timer</Text>
        </View>
        <FocusTimer />

        {/* Ergonomic Tips Card */}
        <Animated.View style={[styles.tipsCard, tipsStyle, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <ShieldCheck color={colors.secondary} size={22} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.tipsTitle, { color: colors.textPrimary }]}>20-20-20 Rule for Developer Eye Care</Text>
            <Text style={[styles.tipsBody, { color: colors.textSecondary }]}>
              Every 20 minutes of screen time, look at an object 20 feet away for 20 seconds. Reduces dry eyes and fatigue by 60%.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
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
  },
  summarySub: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  gridVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  gridLbl: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  gridAddBtn: {
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  gridAddText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeMuted: {
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeMutedText: {
    fontSize: 11,
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
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  tipsBody: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});

