import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Brain,
  CheckCircle,
  XCircle,
  Save,
  X,
  Camera,
  ImageIcon,
  Trash
} from 'lucide-react-native';
import { useAdmin } from '@/app/contexts/AdminContext';
import { useQuiz, QuizQuestion } from '@/app/contexts/QuizContext';
import { Colors } from '@/constants/colors';

interface QuestionFormData {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  isActive: boolean;
  imageUri?: string;
}

function QuestionModal({ visible, onClose, onSave, question }: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: QuestionFormData) => void;
  question?: QuizQuestion;
}) {
  const [formData, setFormData] = useState<QuestionFormData>({
    question: question?.question || '',
    options: question?.options as [string, string, string, string] || ['', '', '', ''],
    correctAnswer: question?.correctAnswer || 0,
    isActive: question?.isActive ?? true,
    imageUri: question?.imageUri
  });

  const handleSave = () => {
    if (!formData.question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    
    if (formData.options.some(option => !option.trim())) {
      Alert.alert('Error', 'Please fill all answer options');
      return;
    }

    onSave(formData);
    onClose();
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options] as [string, string, string, string];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select images.');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUri: undefined });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.modalHeader}
        >
          <Text style={styles.modalTitle}>
            {question ? 'Edit Question' : 'Add New Question'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Question</Text>
            <TextInput
              style={styles.textInput}
              value={formData.question}
              onChangeText={(text) => setFormData({ ...formData, question: text })}
              placeholder="Enter your question here..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Question Image (Optional)</Text>
            {formData.imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: formData.imageUri }} style={styles.questionImage} />
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                    <Camera color={Colors.primary} size={16} />
                    <Text style={styles.changeImageText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Trash color={Colors.error} size={16} />
                    <Text style={styles.removeImageText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <ImageIcon color={Colors.primary} size={24} />
                <Text style={styles.addImageText}>Add Image from Gallery</Text>
                <Text style={styles.addImageSubtext}>Tap to select an image for this question</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Answer Options</Text>
            {formData.options.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.correctButton,
                    formData.correctAnswer === index && styles.correctButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, correctAnswer: index })}
                >
                  <CheckCircle 
                    color={formData.correctAnswer === index ? '#FFF' : Colors.success} 
                    size={20} 
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.optionInput}
                  value={option}
                  onChangeText={(text) => updateOption(index, text)}
                  placeholder={`Option ${index + 1}`}
                />
              </View>
            ))}
            <Text style={styles.helperText}>
              Tap the check icon to mark the correct answer
            </Text>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Active Question</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  formData.isActive && styles.switchActive
                ]}
                onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                <View style={[
                  styles.switchThumb,
                  formData.isActive && styles.switchThumbActive
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save color="#FFF" size={20} />
            <Text style={styles.saveButtonText}>Save Question</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminQuizQuestionsScreen() {
  const { isAuthenticated } = useAdmin();
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useQuiz();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | undefined>();

  if (!isAuthenticated) {
    router.replace('/admin');
    return null;
  }

  const handleAddQuestion = () => {
    setEditingQuestion(undefined);
    setShowModal(true);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleSaveQuestion = (data: QuestionFormData) => {
    if (editingQuestion) {
      updateQuestion(editingQuestion.id, data);
    } else {
      addQuestion(data);
    }
  };

  const handleDeleteQuestion = (question: QuizQuestion) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteQuestion(question.id) 
        }
      ]
    );
  };

  const activeQuestions = questions.filter(q => q.isActive);
  const inactiveQuestions = questions.filter(q => !q.isActive);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Quiz Questions</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddQuestion}
          >
            <Plus color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeQuestions.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{inactiveQuestions.length}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{questions.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {questions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Brain color="#CCC" size={64} />
            <Text style={styles.emptyTitle}>No Questions Yet</Text>
            <Text style={styles.emptyText}>
              Create your first quiz question to get started!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddQuestion}>
              <Plus color="#FFF" size={20} />
              <Text style={styles.emptyButtonText}>Add First Question</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.questionsContainer}>
            {questions.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumber}>
                    <Text style={styles.questionNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.questionStatus}>
                    {question.isActive ? (
                      <CheckCircle color={Colors.success} size={20} />
                    ) : (
                      <XCircle color={Colors.error} size={20} />
                    )}
                    <Text style={[
                      styles.statusText,
                      { color: question.isActive ? Colors.success : Colors.error }
                    ]}>
                      {question.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.questionText}>{question.question}</Text>
                
                {question.imageUri && (
                  <View style={styles.questionImageContainer}>
                    <Image source={{ uri: question.imageUri }} style={styles.questionCardImage} />
                  </View>
                )}

                <View style={styles.optionsContainer}>
                  {question.options.map((option, optionIndex) => (
                    <View key={optionIndex} style={styles.optionRow}>
                      <View style={[
                        styles.optionIndicator,
                        optionIndex === question.correctAnswer && styles.correctIndicator
                      ]}>
                        <Text style={[
                          styles.optionLetter,
                          optionIndex === question.correctAnswer && styles.correctLetter
                        ]}>
                          {String.fromCharCode(65 + optionIndex)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.optionText,
                        optionIndex === question.correctAnswer && styles.correctOptionText
                      ]}>
                        {option}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.questionActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditQuestion(question)}
                  >
                    <Edit3 color={Colors.primary} size={16} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteQuestion(question)}
                  >
                    <Trash2 color={Colors.error} size={16} />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <QuestionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveQuestion}
        question={editingQuestion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  questionsContainer: {
    padding: 20,
    gap: 16,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  questionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctIndicator: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  correctLetter: {
    color: '#FFF',
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  correctOptionText: {
    fontWeight: '600',
    color: Colors.success,
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctButtonActive: {
    backgroundColor: Colors.success,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: Colors.success,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#FFF',
  },
  changeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  removeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  addImageButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  addImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  addImageSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  questionImageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  questionCardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
});