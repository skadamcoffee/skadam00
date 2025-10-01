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
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Edit, Trash2, X, Save, Palette, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdmin } from '@/app/contexts/AdminContext';
import { Category } from '@/data/menuItems';
import { Colors } from '@/constants/colors';

const colorOptions = [
  '#8B4513', '#228B22', '#DAA520', '#CD853F', 
  '#DC143C', '#4169E1', '#9932CC', '#FF6347',
  '#20B2AA', '#FF8C00', '#32CD32', '#FF1493'
];

export default function ManageCategoriesScreen() {
  const { categories, addCategory, updateCategory, deleteCategory, isAuthenticated } = useAdmin();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    image: '',
    color: '#8B4513'
  });
  
  if (!isAuthenticated) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>Access Denied</Text>
        <Text style={styles.unauthorizedSubtext}>Please login to manage categories</Text>
      </View>
    );
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      color: '#8B4513'
    });
    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
      color: category.color
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.description?.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const categoryData = {
      ...formData,
      name: formData.name!.trim(),
      description: formData.description!.trim(),
      image: formData.image!.trim() || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      color: formData.color || '#8B4513'
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
    } else {
      addCategory(categoryData as Omit<Category, 'id'>);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteCategory(category.id)
        }
      ]
    );
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to select images!');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8E8E8', '#DCDCDC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>{categories.length} categories</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddModal}
          testID="add-category-button"
        >
          <Plus color="#FFF" size={24} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.categoryOverlay}
              >
                <View style={styles.categoryContent}>
                  <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </LinearGradient>
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(category)}
                  testID={`edit-category-${category.id}`}
                >
                  <Edit color="#FFF" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(category)}
                  testID={`delete-category-${category.id}`}
                >
                  <Trash2 color="#FFF" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <X color="#8B4513" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Category name"
                testID="category-name-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Category description"
                multiline
                numberOfLines={3}
                testID="category-description-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Image</Text>
              <View style={styles.imageInputContainer}>
                <TextInput
                  style={[styles.input, styles.imageInput]}
                  value={formData.image}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, image: text }))}
                  placeholder="Image URL or select from gallery"
                  testID="category-image-input"
                />
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                  testID="pick-image-button"
                >
                  <Camera color="#FFF" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorPicker}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, color }))}
                    testID={`color-${color}`}
                  >
                    {formData.color === color && (
                      <Palette color="#FFF" size={16} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {formData.image && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Preview</Text>
                <View style={styles.previewContainer}>
                  <Image source={{ uri: formData.image }} style={styles.previewImage} />
                  <View style={[styles.previewColorIndicator, { backgroundColor: formData.color }]} />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              testID="save-category-button"
            >
              <Save color="#FFF" size={20} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.9,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 16,
    gap: 16,
  },
  categoryCard: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  categoryContent: {
    padding: 16,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  categoryActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(34, 139, 34, 0.9)',
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 20, 60, 0.9)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#2D1810',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#2D1810',
  },
  previewContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewColorIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 69, 19, 0.1)',
  },
  saveButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 8,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageInput: {
    flex: 1,
  },
  imagePickerButton: {
    backgroundColor: '#D4AF37',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});