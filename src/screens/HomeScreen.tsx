import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Header } from '../components/Header';
import { BalanceScoreCard } from '../components/BalanceScoreCard';
import { FocusTimer } from '../components/FocusTimer';
import { QuoteCard } from '../components/QuoteCard';
import { UpskillCard } from '../components/UpskillCard';
import { useZinoxStore, UpskillCourse } from '../store/useZinoxStore';
import { COLORS } from '../theme/colors';
import { Sparkles, BellRing, Network, ChevronRight } from 'lucide-react-native';
import { scheduleBreakReminder, triggerLocalNotification } from '../services/notificationService';
import { executeGraphQLQuery } from '../services/apiService';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { courses } = useZinoxStore();
  const [graphqlStatus, setGraphqlStatus] = useState<string>('Connecting...');

  useEffect(() => {
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <Header onPressProfile={() => navigation.navigate('Profile')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* GraphQL Connection Banner */}
        <View style={styles.apiBanner}>
          <Network color={COLORS.secondary} size={14} />
          <Text style={styles.apiBannerText}>{graphqlStatus}</Text>
          <View style={styles.liveDot} />
        </View>

        {/* Balance Score Card */}
        <BalanceScoreCard />

        {/* Quick Action: Schedule Push Notification */}
        <TouchableOpacity
          style={styles.notificationActionCard}
          onPress={handleScheduleBreak}
          activeOpacity={0.8}
        >
          <View style={styles.notifIconBg}>
            <BellRing color={COLORS.primary} size={20} />
          </View>
          <View style={styles.notifTextGroup}>
            <Text style={styles.notifTitle}>Test Native Push Notification</Text>
            <Text style={styles.notifSub}>
              Trigger instant break alert via Expo Notifications
            </Text>
          </View>
          <ChevronRight color={COLORS.textSecondary} size={18} />
        </TouchableOpacity>

        {/* Focus Timer Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mindful Focus & Rest</Text>
        </View>
        <FocusTimer />

        {/* Daily Inspiration Quote (API fetch) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Mindset Quote</Text>
        </View>
        <QuoteCard />

        {/* Featured Upskill Module */}
        {featuredCourse && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeaderBetween}>
              <Text style={styles.sectionTitle}>Today's Featured Skill</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Upskill')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <UpskillCard course={featuredCourse} onPress={handleCoursePress} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  apiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBgLight,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    gap: 8,
  },
  apiBannerText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
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
    backgroundColor: COLORS.cardBg,
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
    color: COLORS.textPrimary,
  },
  notifSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
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
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  featuredSection: {
    marginTop: 6,
  },
});
