import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS, useThemeColors } from '../theme/colors';
import { Play, Pause, RotateCcw, Plus, Sparkles, Coffee, BookOpen } from 'lucide-react-native';
import { triggerLocalNotification } from '../services/notificationService';
import { SegmentedControl, SegmentOption } from './SegmentedControl';
import { AnimatedPressable } from './AnimatedPressable';

type TimerMode = 'focus' | 'break' | 'upskill';

export const FocusTimer: React.FC = () => {
  const { addFocusMinutes, logEyeRest } = useZinoxStore();
  const colors = useThemeColors();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Animation values
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1.0, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const circlePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      handleTimerCompletion();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleTimerCompletion = () => {
    if (mode === 'focus') {
      addFocusMinutes(25);
      triggerLocalNotification(
        'Focus Session Completed! 🎯',
        '25 minutes of deep work logged. Earned +50 Zinox XP points!'
      );
    } else if (mode === 'break') {
      logEyeRest();
      triggerLocalNotification(
        'Rest Break Completed! ☕',
        'Your 5-minute ergonomic break is finished. Re-energized for deep focus!'
      );
    } else {
      triggerLocalNotification(
        'Upskill Learning Session Finished! 📚',
        'Great job advancing your technical skills.'
      );
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') setSecondsLeft(25 * 60);
    if (newMode === 'break') setSecondsLeft(5 * 60);
    if (newMode === 'upskill') setSecondsLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addExtraMinutes = (mins: number) => {
    setSecondsLeft((prev) => prev + mins * 60);
  };

  const modeOptions: SegmentOption<TimerMode>[] = [
    {
      key: 'focus',
      label: 'Focus (25m)',
      icon: <Sparkles color={mode === 'focus' ? colors.primary : colors.textSecondary} size={14} />,
    },
    {
      key: 'break',
      label: 'Break (5m)',
      icon: <Coffee color={mode === 'break' ? colors.secondary : colors.textSecondary} size={14} />,
    },
    {
      key: 'upskill',
      label: 'Upskill (15m)',
      icon: <BookOpen color={mode === 'upskill' ? colors.success : colors.textSecondary} size={14} />,
    },
  ];

  return (
    <View style={[styles.container, SHADOWS.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      {/* Segmented Control Modes Bar */}
      <SegmentedControl
        options={modeOptions}
        selectedKey={mode}
        onSelect={switchMode}
        containerStyle={{ width: '100%', marginBottom: 16 }}
      />

      {/* Clock Display with Animated Pulse Ring */}
      <Animated.View style={[styles.clockCircle, circlePulseStyle, { backgroundColor: colors.cardBgLight, borderColor: colors.primary }]}>
        <Text style={[styles.clockTime, { color: colors.textPrimary }]}>{formatTime(secondsLeft)}</Text>
        <Text style={[styles.clockStatus, { color: colors.textSecondary }]}>{isRunning ? 'Session in progress...' : 'Ready to start'}</Text>
      </Animated.View>

      {/* Action Controls */}
      <View style={styles.controlsRow}>
        <AnimatedPressable
          style={[styles.circleControl, { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder }]}
          onPress={() => switchMode(mode)}
          activeScale={0.88}
        >
          <RotateCcw color={colors.textSecondary} size={18} />
        </AnimatedPressable>

        <AnimatedPressable
          style={[
            styles.playButton,
            mode === 'break' && { backgroundColor: COLORS.secondary },
            mode === 'upskill' && { backgroundColor: COLORS.success },
          ]}
          onPress={() => setIsRunning(!isRunning)}
          activeScale={0.92}
        >
          {isRunning ? (
            <Pause color="#FFFFFF" size={24} fill="#FFFFFF" />
          ) : (
            <Play color="#FFFFFF" size={24} fill="#FFFFFF" style={{ marginLeft: 3 }} />
          )}
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.circleControl}
          onPress={() => addExtraMinutes(5)}
          activeScale={0.88}
        >
          <Plus color={COLORS.textSecondary} size={18} />
        </AnimatedPressable>
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  clockCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardBgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  clockTime: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  clockStatus: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 14,
  },
  circleControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBgLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

