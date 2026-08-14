import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS, SPRING_CONFIG, useThemeColors } from '../theme/colors';
import { Droplet, Eye, Activity, Clock, Plus, Zap } from 'lucide-react-native';
import { AnimatedPressable } from './AnimatedPressable';

export const BalanceScoreCard: React.FC = () => {
  const { metrics, logWater, logEyeRest, logStretch, user } = useZinoxStore();
  const colors = useThemeColors();

  // Calculate Overall Balance Score %
  const waterPct = Math.min(metrics.waterDrank / metrics.waterGoal, 1);
  const eyePct = Math.min(metrics.eyeRests / metrics.eyeRestGoal, 1);
  const stretchPct = Math.min(metrics.stretchesDone / metrics.stretchGoal, 1);

  const balanceScore = Math.round(((waterPct + eyePct + stretchPct) / 3) * 100);

  // Animations
  const scoreProgress = useSharedValue(0);
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    scoreProgress.value = withTiming(balanceScore, { duration: 600 });
    badgeScale.value = withSequence(
      withSpring(1.2, SPRING_CONFIG),
      withSpring(1.0, SPRING_CONFIG)
    );
  }, [balanceScore]);

  const animatedMeterStyle = useAnimatedStyle(() => ({
    width: `${scoreProgress.value}%`,
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Optimal Balance ✨';
    if (score >= 60) return 'Healthy Rhythm 🌱';
    if (score >= 35) return 'Needs Eye Rest ⚡';
    return 'Take a Break Now 🧘';
  };

  return (
    <View style={[styles.container, SHADOWS.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      {/* Header Row */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            Work-Life Balance Score
          </Text>
          <Text style={[styles.scoreSublabel, { color: colors.textSecondary }]}>{getScoreLabel(balanceScore)}</Text>
        </View>
        <Animated.View style={[styles.scorePill, animatedBadgeStyle, { backgroundColor: colors.accentGlow }]}>
          <Text style={[styles.scoreNumber, { color: colors.primary }]}>{balanceScore}%</Text>
        </Animated.View>
      </View>

      {/* Main Meter Bar */}
      <View style={[styles.meterContainer, { backgroundColor: colors.cardBgLight }]}>
        <Animated.View style={[styles.meterFill, animatedMeterStyle, { backgroundColor: colors.primary }]} />
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Hydration */}
        <View style={[styles.metricItem, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
          <View style={styles.metricItemHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Droplet color={colors.secondary} size={16} />
            </View>
            <AnimatedPressable
              style={[styles.plusButton, { backgroundColor: colors.cardBg }]}
              onPress={logWater}
              activeScale={0.82}
            >
              <Plus color={colors.secondary} size={14} />
            </AnimatedPressable>
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]} numberOfLines={1}>
              Hydration
            </Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]} numberOfLines={1}>
              {metrics.waterDrank}/{metrics.waterGoal} <Text style={[styles.unitText, { color: colors.textMuted }]}>glasses</Text>
            </Text>
          </View>
        </View>

        {/* Eye Rest */}
        <View style={[styles.metricItem, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
          <View style={styles.metricItemHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Eye color={colors.primary} size={16} />
            </View>
            <AnimatedPressable
              style={[styles.plusButton, { backgroundColor: colors.cardBg }]}
              onPress={logEyeRest}
              activeScale={0.82}
            >
              <Plus color={colors.primary} size={14} />
            </AnimatedPressable>
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]} numberOfLines={1}>
              Eye Rest
            </Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]} numberOfLines={1}>
              {metrics.eyeRests}/{metrics.eyeRestGoal} <Text style={[styles.unitText, { color: colors.textMuted }]}>breaks</Text>
            </Text>
          </View>
        </View>

        {/* Stretch */}
        <View style={[styles.metricItem, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
          <View style={styles.metricItemHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Activity color={colors.success} size={16} />
            </View>
            <AnimatedPressable
              style={[styles.plusButton, { backgroundColor: colors.cardBg }]}
              onPress={logStretch}
              activeScale={0.82}
            >
              <Plus color={colors.success} size={14} />
            </AnimatedPressable>
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]} numberOfLines={1}>
              Posture Stretch
            </Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]} numberOfLines={1}>
              {metrics.stretchesDone}/{metrics.stretchGoal} <Text style={[styles.unitText, { color: colors.textMuted }]}>sessions</Text>
            </Text>
          </View>
        </View>

        {/* Focus Time */}
        <View style={[styles.metricItem, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}>
          <View style={styles.metricItemHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Clock color={colors.warning} size={16} />
            </View>
            <View style={styles.pointsBadge}>
              <Zap color={colors.warning} size={10} fill={colors.warning} />
              <Text style={[styles.pointsText, { color: colors.warning }]}>+{user.points}</Text>
            </View>
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]} numberOfLines={1}>
              Focus Time
            </Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]} numberOfLines={1}>
              {metrics.focusMinutes} <Text style={[styles.unitText, { color: colors.textMuted }]}>mins</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  scoreSublabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  scorePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  meterContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricItem: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  metricItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  metricTextGroup: {
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 10,
    fontWeight: '400',
  },
});

