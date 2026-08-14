import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { useZinoxStore, UpskillCourse, Lesson } from '../store/useZinoxStore';
import { UpskillCard } from '../components/UpskillCard';
import { COLORS, SHADOWS } from '../theme/colors';
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

type CategoryFilter = 'All' | 'AI & Code' | 'Leadership' | 'Architecture' | 'Wellness';

export const UpskillScreen: React.FC = () => {
  const { courses, completeLesson, completeCourseQuiz } = useZinoxStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [activeCourse, setActiveCourse] = useState<UpskillCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

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
    if (currentQuizIndex + 1 < activeCourse.quiz.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Quiz Finished
      const finalScorePct = Math.round(((quizScore + (selectedOption === activeCourse.quiz[currentQuizIndex].correctIndex ? 1 : 0)) / activeCourse.quiz.length) * 100);
      completeCourseQuiz(activeCourse.id, finalScorePct);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Micro-Upskilling Hub</Text>
          <Sparkles color={COLORS.primary} size={20} />
        </View>
        <Text style={styles.subtitle}>
          10-minute high-impact modules designed for modern tech leaders.
        </Text>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, selectedCategory === cat && styles.activePill]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, selectedCategory === cat && styles.activePillText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        <SafeAreaView style={styles.modalContainer}>
          {activeCourse && (
            <View style={{ flex: 1 }}>
              {/* Modal Top Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setActiveCourse(null)} style={styles.closeBtn}>
                  <X color={COLORS.textPrimary} size={22} />
                </TouchableOpacity>
                <Text style={styles.modalCategory}>{activeCourse.category}</Text>
                <View style={styles.placeholderBox} />
              </View>

              {!showQuiz ? (
                <ScrollView contentContainerStyle={styles.modalScroll}>
                  <Text style={styles.modalCourseTitle}>{activeCourse.title}</Text>
                  <Text style={styles.modalDesc}>{activeCourse.description}</Text>

                  {/* Lessons List */}
                  <Text style={styles.sectionHeading}>Module Lessons</Text>
                  {activeCourse.lessons.map((lesson, idx) => (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonCard,
                        activeLesson?.id === lesson.id && styles.activeLessonCard,
                      ]}
                      onPress={() => setActiveLesson(lesson)}
                    >
                      <View style={styles.lessonLeft}>
                        {lesson.completed ? (
                          <CheckCircle2 color={COLORS.success} size={20} />
                        ) : (
                          <PlayCircle color={COLORS.primary} size={20} />
                        )}
                        <Text style={styles.lessonTitle}>
                          {idx + 1}. {lesson.title}
                        </Text>
                      </View>
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </TouchableOpacity>
                  ))}

                  {/* Active Lesson Reader Content */}
                  {activeLesson && (
                    <View style={styles.readerBox}>
                      <Text style={styles.readerHeading}>{activeLesson.title}</Text>
                      <Text style={styles.readerContent}>{activeLesson.content}</Text>

                      <TouchableOpacity
                        style={[
                          styles.completeLessonBtn,
                          activeLesson.completed && { backgroundColor: COLORS.cardBgLight },
                        ]}
                        onPress={() => handleCompleteLesson(activeLesson)}
                        disabled={activeLesson.completed}
                      >
                        <CheckCircle2
                          color={activeLesson.completed ? COLORS.success : '#FFFFFF'}
                          size={18}
                        />
                        <Text
                          style={[
                            styles.completeLessonBtnText,
                            activeLesson.completed && { color: COLORS.success },
                          ]}
                        >
                          {activeLesson.completed ? 'Lesson Completed (+50 XP)' : 'Mark Lesson Complete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Start Quiz Button */}
                  {activeCourse.quiz && activeCourse.quiz.length > 0 && (
                    <TouchableOpacity
                      style={styles.quizStartBtn}
                      onPress={handleStartQuiz}
                      activeOpacity={0.85}
                    >
                      <HelpCircle color="#FFFFFF" size={20} />
                      <Text style={styles.quizStartText}>Take Knowledge Quiz & Earn Badge</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              ) : (
                /* Interactive Quiz View */
                <View style={styles.quizContainer}>
                  <View style={styles.quizHeader}>
                    <Award color={COLORS.warning} size={24} />
                    <Text style={styles.quizProgressText}>
                      Question {currentQuizIndex + 1} of {activeCourse.quiz.length}
                    </Text>
                  </View>

                  <Text style={styles.questionText}>
                    {activeCourse.quiz[currentQuizIndex].question}
                  </Text>

                  {/* Options */}
                  <View style={styles.optionsList}>
                    {activeCourse.quiz[currentQuizIndex].options.map((opt, i) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = i === activeCourse.quiz[currentQuizIndex].correctIndex;
                      let optionStyle: any = styles.quizOption;

                      if (selectedOption !== null) {
                        if (isCorrect) optionStyle = [styles.quizOption, styles.correctOption];
                        else if (isSelected) optionStyle = [styles.quizOption, styles.wrongOption];
                      }

                      return (
                        <TouchableOpacity
                          key={i}
                          style={optionStyle}
                          onPress={() => handleSelectOption(i)}
                          disabled={selectedOption !== null}
                        >
                          <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Explanation feedback */}
                  {selectedOption !== null && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText}>
                        💡 {activeCourse.quiz[currentQuizIndex].explanation}
                      </Text>

                      <TouchableOpacity style={styles.nextQuizBtn} onPress={handleNextQuestion}>
                        <Text style={styles.nextQuizBtnText}>
                          {currentQuizIndex + 1 < activeCourse.quiz.length
                            ? 'Next Question'
                            : 'Finish Quiz'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  activePill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  courseList: {
    paddingBottom: 30,
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
    lineHeight: 20,
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
