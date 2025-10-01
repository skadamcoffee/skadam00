import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  createdAt: number;
  isActive: boolean;
  imageUri?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: number;
  createdAt: number;
  createdBy: 'quiz' | 'admin';
}

export interface QuizAttempt {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
  earnedPromoCode?: string;
}

interface QuizContextType {
  questions: QuizQuestion[];
  promoCodes: PromoCode[];
  attempts: QuizAttempt[];
  addQuestion: (question: Omit<QuizQuestion, 'id' | 'createdAt'>) => void;
  updateQuestion: (id: string, updates: Partial<QuizQuestion>) => void;
  deleteQuestion: (id: string) => void;
  addPromoCode: (promoCode: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  validatePromoCode: (code: string) => PromoCode | null;
  usePromoCode: (code: string) => boolean;
  submitQuizAttempt: (userId: string, score: number, totalQuestions: number) => Promise<string | null>;
  getActiveQuestions: () => QuizQuestion[];
  getUserAttempts: (userId: string) => QuizAttempt[];
  isLoading: boolean;
}

const QUIZ_QUESTIONS_KEY = 'skadam_quiz_questions';
const PROMO_CODES_KEY = 'skadam_promo_codes';
const QUIZ_ATTEMPTS_KEY = 'skadam_quiz_attempts';

const defaultQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the main ingredient in espresso?',
    options: ['Water', 'Coffee beans', 'Milk', 'Sugar'],
    correctAnswer: 1,
    createdAt: Date.now(),
    isActive: true
  },
  {
    id: '2',
    question: 'Which coffee drink contains equal parts espresso, steamed milk, and milk foam?',
    options: ['Latte', 'Cappuccino', 'Americano', 'Macchiato'],
    correctAnswer: 1,
    createdAt: Date.now(),
    isActive: true
  },
  {
    id: '3',
    question: 'What does "SKADAM" represent in our coffee shop?',
    options: ['Quality coffee', 'Fast service', 'Low prices', 'Large portions'],
    correctAnswer: 0,
    createdAt: Date.now(),
    isActive: true
  }
];

