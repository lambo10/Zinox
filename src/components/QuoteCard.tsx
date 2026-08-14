import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS } from '../theme/colors';
import { Quote, RefreshCw, Share2 } from 'lucide-react-native';
import { fetchDailyQuote } from '../services/apiService';

export const QuoteCard: React.FC = () => {
  const { dailyQuote, setDailyQuote } = useZinoxStore();
  const [loading, setLoading] = useState(false);

  const handleRefreshQuote = async () => {
    setLoading(true);
    const newQuote = await fetchDailyQuote();
    setDailyQuote(newQuote);
    setLoading(false);
  };

  return (
    <View style={[styles.container, SHADOWS.card]}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Quote color={COLORS.secondary} size={14} />
          <Text style={styles.badgeText}>{dailyQuote.category || 'Daily Mindset'}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefreshQuote}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.secondary} />
          ) : (
            <RefreshCw color={COLORS.textSecondary} size={16} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.quoteText}>"{dailyQuote.quote}"</Text>
      <Text style={styles.authorText}>— {dailyQuote.author}</Text>
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
