import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Search, 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Calendar,
  TrendingUp,
  Gift,
  X,
  Save,
  UserPlus
} from 'lucide-react-native';
import { useLoyalty } from '@/app/contexts/LoyaltyContext';
import { Colors } from '@/constants/colors';
import type { LoyaltyCustomer } from '@/app/contexts/LoyaltyContext';

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2'
};

const TIER_NAMES = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum'
};

interface CustomerFormData {
  name: string;
  phoneNumber: string;
}

export default function CustomerManagementScreen() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, transactions, settings } = useLoyalty();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phoneNumber.includes(searchQuery)
  ).sort((a, b) => b.lastVisit - a.lastVisit);

  const handleAddCustomer = async () => {
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check if phone number already exists
    const existingCustomer = customers.find(c => c.phoneNumber === formData.phoneNumber);
    if (existingCustomer) {
      Alert.alert('Error', 'A customer with this phone number already exists');
      return;
    }

    setIsLoading(true);
    try {
      await addCustomer({
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim()
      });
      
      setFormData({ name: '', phoneNumber: '' });
      setShowAddModal(false);
      Alert.alert('Success', `Customer ${formData.name} has been added successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer || !formData.name.trim() || !formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check if phone number already exists (excluding current customer)
    const existingCustomer = customers.find(c => 
      c.phoneNumber === formData.phoneNumber && c.id !== selectedCustomer.id
    );
    if (existingCustomer) {
      Alert.alert('Error', 'A customer with this phone number already exists');
      return;
    }

    updateCustomer(selectedCustomer.id, {
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim()
    });
    
    setFormData({ name: '', phoneNumber: '' });
    setSelectedCustomer(null);
    setShowEditModal(false);
    Alert.alert('Success', 'Customer information updated successfully!');
  };

  const handleDeleteCustomer = (customer: LoyaltyCustomer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}? This action cannot be undone and will remove all their transaction history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customer.id);
              setRefreshKey(prev => prev + 1);
              Alert.alert('Success', 'Customer has been deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer. Please try again.');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (customer: LoyaltyCustomer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const handleNameChange = (text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
  };

  const handlePhoneChange = (text: string) => {
    setFormData(prev => ({ ...prev, phoneNumber: text }));
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter(t => t.customerId === customerId);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} TND`;
  };

  const AddCustomerModal = () => {
    const [localName, setLocalName] = useState<string>('');
    const [localPhone, setLocalPhone] = useState<string>('');
    const [localLoading, setLocalLoading] = useState<boolean>(false);

    const resetForm = () => {
      setLocalName('');
      setLocalPhone('');
      setLocalLoading(false);
    };

    const handleClose = () => {
      resetForm();
      setShowAddModal(false);
    };

    const handleSave = async () => {
      if (!localName.trim() || !localPhone.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const existingCustomer = customers.find(c => c.phoneNumber === localPhone.trim());
      if (existingCustomer) {
        Alert.alert('Error', 'A customer with this phone number already exists');
        return;
      }

      setLocalLoading(true);
      try {
        await addCustomer({
          name: localName.trim(),
          phoneNumber: localPhone.trim()
        });
        
        Alert.alert('Success', `Customer ${localName.trim()} has been added successfully!`);
        handleClose();
      } catch (error) {
        Alert.alert('Error', 'Failed to add customer. Please try again.');
      } finally {
        setLocalLoading(false);
      }
    };

    return (
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Customer</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X color="#8B4513" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Customer Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={localName}
                  onChangeText={setLocalName}
                  placeholder="Enter customer name"
                  placeholderTextColor="#999"
                  testID="customer-name-input"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!localLoading}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={localPhone}
                  onChangeText={setLocalPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  testID="customer-phone-input"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  maxLength={15}
                  editable={!localLoading}
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                testID="cancel-button"
                disabled={localLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, localLoading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={localLoading}
                testID="save-customer-button"
              >
                <Save color="#FFF" size={16} />
                <Text style={styles.saveButtonText}>
                  {localLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const EditCustomerModal = () => {
    const [localName, setLocalName] = useState<string>('');
    const [localPhone, setLocalPhone] = useState<string>('');
    const [localLoading, setLocalLoading] = useState<boolean>(false);

    React.useEffect(() => {
      if (selectedCustomer && showEditModal) {
        setLocalName(selectedCustomer.name);
        setLocalPhone(selectedCustomer.phoneNumber);
      }
    }, [selectedCustomer, showEditModal]);

    const resetForm = () => {
      setLocalName('');
      setLocalPhone('');
      setLocalLoading(false);
    };

    const handleClose = () => {
      resetForm();
      setShowEditModal(false);
      setSelectedCustomer(null);
    };

    const handleSave = async () => {
      if (!selectedCustomer || !localName.trim() || !localPhone.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const existingCustomer = customers.find(c => 
        c.phoneNumber === localPhone.trim() && c.id !== selectedCustomer.id
      );
      if (existingCustomer) {
        Alert.alert('Error', 'A customer with this phone number already exists');
        return;
      }

      setLocalLoading(true);
      try {
        updateCustomer(selectedCustomer.id, {
          name: localName.trim(),
          phoneNumber: localPhone.trim()
        });
        
        Alert.alert('Success', 'Customer information updated successfully!');
        handleClose();
      } catch (error) {
        Alert.alert('Error', 'Failed to update customer. Please try again.');
      } finally {
        setLocalLoading(false);
      }
    };

    return (
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Customer</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X color="#8B4513" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Customer Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={localName}
                  onChangeText={setLocalName}
                  placeholder="Enter customer name"
                  placeholderTextColor="#999"
                  testID="edit-customer-name-input"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!localLoading}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={localPhone}
                  onChangeText={setLocalPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  testID="edit-customer-phone-input"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  maxLength={15}
                  editable={!localLoading}
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                testID="edit-cancel-button"
                disabled={localLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, localLoading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={localLoading}
                testID="save-edit-customer-button"
              >
                <Save color="#FFF" size={16} />
                <Text style={styles.saveButtonText}>
                  {localLoading ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Customer Management',
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerTintColor: '#1A1A1A',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color="#D4AF37" size={24} fill="#D4AF37" />
            <Text style={styles.sectionTitle}>Customer Overview</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{customers.filter(c => c.isActive).length}</Text>
              <Text style={styles.statLabel}>Active Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {customers.reduce((sum, c) => sum + c.points, 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {customers.reduce((sum, c) => sum + c.visitCount, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Visits</Text>
            </View>
          </View>
        </View>

        {/* Search and Add */}
        <View style={styles.section}>
          <View style={styles.searchAddContainer}>
            <View style={styles.searchContainer}>
              <Search color="#8B4513" size={20} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
                placeholder="Search customers..."
                placeholderTextColor="#8B4513"
                testID="customer-search"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddModal}
              testID="add-customer-button"
            >
              <UserPlus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer List */}
        <View style={styles.section}>
          <View style={styles.card}>
            {filteredCustomers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Users color="#8B4513" size={48} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No customers found matching your search.' : 'No customers yet.'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.emptyAddButton}
                    onPress={openAddModal}
                    testID="empty-add-customer"
                  >
                    <Plus color="#FFF" size={16} />
                    <Text style={styles.emptyAddButtonText}>Add First Customer</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredCustomers.map((customer) => {
                const customerTransactions = getCustomerTransactions(customer.id);
                const earnedPoints = customerTransactions
                  .filter(t => t.type === 'earn')
                  .reduce((sum, t) => sum + t.points, 0);
                const redeemedPoints = customerTransactions
                  .filter(t => t.type === 'redeem')
                  .reduce((sum, t) => sum + Math.abs(t.points), 0);
                
                return (
                  <View key={customer.id} style={styles.customerCard}>
                    <View style={styles.customerHeader}>
                      <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <View style={styles.customerContact}>
                          <Phone color="#8B4513" size={14} />
                          <Text style={styles.customerPhone}>{customer.phoneNumber}</Text>
                        </View>
                      </View>
                      <View style={styles.customerActions}>
                        <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[customer.tier] }]}>
                          <Award color="#FFF" size={12} />
                          <Text style={styles.tierBadgeText}>{TIER_NAMES[customer.tier]}</Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal(customer)}
                            testID={`edit-customer-${customer.id}`}
                          >
                            <Edit3 color="#4F46E5" size={16} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteCustomer(customer)}
                            testID={`delete-customer-${customer.id}`}
                          >
                            <Trash2 color="#EF4444" size={16} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.customerStats}>
                      <View style={styles.customerStat}>
                        <Gift color="#D4AF37" size={16} />
                        <Text style={styles.customerStatValue}>{customer.points}</Text>
                        <Text style={styles.customerStatLabel}>Current Points</Text>
                      </View>
                      <View style={styles.customerStat}>
                        <TrendingUp color="#10B981" size={16} />
                        <Text style={styles.customerStatValue}>{formatCurrency(customer.totalSpent)}</Text>
                        <Text style={styles.customerStatLabel}>Total Spent</Text>
                      </View>
                      <View style={styles.customerStat}>
                        <Calendar color="#8B4513" size={16} />
                        <Text style={styles.customerStatValue}>{customer.visitCount}</Text>
                        <Text style={styles.customerStatLabel}>Visits</Text>
                      </View>
                    </View>
                    
                    <View style={styles.customerDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Points Earned:</Text>
                        <Text style={styles.detailValue}>{earnedPoints.toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Points Redeemed:</Text>
                        <Text style={styles.detailValue}>{redeemedPoints.toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Member Since:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(customer.joinDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Last Visit:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(customer.lastVisit).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <AddCustomerModal />
      <EditCustomerModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
  },
  searchAddContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D1810',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyAddButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 8,
  },
  customerContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerPhone: {
    fontSize: 14,
    color: '#8B4513',
  },
  customerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  customerStat: {
    alignItems: 'center',
    gap: 4,
  },
  customerStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  customerStatLabel: {
    fontSize: 10,
    color: '#8B4513',
  },
  customerDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D1810',
    backgroundColor: '#F9FAFB',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});