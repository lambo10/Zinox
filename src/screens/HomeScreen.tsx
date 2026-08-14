import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Header } from '../components/Header';
import { BalanceScoreCard } from '../components/BalanceScoreCard';
import { FocusTimer } from '../components/FocusTimer';
import { QuoteCard } from '../components/QuoteCard';
import { UpskillCard } from '../components/UpskillCard';
import { useZinoxStore, UpskillCourse } from '../store/useZinoxStore';
import { COLORS, useThemeColors } from '../theme/colors';
import { BellRing, Network, ChevronRight } from 'lucide-react-native';
import { scheduleBreakReminder, triggerLocalNotification } from '../services/notificationService';
import { executeGraphQLQuery } from '../services/apiService';
import { AnimatedPressable } from '../components/AnimatedPressable';

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { courses } = useZinoxStore();
  const colors = useThemeColors();
  const [graphqlStatus, setGraphqlStatus] = useState<string>('Connecting...');

  // Animations
  const dotOpacity = useSharedValue(0.4);
  const fade1 = useSharedValue(0);
  const fade2 = useSharedValue(0);
  const fade3 = useSharedValue(0);

  useEffect(() => {
    // Live Dot pulse
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );

    // Cascade entrance animations
    fade1.value = withDelay(100, withTiming(1, { duration: 450 }));
    fade2.value = withDelay(250, withTiming(1, { duration: 450 }));
    fade3.value = withDelay(400, withTiming(1, { duration: 450 }));

    async function checkGraphQL() {
      const res = await executeGraphQLQuery();
      if (res && res.status === 'success') {
        setGraphqlStatus('Live GraphQL API Connected');
      } else {
        setGraphqlStatus('GraphQL Cache Mode');
      }
    }
    checkGraphQL();
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const section1Style = useAnimatedStyle(() => ({
    opacity: fade1.value,
    transform: [{ translateY: (1 - fade1.value) * 15 }],
  }));

  const section2Style = useAnimatedStyle(() => ({
    opacity: fade2.value,
    transform: [{ translateY: (1 - fade2.value) * 15 }],
  }));

  const section3Style = useAnimatedStyle(() => ({
    opacity: fade3.value,
    transform: [{ translateY: (1 - fade3.value) * 15 }],
  }));

  const handleScheduleBreak = () => {
    scheduleBreakReminder(10);
    triggerLocalNotification(
      'Break Alert Scheduled ⏰',
      'In 10 seconds, Zinox will send you a native break notification reminder!'
    );
  };

  const handleCoursePress = (course: UpskillCourse) => {
    navigation.navigate('Upskill', { selectedCourseId: course.id });
  };

  const featuredCourse = courses[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header onPressProfile={() => navigation.navigate('Profile')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* GraphQL Connection Banner */}
        <View style={[styles.apiBanner, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Network color={colors.secondary} size={14} />
          <Text style={[styles.apiBannerText, { color: colors.textSecondary }]}>{graphqlStatus}</Text>
          <Animated.View style={[styles.liveDot, dotStyle, { backgroundColor: colors.success }]} />
        </View>

        {/* Section 1: Balance Score Card */}
        <Animated.View style={section1Style}>
          <BalanceScoreCard />
        </Animated.View>

        {/* Section 2: Quick Action Notification */}
        <Animated.View style={section2Style}>
          <AnimatedPressable
            style={styles.notificationActionCard}
            onPress={handleScheduleBreak}
            activeScale={0.96}
          >
            <View style={[styles.notifIconBg, { backgroundColor: colors.cardBg }]}>
              <BellRing color={colors.primary} size={20} />
            </View>
            <View style={styles.notifTextGroup}>
              <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>Test Native Push Notification</Text>
              <Text style={[styles.notifSub, { color: colors.textSecondary }]}>
                Trigger instant break alert via Expo Notifications
              </Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </AnimatedPressable>

          {/* Focus Timer Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mindful Focus & Rest</Text>
          </View>
          <FocusTimer />
        </Animated.View>

        {/* Section 3: Quotes & Featured Skill */}
        <Animated.View style={section3Style}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Daily Mindset Quote</Text>
          </View>
          <QuoteCard />

          {featuredCourse && (
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Featured Skill</Text>
                <AnimatedPressable
                  onPress={() => navigation.navigate('Upskill')}
                  activeScale={0.92}
                >
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>View All</Text>
                </AnimatedPressable>
              </View>
              <UpskillCard course={featuredCourse} onPress={handleCoursePress} />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  apiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  apiBannerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  notifIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTextGroup: {
    flex: 1,
    marginLeft: 12,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  notifSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  featuredSection: {
    marginTop: 6,
  },
});

