import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { UpskillCourse } from '../store/useZinoxStore';
import { COLORS, SHADOWS, SPRING_CONFIG, useThemeColors } from '../theme/colors';
import { CheckCircle, Clock, ChevronRight } from 'lucide-react-native';
import { AnimatedPressable } from './AnimatedPressable';

interface UpskillCardProps {
  course: UpskillCourse;
  onPress: (course: UpskillCourse) => void;
}

export const UpskillCard: React.FC<UpskillCardProps> = ({ course, onPress }) => {
  const colors = useThemeColors();

  const getCategoryColor = (category: UpskillCourse['category']) => {
    switch (category) {
      case 'AI & Code':
        return colors.primary;
      case 'Leadership':
        return colors.warning;
      case 'Architecture':
        return colors.secondary;
      case 'Wellness':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const color = getCategoryColor(course.category);

  // Animations
  const progressValue = useSharedValue(0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    progressValue.value = withTiming(course.progress, { duration: 500 });
    if (course.completed) {
      iconScale.value = withSpring(1.2, SPRING_CONFIG);
    }
  }, [course.progress, course.completed]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.container, SHADOWS.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
      onPress={() => onPress(course)}
      activeScale={0.97}
    >
      <View style={styles.topRow}>
        <View style={[styles.categoryBadge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.categoryText, { color }]}>{course.category}</Text>
        </View>

        <View style={styles.durationBadge}>
          <Clock color={colors.textSecondary} size={12} />
          <Text style={[styles.durationText, { color: colors.textSecondary }]}>{course.duration}</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{course.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {course.description}
      </Text>

      {/* Progress & Action Bar */}
      <View style={styles.bottomRow}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBarTrack, { backgroundColor: colors.cardBgLight }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                animatedProgressStyle,
                { backgroundColor: color },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textMuted }]}>{course.progress}% completed</Text>
        </View>

        <View style={[styles.actionButton, { backgroundColor: colors.cardBgLight }]}>
          {course.completed ? (
            <Animated.View style={animatedIconStyle}>
              <CheckCircle color={colors.success} size={20} />
            </Animated.View>
          ) : (
            <ChevronRight color={colors.textPrimary} size={20} />
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardBgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

