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
import { Plus, Edit, Trash2, X, Save, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdmin } from '@/app/contexts/AdminContext';
import { MenuItem } from '@/data/menuItems';
import { Colors } from '@/constants/colors';

export default function ManageItemsScreen() {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, isAuthenticated } = useAdmin();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    ingredients: [],
    popular: false,
    inventory: {
      quantity: 0,
      alertThreshold: 5,
      alertEnabled: false,
      unit: 'units'
    }
  });
  
  if (!isAuthenticated) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>Access Denied</Text>
        <Text style={styles.unauthorizedSubtext}>Please login to manage items</Text>
      </View>
    );
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      ingredients: [],
      popular: false,
      inventory: {
        quantity: 0,
        alertThreshold: 5,
        alertEnabled: false,
        unit: 'units'
      }
    });
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.replace(' TND', ''),
      image: item.image,
      category: item.category,
      ingredients: item.ingredients || [],
      popular: item.popular || false,
      inventory: {
        quantity: item.inventory?.quantity || 0,
        alertThreshold: item.inventory?.alertThreshold || 5,
        alertEnabled: item.inventory?.alertEnabled || false,
        unit: item.inventory?.unit || 'units'
      }
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.description?.trim() || !formData.price?.trim() || !formData.category?.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const itemData = {
      ...formData,
      name: formData.name!.trim(),
      description: formData.description!.trim(),
      price: `${formData.price!.trim()} TND`,
      image: formData.image!.trim() || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      category: formData.category!.trim(),
      ingredients: formData.ingredients || [],
      popular: formData.popular || false
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData as Omit<MenuItem, 'id'>);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMenuItem(item.id)
        }
      ]
    );
  };

  const updateIngredients = (text: string) => {
    const ingredients = text.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
    setFormData(prev => ({ ...prev, ingredients }));
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
          <Text style={styles.title}>Menu Items</Text>
          <Text style={styles.subtitle}>{menuItems.length} items</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddModal}
          testID="add-item-button"
        >
          <Plus color="#FFF" size={24} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsContainer}>
          {menuItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.itemCategory}>Category: {item.category}</Text>
                {item.popular && (
                  <Text style={styles.popularBadge}>Popular</Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(item)}
                  testID={`edit-item-${item.id}`}
                >
                  <Edit color="#FFF" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item)}
                  testID={`delete-item-${item.id}`}
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
              {editingItem ? 'Edit Item' : 'Add New Item'}
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
                placeholder="Item name"
                testID="item-name-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Item description"
                multiline
                numberOfLines={3}
                testID="item-description-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price (TND) *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="0.00"
                keyboardType="numeric"
                testID="item-price-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      formData.category === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
                    testID={`category-${category.id}`}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category.id && styles.categoryButtonTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Image</Text>
              <View style={styles.imageInputContainer}>
                <TextInput
                  style={[styles.input, styles.imageInput]}
                  value={formData.image}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, image: text }))}
                  placeholder="Image URL or select from gallery"
                  testID="item-image-input"
                />
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                  testID="pick-image-button"
                >
                  <Camera color="#FFF" size={20} />
                </TouchableOpacity>
              </View>
              {formData.image && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: formData.image }} style={styles.previewImage} />
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ingredients (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.ingredients?.join(', ') || ''}
                onChangeText={updateIngredients}
                placeholder="Ingredient 1, Ingredient 2, ..."
                multiline
                numberOfLines={2}
                testID="item-ingredients-input"
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={[styles.checkboxContainer, formData.popular && styles.checkboxActive]}
                onPress={() => setFormData(prev => ({ ...prev, popular: !prev.popular }))}
                testID="item-popular-checkbox"
              >
                <Text style={[styles.checkboxText, formData.popular && styles.checkboxTextActive]}>
                  Mark as Popular
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inventory Settings</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Initial Quantity</Text>
              <TextInput
                style={styles.input}
                value={formData.inventory?.quantity?.toString() || '0'}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  inventory: { 
                    ...prev.inventory!, 
                    quantity: parseInt(text) || 0 
                  } 
                }))}
                placeholder="0"
                keyboardType="numeric"
                testID="item-quantity-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                value={formData.inventory?.unit || 'units'}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  inventory: { 
                    ...prev.inventory!, 
                    unit: text 
                  } 
                }))}
                placeholder="units"
                testID="item-unit-input"
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={[styles.checkboxContainer, formData.inventory?.alertEnabled && styles.checkboxActive]}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  inventory: { 
                    ...prev.inventory!, 
                    alertEnabled: !prev.inventory?.alertEnabled 
                  } 
                }))}
                testID="item-alert-checkbox"
              >
                <Text style={[styles.checkboxText, formData.inventory?.alertEnabled && styles.checkboxTextActive]}>
                  Enable Low Stock Alerts
                </Text>
              </TouchableOpacity>
            </View>

            {formData.inventory?.alertEnabled && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Alert Threshold</Text>
                <TextInput
                  style={styles.input}
                  value={formData.inventory?.alertThreshold?.toString() || '5'}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    inventory: { 
                      ...prev.inventory!, 
                      alertThreshold: parseInt(text) || 5 
                    } 
                  }))}
                  placeholder="5"
                  keyboardType="numeric"
                  testID="item-threshold-input"
                />
                <Text style={styles.helperText}>
                  Alert when quantity is at or below this number
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              testID="save-item-button"
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
  itemsContainer: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  itemDescription: {
    fontSize: 12,
    color: '#8B4513',
    marginBottom: 4,
    lineHeight: 16,
  },
  itemCategory: {
    fontSize: 11,
    color: '#8B4513',
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  popularBadge: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'column',
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
    backgroundColor: '#228B22',
  },
  deleteButton: {
    backgroundColor: '#DC143C',
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
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.3)',
    backgroundColor: '#FFF',
  },
  categoryButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
  categoryButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.3)',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  checkboxActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  checkboxText: {
    fontSize: 16,
    color: '#8B4513',
  },
  checkboxTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.2)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  helperText: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
    marginTop: 4,
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
  imagePreview: {
    marginTop: 12,
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});