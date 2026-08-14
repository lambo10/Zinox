import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useZinoxStore, UpskillCourse, Lesson } from '../store/useZinoxStore';
import { UpskillCard } from '../components/UpskillCard';
import { COLORS, SHADOWS, SPRING_CONFIG, useThemeColors } from '../theme/colors';
import {
  BookOpen,
  CheckCircle2,
  X,
  PlayCircle,
  HelpCircle,
  Award,
  Sparkles,
} from 'lucide-react-native';
import { triggerLocalNotification } from '../services/notificationService';
import { AnimatedPressable } from '../components/AnimatedPressable';

type CategoryFilter = 'All' | 'AI & Code' | 'Leadership' | 'Architecture' | 'Wellness';

export const UpskillScreen: React.FC = () => {
  const colors = useThemeColors();
  const { courses, completeLesson, completeCourseQuiz } = useZinoxStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [activeCourse, setActiveCourse] = useState<UpskillCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Reanimated values
  const quizCardX = useSharedValue(0);
  const quizCardOpacity = useSharedValue(1);
  const trophyScale = useSharedValue(1);

  const categories: CategoryFilter[] = ['All', 'AI & Code', 'Leadership', 'Architecture', 'Wellness'];

  const filteredCourses =
    selectedCategory === 'All'
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  const handleOpenCourse = (course: UpskillCourse) => {
    setActiveCourse(course);
    setActiveLesson(course.lessons[0] || null);
    setShowQuiz(false);
  };

  const handleCompleteLesson = (lesson: Lesson) => {
    if (!activeCourse) return;
    completeLesson(activeCourse.id, lesson.id);

    // Refresh active course local state
    const updated = useZinoxStore.getState().courses.find((c) => c.id === activeCourse.id);
    if (updated) setActiveCourse(updated);

    triggerLocalNotification(
      'Lesson Completed! 🎓',
      `Completed "${lesson.title}". Earned +50 Zinox points.`
    );
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    quizCardX.value = 0;
    quizCardOpacity.value = 1;
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return; // Prevent double select
    setSelectedOption(index);

    if (!activeCourse) return;
    const currentQ = activeCourse.quiz[currentQuizIndex];

    let isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeCourse) return;

    // Animate question transition out and in
    quizCardX.value = withTiming(-30, { duration: 150 }, () => {
      quizCardX.value = 30;
      quizCardX.value = withSpring(0, SPRING_CONFIG);
    });

    if (currentQuizIndex + 1 < activeCourse.quiz.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Quiz Finished
      const finalScorePct = Math.round(
        ((quizScore + (selectedOption === activeCourse.quiz[currentQuizIndex].correctIndex ? 1 : 0)) /
          activeCourse.quiz.length) *
          100
      );
      completeCourseQuiz(activeCourse.id, finalScorePct);

      trophyScale.value = withSequence(
        withSpring(1.4, SPRING_CONFIG),
        withSpring(1.0, SPRING_CONFIG)
      );

      triggerLocalNotification(
        'Course Mastered! 🏆',
        `Score: ${finalScorePct}%. Course "${activeCourse.title}" marked as complete!`
      );

      Alert.alert(
        '🏆 Quiz Completed!',
        `Your Score: ${finalScorePct}%\nEarned bonus Zinox XP points!`,
        [
          {
            text: 'Awesome',
            onPress: () => {
              setShowQuiz(false);
              setActiveCourse(null);
            },
          },
        ]
      );
    }
  };

  const quizAnimStyle = useAnimatedStyle(() => ({
    opacity: quizCardOpacity.value,
    transform: [{ translateX: quizCardX.value }],
  }));

  const trophyAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Title */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Micro-Upskilling Hub</Text>
          <Sparkles color={colors.primary} size={20} />
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          10-minute high-impact modules designed for modern tech leaders.
        </Text>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <AnimatedPressable
              key={cat}
              style={[
                styles.categoryPill,
                { backgroundColor: colors.cardBgLight, borderColor: colors.cardBorder },
                selectedCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeScale={0.92}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.textPrimary },
                  selectedCategory === cat && { color: '#FFFFFF', fontWeight: '800' },
                ]}
              >
                {cat}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>

      {/* Course List */}
      <ScrollView contentContainerStyle={styles.courseList}>
        {filteredCourses.map((course) => (
          <UpskillCard key={course.id} course={course} onPress={handleOpenCourse} />
        ))}
      </ScrollView>

      {/* Course & Lesson Modal Player */}
      <Modal
        visible={!!activeCourse}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setActiveCourse(null)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {activeCourse && (
            <View style={{ flex: 1 }}>
              {/* Modal Top Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                <AnimatedPressable
                  onPress={() => setActiveCourse(null)}
                  style={[styles.closeBtn, { backgroundColor: colors.cardBg }]}
                  activeScale={0.88}
                >
                  <X color={colors.textPrimary} size={22} />
                </AnimatedPressable>
                <Text style={[styles.modalCategory, { color: colors.secondary }]}>{activeCourse.category}</Text>
                <View style={styles.placeholderBox} />
              </View>

              {!showQuiz ? (
                <ScrollView contentContainerStyle={styles.modalScroll}>
                  <Text style={[styles.modalCourseTitle, { color: colors.textPrimary }]}>{activeCourse.title}</Text>
                  <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>{activeCourse.description}</Text>

                  {/* Lessons List */}
                  <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Module Lessons</Text>
                  {activeCourse.lessons.map((lesson, idx) => (
                    <AnimatedPressable
                      key={lesson.id}
                      style={[
                        styles.lessonCard,
                        { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                        activeLesson?.id === lesson.id && { borderColor: colors.primary, backgroundColor: colors.cardBgLight },
                      ]}
                      onPress={() => setActiveLesson(lesson)}
                      activeScale={0.97}
                    >
                      <View style={styles.lessonLeft}>
                        {lesson.completed ? (
                          <CheckCircle2 color={colors.success} size={20} />
                        ) : (
                          <PlayCircle color={colors.primary} size={20} />
                        )}
                        <Text style={[styles.lessonTitle, { color: colors.textPrimary }]}>
                          {idx + 1}. {lesson.title}
                        </Text>
                      </View>
                      <Text style={[styles.lessonDuration, { color: colors.textMuted }]}>{lesson.duration}</Text>
                    </AnimatedPressable>
                  ))}

                  {/* Active Lesson Reader Content */}
                  {activeLesson && (
                    <View style={[styles.readerBox, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}>
                      <Text style={[styles.readerHeading, { color: colors.textPrimary }]}>{activeLesson.title}</Text>
                      <Text style={[styles.readerContent, { color: colors.textSecondary }]}>{activeLesson.content}</Text>

                      <AnimatedPressable
                        style={[
                          styles.completeLessonBtn,
                          { backgroundColor: colors.primary },
                          activeLesson.completed && { backgroundColor: colors.cardBgLight },
                        ]}
                        onPress={() => handleCompleteLesson(activeLesson)}
                        disabled={activeLesson.completed}
                        activeScale={0.96}
                      >
                        <CheckCircle2
                          color={activeLesson.completed ? colors.success : '#FFFFFF'}
                          size={18}
                        />
                        <Text
                          style={[
                            styles.completeLessonBtnText,
                            activeLesson.completed && { color: colors.success },
                          ]}
                        >
                          {activeLesson.completed ? 'Lesson Completed (+50 XP)' : 'Mark Lesson Complete'}
                        </Text>
                      </AnimatedPressable>
                    </View>
                  )}

                  {/* Start Quiz Button */}
                  {activeCourse.quiz && activeCourse.quiz.length > 0 && (
                    <AnimatedPressable
                      style={[styles.quizStartBtn, { backgroundColor: colors.success }]}
                      onPress={handleStartQuiz}
                      activeScale={0.96}
                    >
                      <HelpCircle color="#FFFFFF" size={20} />
                      <Text style={styles.quizStartText}>Take Knowledge Quiz & Earn Badge</Text>
                    </AnimatedPressable>
                  )}
                </ScrollView>
              ) : (
                /* Interactive Quiz View with Reanimated Card Slide */
                <View style={styles.quizContainer}>
                  <View style={styles.quizHeader}>
                    <Animated.View style={trophyAnimStyle}>
                      <Award color={colors.warning} size={24} />
                    </Animated.View>
                    <Text style={[styles.quizProgressText, { color: colors.warning }]}>
                      Question {currentQuizIndex + 1} of {activeCourse.quiz.length}
                    </Text>
                  </View>

                  <Animated.View style={quizAnimStyle}>
                    <Text style={[styles.questionText, { color: colors.textPrimary }]}>
                      {activeCourse.quiz[currentQuizIndex].question}
                    </Text>

                    {/* Options */}
                    <View style={styles.optionsList}>
                      {activeCourse.quiz[currentQuizIndex].options.map((opt, i) => {
                        const isSelected = selectedOption === i;
                        const isCorrect = i === activeCourse.quiz[currentQuizIndex].correctIndex;
                        let optionStyle: any = [
                          styles.quizOption,
                          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                        ];

                        if (selectedOption !== null) {
                          if (isCorrect) optionStyle = [styles.quizOption, styles.correctOption];
                          else if (isSelected) optionStyle = [styles.quizOption, styles.wrongOption];
                        }

                        return (
                          <AnimatedPressable
                            key={i}
                            style={optionStyle}
                            onPress={() => handleSelectOption(i)}
                            disabled={selectedOption !== null}
                            activeScale={0.97}
                          >
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>{opt}</Text>
                          </AnimatedPressable>
                        );
                      })}
                    </View>

                    {/* Explanation feedback */}
                    {selectedOption !== null && (
                      <View style={[styles.explanationBox, { backgroundColor: colors.cardBgLight }]}>
                        <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
                          💡 {activeCourse.quiz[currentQuizIndex].explanation}
                        </Text>

                        <AnimatedPressable
                          style={[styles.nextQuizBtn, { backgroundColor: colors.primary }]}
                          onPress={handleNextQuestion}
                          activeScale={0.96}
                        >
                          <Text style={styles.nextQuizBtnText}>
                            {currentQuizIndex + 1 < activeCourse.quiz.length
                              ? 'Next Question'
                              : 'Finish Quiz'}
                          </Text>
                        </AnimatedPressable>
                      </View>
                    )}
                  </Animated.View>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  categoryWrapper: {
    height: 52,
    marginVertical: 4,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBgLight,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  courseList: {
    paddingBottom: 90,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  placeholderBox: {
    width: 36,
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  modalCourseTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  activeLessonCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardBgLight,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  lessonDuration: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  readerBox: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  readerHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  readerContent: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  completeLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  completeLessonBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quizStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  quizStartText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quizContainer: {
    padding: 20,
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  quizProgressText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.warning,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
  },
  quizOption: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  correctOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.success,
  },
  wrongOption: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: COLORS.danger,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  explanationBox: {
    marginTop: 24,
    backgroundColor: COLORS.cardBgLight,
    padding: 16,
    borderRadius: 14,
  },
  explanationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  nextQuizBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextQuizBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

