import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react-native';
import { COLORS, SHADOWS, SPRING_CONFIG } from '../theme/colors';
import { AnimatedPressable } from './AnimatedPressable';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface AlertModalProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  type = 'error',
  title,
  message,
  buttonText = 'Got It',
  onClose,
}) => {
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardScale.value = withSpring(1, SPRING_CONFIG);
      cardOpacity.value = withTiming(1, { duration: 200 });
    } else {
      cardScale.value = 0.85;
      cardOpacity.value = 0;
    }
  }, [visible]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle color="#10B981" size={32} />,
          badgeBg: 'rgba(16, 185, 129, 0.15)',
          borderColor: '#10B981',
          btnBg: '#10B981',
        };
      case 'warning':
        return {
          icon: <AlertTriangle color="#F59E0B" size={32} />,
          badgeBg: 'rgba(245, 158, 11, 0.15)',
          borderColor: '#F59E0B',
          btnBg: '#F59E0B',
        };
      case 'error':
      default:
        return {
          icon: <AlertCircle color="#EF4444" size={32} />,
          badgeBg: 'rgba(239, 68, 68, 0.15)',
          borderColor: '#EF4444',
          btnBg: '#EF4444',
        };
    }
  };

  const theme = getTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalCard,
                SHADOWS.iosFloat,
                { borderColor: theme.borderColor },
                animatedCardStyle,
              ]}
            >
              {/* Close X Button */}
              <AnimatedPressable
                style={styles.closeBtn}
                onPress={onClose}
                activeScale={0.85}
              >
                <X color={COLORS.textSecondary} size={20} />
              </AnimatedPressable>

              {/* Icon Badge */}
              <View style={[styles.iconBadge, { backgroundColor: theme.badgeBg }]}>
                {theme.icon}
              </View>

              {/* Title & Message */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Action Button */}
              <AnimatedPressable
                style={[styles.actionBtn, { backgroundColor: theme.btnBg }]}
                onPress={onClose}
                activeScale={0.96}
              >
                <Text style={styles.actionBtnText}>{buttonText}</Text>
              </AnimatedPressable>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 22, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#12182B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

