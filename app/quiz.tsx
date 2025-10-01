import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Trophy, 
  Brain, 
  CheckCircle, 
  XCircle,
  Gift,
  Clock,
  Star,
  Zap
} from 'lucide-react-native';
import { useQuiz, QuizQuestion } from '@/app/contexts/QuizContext';
import { useSound } from '@/app/contexts/SoundContext';
import { Colors } from '@/constants/colors';



interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: number[];
  score: number;
  isCompleted: boolean;
  timeLeft: number;
  isAnswered: boolean;
}

export default function QuizScreen() {
  const { getActiveQuestions, submitQuizAttempt } = useQuiz();
  const { playSound } = useSound();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    score: 0,
    isCompleted: false,
    timeLeft: 30,
    isAnswered: false
  });
  const [earnedPromoCode, setEarnedPromoCode] = useState<string | null>(null);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    const activeQuestions = getActiveQuestions();
    if (activeQuestions.length === 0) {
      Alert.alert(
        'No Questions Available',
        'There are no active quiz questions at the moment. Please try again later.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
    setQuestions(activeQuestions);
    startTimer();
  }, []);

  useEffect(() => {
    const progress = questions.length > 0 ? (quizState.currentQuestionIndex + 1) / questions.length : 0;
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [quizState.currentQuestionIndex, questions.length]);

  const startTimer = () => {
    const timer = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeLeft <= 1 || prev.isAnswered || prev.isCompleted) {
          clearInterval(timer);
          if (prev.timeLeft <= 1 && !prev.isAnswered) {
            handleTimeUp();
          }
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    playSound('error');
    setQuizState(prev => ({ ...prev, isAnswered: true }));
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (quizState.isAnswered) return;

    const currentQuestion = questions[quizState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playSound('success');
    } else {
      playSound('error');
    }

    setQuizState(prev => ({
      ...prev,
      selectedAnswers: [...prev.selectedAnswers, answerIndex],
      score: isCorrect ? prev.score + 1 : prev.score,
      isAnswered: true
    }));

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setQuizState(prev => {
        const nextIndex = prev.currentQuestionIndex + 1;
        if (nextIndex >= questions.length) {
          completeQuiz(prev.score);
          return { ...prev, isCompleted: true };
        }
        return {
          ...prev,
          currentQuestionIndex: nextIndex,
          timeLeft: 30,
          isAnswered: false
        };
      });

      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      startTimer();
    });
  };

  const completeQuiz = async (finalScore: number) => {
    playSound('success');
    const userId = `user_${Date.now()}`;
    const promoCode = await submitQuizAttempt(userId, finalScore, questions.length);
    setEarnedPromoCode(promoCode);
  };

  const restartQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: [],
      score: 0,
      isCompleted: false,
      timeLeft: 30,
      isAnswered: false
    });
    setEarnedPromoCode(null);
    progressAnimation.setValue(0);
    fadeAnimation.setValue(1);
    startTimer();
  };

  const getScoreMessage = () => {
    const percentage = (quizState.score / questions.length) * 100;
    if (percentage === 100) return "Perfect! You're a coffee expert! ☕️";
    if (percentage >= 80) return "Excellent! You know your coffee! 🌟";
    if (percentage >= 60) return "Good job! Keep learning! 👍";
    return "Keep trying! Practice makes perfect! 💪";
  };

  const currentQuestion = questions[quizState.currentQuestionIndex];

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Brain color={Colors.primary} size={64} />
          <Text style={styles.loadingText}>Loading Quiz...</Text>
        </View>
      </View>
    );
  }

  if (quizState.isCompleted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.completedContainer}
        >
          <View style={styles.completedContent}>
            <Trophy color="#FFD700" size={80} />
            <Text style={styles.completedTitle}>Quiz Completed!</Text>
            <Text style={styles.scoreText}>
              {quizState.score} / {questions.length}
            </Text>
            <Text style={styles.scoreMessage}>{getScoreMessage()}</Text>
            
            {earnedPromoCode && (
              <View style={styles.promoCodeContainer}>
                <Gift color="#FFD700" size={32} />
                <Text style={styles.promoCodeTitle}>🎉 Congratulations!</Text>
                <Text style={styles.promoCodeText}>You earned a promo code:</Text>
                <View style={styles.promoCodeBox}>
                  <Text style={styles.promoCodeValue}>{earnedPromoCode}</Text>
                </View>
                <Text style={styles.promoCodeDescription}>
                  Use this code for 15% discount on your next order!
                </Text>
              </View>
            )}

            <View style={styles.completedActions}>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={restartQuiz}
              >
                <Zap color="#FFF" size={20} />
                <Text style={styles.restartButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft color={Colors.primary} size={20} />
                <Text style={styles.backButtonText}>Back to Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Coffee Quiz</Text>
            <Text style={styles.questionCounter}>
              Question {quizState.currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>

          <View style={styles.timerContainer}>
            <Clock color="#FFF" size={20} />
            <Text style={styles.timerText}>{quizState.timeLeft}s</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Brain color={Colors.primary} size={32} />
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </View>
            
            {currentQuestion.imageUri && (
              <View style={styles.questionImageContainer}>
                <Image source={{ uri: currentQuestion.imageUri }} style={styles.questionImage} />
              </View>
            )}

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizState.isAnswered && quizState.selectedAnswers[quizState.currentQuestionIndex] === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = quizState.isAnswered;
                
                let buttonStyle = [styles.optionButton];
                let textStyle = [styles.optionText];
                let iconComponent = null;

                if (showResult) {
                  if (isCorrect) {
                    buttonStyle = [styles.optionButton, styles.correctOption];
                    textStyle = [styles.optionText, styles.correctOptionText];
                    iconComponent = <CheckCircle color="#FFF" size={20} />;
                  } else if (isSelected) {
                    buttonStyle = [styles.optionButton, styles.wrongOption];
                    textStyle = [styles.optionText, styles.wrongOptionText];
                    iconComponent = <XCircle color="#FFF" size={20} />;
                  }
                }

                return (
                  <TouchableOpacity
                    key={`option-${index}`}
                    style={buttonStyle}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={quizState.isAnswered}
                  >
                    <View style={styles.optionContent}>
                      <Text style={textStyle}>{option}</Text>
                      {iconComponent && <View>{iconComponent}</View>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.scoreContainer}>
              <Star color={Colors.gold} size={24} />
              <Text style={styles.currentScore}>Score: {quizState.score}</Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  questionCounter: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    gap: 24,
  },
  questionHeader: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  correctOption: {
    backgroundColor: Colors.success,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.success,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wrongOption: {
    backgroundColor: Colors.error,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.error,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  correctOptionText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600' as const,
    flex: 1,
  },
  wrongOptionText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600' as const,
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  scoreMessage: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  promoCodeContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  promoCodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  promoCodeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  promoCodeBox: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  promoCodeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  promoCodeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  completedActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  restartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  questionImageContainer: {
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
});