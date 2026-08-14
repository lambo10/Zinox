import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react-native';
import { COLORS, SHADOWS, SPRING_CONFIG } from '../theme/colors';
import { AnimatedPressable } from './AnimatedPressable';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  type = 'error',
  title,
  message,
  onDismiss,
  duration = 4000,
}) => {
  const translateY = useSharedValue(-70);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: 250 });

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -70;
      opacity.value = 0;
    }
  }, [visible]);

  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-50, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 color="#10B981" size={22} />,
          borderColor: 'rgba(16, 185, 129, 0.4)',
          bgColor: 'rgba(18, 32, 28, 0.95)',
          titleColor: '#34D399',
        };
      case 'warning':
        return {
          icon: <AlertTriangle color="#F59E0B" size={22} />,
          borderColor: 'rgba(245, 158, 11, 0.4)',
          bgColor: 'rgba(34, 28, 18, 0.95)',
          titleColor: '#FBBF24',
        };
      case 'info':
        return {
          icon: <Info color="#6366F1" size={22} />,
          borderColor: 'rgba(99, 102, 241, 0.4)',
          bgColor: 'rgba(22, 24, 45, 0.95)',
          titleColor: '#818CF8',
        };
      case 'error':
      default:
        return {
          icon: <AlertCircle color="#EF4444" size={22} />,
          borderColor: 'rgba(239, 68, 68, 0.4)',
          bgColor: 'rgba(36, 18, 24, 0.95)',
          titleColor: '#F87171',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        SHADOWS.iosFloat,
        animatedStyle,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>{config.icon}</View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <AnimatedPressable onPress={handleDismiss} style={styles.closeBtn} activeScale={0.82}>
        <X color={COLORS.textMuted} size={16} />
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
});