export const [QuizProvider, useQuiz] = createContextHook<QuizContextType>(() => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(defaultQuestions);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedQuestions, storedPromoCodes, storedAttempts] = await Promise.all([
        AsyncStorage.getItem(QUIZ_QUESTIONS_KEY),
        AsyncStorage.getItem(PROMO_CODES_KEY),
        AsyncStorage.getItem(QUIZ_ATTEMPTS_KEY)
      ]);

      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      }
      if (storedPromoCodes) {
        setPromoCodes(JSON.parse(storedPromoCodes));
      }
      if (storedAttempts) {
        setAttempts(JSON.parse(storedAttempts));
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuestions = useCallback(async (questionsData: QuizQuestion[]) => {
    try {
      await AsyncStorage.setItem(QUIZ_QUESTIONS_KEY, JSON.stringify(questionsData));
    } catch (error) {
      console.error('Error saving questions:', error);
    }
  }, []);

  const savePromoCodes = useCallback(async (promoCodesData: PromoCode[]) => {
    try {
      await AsyncStorage.setItem(PROMO_CODES_KEY, JSON.stringify(promoCodesData));
    } catch (error) {
      console.error('Error saving promo codes:', error);
    }
  }, []);

  const saveAttempts = useCallback(async (attemptsData: QuizAttempt[]) => {
    try {
      await AsyncStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(attemptsData));
    } catch (error) {
      console.error('Error saving attempts:', error);
    }
  }, []);

  const addQuestion = useCallback((question: Omit<QuizQuestion, 'id' | 'createdAt'>) => {
    const newQuestion: QuizQuestion = {
      ...question,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
  }, [questions, saveQuestions]);

  const updateQuestion = useCallback((id: string, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = questions.map(question => 
      question.id === id ? { ...question, ...updates } : question
    );
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
  }, [questions, saveQuestions]);

  const deleteQuestion = useCallback((id: string) => {
    const updatedQuestions = questions.filter(question => question.id !== id);
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
  }, [questions, saveQuestions]);

  const addPromoCode = useCallback((promoCode: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>) => {
    const newPromoCode: PromoCode = {
      ...promoCode,
      id: Date.now().toString(),
      createdAt: Date.now(),
      usageCount: 0
    };
    const updatedPromoCodes = [...promoCodes, newPromoCode];
    setPromoCodes(updatedPromoCodes);
    savePromoCodes(updatedPromoCodes);
  }, [promoCodes, savePromoCodes]);

  const updatePromoCode = useCallback((id: string, updates: Partial<PromoCode>) => {
    const updatedPromoCodes = promoCodes.map(promoCode => 
      promoCode.id === id ? { ...promoCode, ...updates } : promoCode
    );
    setPromoCodes(updatedPromoCodes);
    savePromoCodes(updatedPromoCodes);
  }, [promoCodes, savePromoCodes]);

  const deletePromoCode = useCallback((id: string) => {
    const updatedPromoCodes = promoCodes.filter(promoCode => promoCode.id !== id);
    setPromoCodes(updatedPromoCodes);
    savePromoCodes(updatedPromoCodes);
  }, [promoCodes, savePromoCodes]);

  const validatePromoCode = useCallback((code: string): PromoCode | null => {
    const promoCode = promoCodes.find(pc => 
      pc.code.toLowerCase() === code.toLowerCase() && 
      pc.isActive &&
      (!pc.maxUsage || pc.usageCount < pc.maxUsage) &&
      (!pc.expiresAt || pc.expiresAt > Date.now())
    );
    return promoCode || null;
  }, [promoCodes]);

  const usePromoCode = useCallback((code: string): boolean => {
    const promoCode = validatePromoCode(code);
    if (!promoCode) return false;

    const updatedPromoCodes = promoCodes.map(pc => 
      pc.id === promoCode.id ? { ...pc, usageCount: pc.usageCount + 1 } : pc
    );
    setPromoCodes(updatedPromoCodes);
    savePromoCodes(updatedPromoCodes);
    return true;
  }, [promoCodes, validatePromoCode, savePromoCodes]);

  const submitQuizAttempt = useCallback(async (userId: string, score: number, totalQuestions: number): Promise<string | null> => {
    const newAttempt: QuizAttempt = {
      id: Date.now().toString(),
      userId,
      score,
      totalQuestions,
      completedAt: Date.now()
    };

    // Check if user got perfect score
    if (score === totalQuestions) {
      // Generate a unique promo code for this user
      const promoCodeValue = `QUIZ${Date.now().toString().slice(-6)}`;
      const newPromoCode: PromoCode = {
        id: Date.now().toString(),
        code: promoCodeValue,
        discountPercentage: 15, // 15% discount for perfect quiz score
        description: `Quiz Perfect Score Reward - ${score}/${totalQuestions}`,
        isActive: true,
        usageCount: 0,
        maxUsage: 1, // Single use
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // Expires in 7 days
        createdAt: Date.now(),
        createdBy: 'quiz'
      };

      newAttempt.earnedPromoCode = promoCodeValue;
      
      const updatedPromoCodes = [...promoCodes, newPromoCode];
      setPromoCodes(updatedPromoCodes);
      savePromoCodes(updatedPromoCodes);
    }

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    saveAttempts(updatedAttempts);

    return newAttempt.earnedPromoCode || null;
  }, [promoCodes, attempts, savePromoCodes, saveAttempts]);

  const getActiveQuestions = useCallback((): QuizQuestion[] => {
    return questions.filter(question => question.isActive);
  }, [questions]);

  const getUserAttempts = useCallback((userId: string): QuizAttempt[] => {
    return attempts.filter(attempt => attempt.userId === userId).sort((a, b) => b.completedAt - a.completedAt);
  }, [attempts]);

  return useMemo(() => ({
    questions,
    promoCodes,
    attempts,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode,
    usePromoCode,
    submitQuizAttempt,
    getActiveQuestions,
    getUserAttempts,
    isLoading
  }), [questions, promoCodes, attempts, addQuestion, updateQuestion, deleteQuestion, addPromoCode, updatePromoCode, deletePromoCode, validatePromoCode, usePromoCode, submitQuizAttempt, getActiveQuestions, getUserAttempts, isLoading]);
});