import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS } from '../theme/colors';
import { Droplet, Eye, Activity, Clock, Plus, Zap } from 'lucide-react-native';

export const BalanceScoreCard: React.FC = () => {
  const { metrics, logWater, logEyeRest, logStretch, user } = useZinoxStore();

  // Calculate Overall Balance Score %
  const waterPct = Math.min(metrics.waterDrank / metrics.waterGoal, 1);
  const eyePct = Math.min(metrics.eyeRests / metrics.eyeRestGoal, 1);
  const stretchPct = Math.min(metrics.stretchesDone / metrics.stretchGoal, 1);

  const balanceScore = Math.round(((waterPct + eyePct + stretchPct) / 3) * 100);

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Optimal Balance ✨';
    if (score >= 60) return 'Healthy Rhythm 🌱';
    if (score >= 35) return 'Needs Eye Rest ⚡';
    return 'Take a Break Now 🧘';
  };

  return (
    <View style={[styles.container, SHADOWS.card]}>
      {/* Header Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.cardTitle}>Work-Life Balance Score</Text>
          <Text style={styles.scoreSublabel}>{getScoreLabel(balanceScore)}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreNumber}>{balanceScore}%</Text>
        </View>
      </View>

      {/* Main Meter Bar */}
      <View style={styles.meterContainer}>
        <View style={[styles.meterFill, { width: `${balanceScore}%` }]} />
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        {/* Hydration */}
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Droplet color={COLORS.secondary} size={18} />
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={styles.metricLabel}>Water</Text>
            <Text style={styles.metricValue}>
              {metrics.waterDrank}/{metrics.waterGoal} <Text style={styles.unitText}>gl</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.plusButton} onPress={logWater} activeOpacity={0.7}>
            <Plus color={COLORS.secondary} size={14} />
          </TouchableOpacity>
        </View>

        {/* Eye Rest */}
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Eye color={COLORS.primary} size={18} />
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={styles.metricLabel}>Eye Rest</Text>
            <Text style={styles.metricValue}>
              {metrics.eyeRests}/{metrics.eyeRestGoal} <Text style={styles.unitText}>breaks</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.plusButton} onPress={logEyeRest} activeOpacity={0.7}>
            <Plus color={COLORS.primary} size={14} />
          </TouchableOpacity>
        </View>

        {/* Stretch */}
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Activity color={COLORS.success} size={18} />
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={styles.metricLabel}>Stretch</Text>
            <Text style={styles.metricValue}>
              {metrics.stretchesDone}/{metrics.stretchGoal} <Text style={styles.unitText}>sess</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.plusButton} onPress={logStretch} activeOpacity={0.7}>
            <Plus color={COLORS.success} size={14} />
          </TouchableOpacity>
        </View>

        {/* Focus */}
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Clock color={COLORS.warning} size={18} />
          </View>
          <View style={styles.metricTextGroup}>
            <Text style={styles.metricLabel}>Focus Time</Text>
            <Text style={styles.metricValue}>
              {metrics.focusMinutes} <Text style={styles.unitText}>mins</Text>
            </Text>
          </View>
          <View style={styles.pointsBadge}>
            <Zap color={COLORS.warning} size={12} fill={COLORS.warning} />
            <Text style={styles.pointsText}>+{user.points}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scoreSublabel: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  scorePill: {
    backgroundColor: COLORS.cardBgLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  meterContainer: {
    height: 8,
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  meterFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTextGroup: {
    flex: 1,
    marginLeft: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  plusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pointsText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '700',
    marginLeft: 2,
  },
});
