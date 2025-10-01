import React, { useState, useMemo } from 'react';
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
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, AlertTriangle, Edit, X, Save, Plus, Minus } from 'lucide-react-native';
import { useAdmin } from '@/app/contexts/AdminContext';
import { MenuItem } from '@/data/menuItems';
import { Colors } from '@/constants/colors';

export default function InventoryScreen() {
  const { menuItems, updateInventory, updateInventorySettings, getLowStockItems, isAuthenticated } = useAdmin();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<{
    quantity: string;
    alertThreshold: string;
    alertEnabled: boolean;
    unit: string;
  }>({
    quantity: '',
    alertThreshold: '',
    alertEnabled: false,
    unit: 'units'
  });
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'alerts-enabled'>('all');

  const lowStockItems = useMemo(() => getLowStockItems(), [getLowStockItems]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'low-stock':
        return lowStockItems;
      case 'alerts-enabled':
        return menuItems.filter(item => item.inventory?.alertEnabled);
      default:
        return menuItems;
    }
  }, [menuItems, lowStockItems, filter]);

  if (!isAuthenticated) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>Access Denied</Text>
        <Text style={styles.unauthorizedSubtext}>Please login to manage inventory</Text>
      </View>
    );
  }

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      quantity: item.inventory?.quantity?.toString() || '0',
      alertThreshold: item.inventory?.alertThreshold?.toString() || '5',
      alertEnabled: item.inventory?.alertEnabled || false,
      unit: item.inventory?.unit || 'units'
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    const quantity = parseInt(formData.quantity, 10);
    const alertThreshold = parseInt(formData.alertThreshold, 10);

    if (isNaN(quantity) || quantity < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (isNaN(alertThreshold) || alertThreshold < 0) {
      Alert.alert('Error', 'Please enter a valid alert threshold');
      return;
    }

    updateInventory(editingItem.id, quantity);
    updateInventorySettings(editingItem.id, {
      alertThreshold,
      alertEnabled: formData.alertEnabled,
      unit: formData.unit.trim() || 'units'
    });

    setModalVisible(false);
    setEditingItem(null);
  };

  const quickUpdateQuantity = (item: MenuItem, change: number) => {
    const currentQuantity = item.inventory?.quantity || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    updateInventory(item.id, newQuantity);
  };

  const getStockStatus = (item: MenuItem) => {
    if (!item.inventory) return { status: 'unknown', color: '#8B4513' };
    
    const { quantity, alertThreshold = 0, alertEnabled } = item.inventory;
    
    if (alertEnabled && quantity <= alertThreshold) {
      return { status: 'low', color: '#DC143C' };
    }
    
    if (quantity === 0) {
      return { status: 'out', color: '#8B0000' };
    }
    
    return { status: 'good', color: '#228B22' };
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8E8E8', '#DCDCDC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Inventory Management</Text>
          <Text style={styles.subtitle}>
            {lowStockItems.length > 0 && (
              <Text style={styles.alertText}>{lowStockItems.length} low stock alerts</Text>
            )}
          </Text>
        </View>
        <Package color="#8B4513" size={28} />
      </LinearGradient>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'low-stock' && styles.filterButtonActive]}
            onPress={() => setFilter('low-stock')}
          >
            <AlertTriangle color={filter === 'low-stock' ? '#FFF' : '#DC143C'} size={16} />
            <Text style={[styles.filterText, filter === 'low-stock' && styles.filterTextActive]}>Low Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'alerts-enabled' && styles.filterButtonActive]}
            onPress={() => setFilter('alerts-enabled')}
          >
            <Text style={[styles.filterText, filter === 'alerts-enabled' && styles.filterTextActive]}>Alerts Enabled</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsContainer}>
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                      <Text style={styles.stockBadgeText}>
                        {item.inventory?.quantity || 0} {item.inventory?.unit || 'units'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemCategory}>Category: {item.category}</Text>
                  {item.inventory?.alertEnabled && (
                    <Text style={styles.alertInfo}>
                      Alert when ≤ {item.inventory.alertThreshold} {item.inventory.unit}
                    </Text>
                  )}
                  {stockStatus.status === 'low' && (
                    <View style={styles.lowStockWarning}>
                      <AlertTriangle color="#DC143C" size={14} />
                      <Text style={styles.lowStockText}>Low Stock Alert</Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => quickUpdateQuantity(item, -1)}
                    >
                      <Minus color="#FFF" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => quickUpdateQuantity(item, 1)}
                    >
                      <Plus color="#FFF" size={16} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(item)}
                  >
                    <Edit color="#FFF" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Inventory</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <X color="#8B4513" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {editingItem && (
              <View style={styles.itemPreview}>
                <Image source={{ uri: editingItem.image }} style={styles.previewImage} />
                <Text style={styles.previewName}>{editingItem.name}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Quantity *</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                value={formData.unit}
                onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                placeholder="units"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Enable Low Stock Alerts</Text>
                <Switch
                  value={formData.alertEnabled}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, alertEnabled: value }))}
                  trackColor={{ false: '#D3D3D3', true: '#D4AF37' }}
                  thumbColor={formData.alertEnabled ? '#FFF' : '#FFF'}
                />
              </View>
            </View>

            {formData.alertEnabled && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Alert Threshold</Text>
                <TextInput
                  style={styles.input}
                  value={formData.alertThreshold}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, alertThreshold: text }))}
                  placeholder="5"
                  keyboardType="numeric"
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
            >
              <Save color="#FFF" size={20} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
  alertText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  filterContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.3)',
    backgroundColor: '#FFF',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterText: {
    fontSize: 14,
    color: '#8B4513',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
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
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemCategory: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  alertInfo: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '500',
    marginBottom: 4,
  },
  lowStockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lowStockText: {
    fontSize: 11,
    color: '#DC143C',
    fontWeight: 'bold',
  },
  itemActions: {
    alignItems: 'center',
    gap: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    gap: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#228B22',
    justifyContent: 'center',
    alignItems: 'center',
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
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
    flex: 1,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});