import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPRING_CONFIG, useThemeColors } from '../theme/colors';
import { AnimatedPressable } from './AnimatedPressable';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selectedKey: T;
  onSelect: (key: T) => void;
  containerStyle?: any;
}

export function SegmentedControl<T extends string>({
  options,
  selectedKey,
  onSelect,
  containerStyle,
}: SegmentedControlProps<T>) {
  const colors = useThemeColors();
  const [containerWidth, setContainerWidth] = useState(0);
  const selectedIndex = Math.max(
    0,
    options.findIndex((opt) => opt.key === selectedKey)
  );

  const translateX = useSharedValue(0);
  const segmentWidth = containerWidth > 0 ? (containerWidth - 8) / options.length : 0;

  useEffect(() => {
    if (segmentWidth > 0) {
      translateX.value = withSpring(
        selectedIndex * segmentWidth + 4,
        SPRING_CONFIG
      );
    }
  }, [selectedIndex, segmentWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: segmentWidth,
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handlePress = (key: T) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    onSelect(key);
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder },
      ]}
      onLayout={handleLayout}
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            indicatorStyle,
            { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
          ]}
        />
      )}

      {options.map((opt) => {
        const isSelected = opt.key === selectedKey;
        return (
          <AnimatedPressable
            key={opt.key}
            onPress={() => handlePress(opt.key)}
            style={styles.tab}
            activeScale={0.98}
            enableHaptics={false}
          >
            <View style={styles.tabContent}>
              {opt.icon}
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? colors.textPrimary : colors.textSecondary },
                  isSelected && styles.selectedTabText,
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </View>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    height: 44,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectedTabText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
