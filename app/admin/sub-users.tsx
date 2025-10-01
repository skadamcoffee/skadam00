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
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Plus, Edit3, Trash2, Eye, EyeOff, UserCheck, UserX } from 'lucide-react-native';
import { useAdmin, SubUser } from '@/app/contexts/AdminContext';
import { Colors } from '@/constants/colors';

interface SubUserFormData {
  username: string;
  password: string;
  name: string;
  isActive: boolean;
}

function SubUserModal({ 
  visible, 
  onClose, 
  onSave, 
  editingUser 
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: SubUserFormData) => void;
  editingUser?: SubUser | null;
}) {
  const [formData, setFormData] = useState<SubUserFormData>({
    username: editingUser?.username || '',
    password: editingUser?.password || '',
    name: editingUser?.name || '',
    isActive: editingUser?.isActive ?? true,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSave = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (formData.username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    if (formData.password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }

    onSave(formData);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      username: editingUser?.username || '',
      password: editingUser?.password || '',
      name: editingUser?.name || '',
      isActive: editingUser?.isActive ?? true,
    });
    setShowPassword(false);
  };

  React.useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, editingUser]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#2D1810', '#3D2317']}
          style={styles.modalHeader}
        >
          <Text style={styles.modalTitle}>
            {editingUser ? 'Edit Sub-User' : 'Add Sub-User'}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            testID="close-modal"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter full name"
              placeholderTextColor="#8B4513"
              testID="name-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text.toLowerCase().trim() })}
              placeholder="Enter username"
              placeholderTextColor="#8B4513"
              autoCapitalize="none"
              testID="username-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Enter password"
                placeholderTextColor="#8B4513"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                testID="password-input"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                testID="toggle-password"
              >
                {showPassword ? (
                  <EyeOff color="#8B4513" size={20} />
                ) : (
                  <Eye color="#8B4513" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={[styles.statusButton, formData.isActive ? styles.activeStatus : styles.inactiveStatus]}
              onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
              testID="status-toggle"
            >
              {formData.isActive ? (
                <UserCheck color="#FFF" size={20} />
              ) : (
                <UserX color="#FFF" size={20} />
              )}
              <Text style={styles.statusText}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.permissionsInfo}>
            <Text style={styles.permissionsTitle}>Permissions</Text>
            <Text style={styles.permissionsText}>
              • Access to Order Management only
              • Can view, update, and manage customer orders
              • Cannot access menu items, categories, inventory, or settings
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              testID="cancel-button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              testID="save-button"
            >
              <Text style={styles.saveButtonText}>
                {editingUser ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function SubUsersScreen() {
  const { subUsers, addSubUser, updateSubUser, deleteSubUser, currentUser } = useAdmin();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);

  // Only admin can access this screen
  if (currentUser?.type !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>
            Only administrators can manage sub-users
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddUser = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEditUser = (user: SubUser) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = (user: SubUser) => {
    Alert.alert(
      'Delete Sub-User',
      `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSubUser(user.id)
        }
      ]
    );
  };

  const handleSaveUser = (data: SubUserFormData) => {
    // Check if username already exists (for new users or different user)
    const existingUser = subUsers.find(u => 
      u.username === data.username && u.id !== editingUser?.id
    );
    
    if (existingUser) {
      Alert.alert('Error', 'Username already exists. Please choose a different username.');
      return;
    }

    if (editingUser) {
      updateSubUser(editingUser.id, data);
    } else {
      addSubUser({
        ...data,
        permissions: 'orders_only'
      });
    }
  };

  const toggleUserStatus = (user: SubUser) => {
    updateSubUser(user.id, { isActive: !user.isActive });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2D1810', '#3D2317']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Users color="#F5E6D3" size={32} />
          <Text style={styles.title}>Sub-Users Management</Text>
          <Text style={styles.subtitle}>Manage order management staff</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{subUsers.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{subUsers.filter(u => u.isActive).length}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddUser}
            testID="add-user-button"
          >
            <Plus color="#FFF" size={20} />
            <Text style={styles.addButtonText}>Add Sub-User</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {subUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Users color="#8B4513" size={48} />
              <Text style={styles.emptyStateTitle}>No Sub-Users</Text>
              <Text style={styles.emptyStateText}>
                Create sub-users to give staff access to order management
              </Text>
            </View>
          ) : (
            subUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.userHeader}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={[styles.statusBadge, user.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                      <Text style={styles.statusBadgeText}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                  <Text style={styles.userPermissions}>Orders Management Only</Text>
                  <Text style={styles.userDate}>
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, user.isActive ? styles.deactivateButton : styles.activateButton]}
                    onPress={() => toggleUserStatus(user)}
                    testID={`toggle-status-${user.id}`}
                  >
                    {user.isActive ? (
                      <UserX color="#FFF" size={16} />
                    ) : (
                      <UserCheck color="#FFF" size={16} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditUser(user)}
                    testID={`edit-user-${user.id}`}
                  >
                    <Edit3 color="#FFF" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(user)}
                    testID={`delete-user-${user.id}`}
                  >
                    <Trash2 color="#FFF" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <SubUserModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5E6D3',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#D4AF37',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.8,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#228B22',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  usersList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#228B22',
  },
  inactiveBadge: {
    backgroundColor: '#DC143C',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userUsername: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 2,
  },
  userPermissions: {
    fontSize: 12,
    color: '#D4AF37',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.6,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateButton: {
    backgroundColor: '#228B22',
  },
  deactivateButton: {
    backgroundColor: '#DC143C',
  },
  editButton: {
    backgroundColor: '#FF8C00',
  },
  deleteButton: {
    backgroundColor: '#DC143C',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC143C',
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5E6D3',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 230, 211, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#F5E6D3',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D1810',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#2D1810',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeStatus: {
    backgroundColor: '#228B22',
  },
  inactiveStatus: {
    backgroundColor: '#DC143C',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  permissionsInfo: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 8,
  },
  permissionsText: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#228B22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});