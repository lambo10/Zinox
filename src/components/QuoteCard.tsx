import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS, useThemeColors } from '../theme/colors';
import { Quote, RefreshCw } from 'lucide-react-native';
import { fetchDailyQuote } from '../services/apiService';
import { AnimatedPressable } from './AnimatedPressable';

export const QuoteCard: React.FC = () => {
  const { dailyQuote, setDailyQuote } = useZinoxStore();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  // Animations
  const quoteOpacity = useSharedValue(1);
  const spinDegree = useSharedValue(0);

  const animatedQuoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
  }));

  const animatedSpinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinDegree.value}deg` }],
  }));

  const handleRefreshQuote = async () => {
    setLoading(true);
    spinDegree.value = withTiming(spinDegree.value + 360, { duration: 700 });
    quoteOpacity.value = withTiming(0.2, { duration: 250 });

    const newQuote = await fetchDailyQuote();
    setDailyQuote(newQuote);

    quoteOpacity.value = withTiming(1.0, { duration: 350 });
    setLoading(false);
  };

  return (
    <View style={[styles.container, SHADOWS.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
          <Quote color={colors.secondary} size={14} />
          <Text style={[styles.badgeText, { color: colors.secondary }]}>{dailyQuote.category || 'Daily Mindset'}</Text>
        </View>
        <AnimatedPressable
          style={[styles.refreshButton, { backgroundColor: colors.cardBgLight }]}
          onPress={handleRefreshQuote}
          disabled={loading}
          activeScale={0.88}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <Animated.View style={animatedSpinStyle}>
              <RefreshCw color={colors.textSecondary} size={16} />
            </Animated.View>
          )}
        </AnimatedPressable>
      </View>

      <Animated.View style={animatedQuoteStyle}>
        <Text style={[styles.quoteText, { color: colors.textPrimary }]}>"{dailyQuote.quote}"</Text>
        <Text style={[styles.authorText, { color: colors.textSecondary }]}>— {dailyQuote.author}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },
  authorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
});

