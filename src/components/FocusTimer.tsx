import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useZinoxStore } from '../store/useZinoxStore';
import { COLORS, SHADOWS } from '../theme/colors';
import { Play, Pause, RotateCcw, Plus, Sparkles, Coffee, BookOpen } from 'lucide-react-native';
import { triggerLocalNotification } from '../services/notificationService';

type TimerMode = 'focus' | 'break' | 'upskill';

export const FocusTimer: React.FC = () => {
  const { addFocusMinutes, logEyeRest } = useZinoxStore();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      handleComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const handleComplete = () => {
    if (mode === 'focus') {
      addFocusMinutes(25);
      triggerLocalNotification(
        'Focus Session Completed! 🎉',
        'Awesome work! You earned 50 Zinox points. Time to take a 5-minute break.'
      );
    } else if (mode === 'break') {
      logEyeRest();
      triggerLocalNotification(
        'Mindful Rest Completed! 🧘',
        'Your eyes and posture are refreshed. Ready for your next focus session.'
      );
    } else {
      addFocusMinutes(15);
      triggerLocalNotification(
        'Micro-Upskill Session Complete! 📚',
        'Great job expanding your knowledge today.'
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

  return (
    <View style={[styles.container, SHADOWS.card]}>
      {/* Modes Bar */}
      <View style={styles.modesRow}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'focus' && styles.activeModeTab]}
          onPress={() => switchMode('focus')}
        >
          <Sparkles color={mode === 'focus' ? COLORS.primary : COLORS.textSecondary} size={14} />
          <Text style={[styles.modeText, mode === 'focus' && styles.activeModeText]}>
            Focus (25m)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'break' && styles.activeModeTab]}
          onPress={() => switchMode('break')}
        >
          <Coffee color={mode === 'break' ? COLORS.secondary : COLORS.textSecondary} size={14} />
          <Text style={[styles.modeText, mode === 'break' && styles.activeModeText]}>
            Break (5m)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'upskill' && styles.activeModeTab]}
          onPress={() => switchMode('upskill')}
        >
          <BookOpen color={mode === 'upskill' ? COLORS.success : COLORS.textSecondary} size={14} />
          <Text style={[styles.modeText, mode === 'upskill' && styles.activeModeText]}>
            Upskill (15m)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clock Display */}
      <View style={styles.clockCircle}>
        <Text style={styles.clockTime}>{formatTime(secondsLeft)}</Text>
        <Text style={styles.clockStatus}>{isRunning ? 'Session in progress...' : 'Ready to start'}</Text>
      </View>

      {/* Action Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.circleControl}
          onPress={() => switchMode(mode)}
          activeOpacity={0.7}
        >
          <RotateCcw color={COLORS.textSecondary} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.playButton,
            mode === 'break' && { backgroundColor: COLORS.secondary },
            mode === 'upskill' && { backgroundColor: COLORS.success },
          ]}
          onPress={() => setIsRunning(!isRunning)}
          activeOpacity={0.8}
        >
          {isRunning ? (
            <Pause color="#FFFFFF" size={24} fill="#FFFFFF" />
          ) : (
            <Play color="#FFFFFF" size={24} fill="#FFFFFF" style={{ marginLeft: 3 }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleControl}
          onPress={() => addExtraMinutes(5)}
          activeOpacity={0.7}
        >
          <Plus color={COLORS.textSecondary} size={18} />
        </TouchableOpacity>
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
  modesRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    width: '100%',
    justifyContent: 'space-between',
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  activeModeTab: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeModeText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
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
