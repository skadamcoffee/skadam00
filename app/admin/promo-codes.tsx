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
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Gift,
  CheckCircle,
  XCircle,
  Save,
  X,
  Calendar,
  Percent,
  Users,
  Clock
} from 'lucide-react-native';
import { useAdmin } from '@/app/contexts/AdminContext';
import { useQuiz, PromoCode } from '@/app/contexts/QuizContext';
import { Colors } from '@/constants/colors';

interface PromoCodeFormData {
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
  maxUsage?: number;
  expiresAt?: number;
}

function PromoCodeModal({ visible, onClose, onSave, promoCode }: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: PromoCodeFormData) => void;
  promoCode?: PromoCode;
}) {
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: promoCode?.code || '',
    discountPercentage: promoCode?.discountPercentage || 10,
    description: promoCode?.description || '',
    isActive: promoCode?.isActive ?? true,
    maxUsage: promoCode?.maxUsage,
    expiresAt: promoCode?.expiresAt
  });
  const [hasExpiry, setHasExpiry] = useState<boolean>(!!promoCode?.expiresAt);
  const [hasMaxUsage, setHasMaxUsage] = useState<boolean>(!!promoCode?.maxUsage);
  const [expiryDays, setExpiryDays] = useState<string>('7');

  const handleSave = () => {
    if (!formData.code.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }
    
    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      Alert.alert('Error', 'Discount percentage must be between 1 and 100');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const finalData = {
      ...formData,
      code: formData.code.toUpperCase(),
      maxUsage: hasMaxUsage ? formData.maxUsage : undefined,
      expiresAt: hasExpiry ? Date.now() + (parseInt(expiryDays) * 24 * 60 * 60 * 1000) : undefined
    };

    onSave(finalData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.modalHeader}
        >
          <Text style={styles.modalTitle}>
            {promoCode ? 'Edit Promo Code' : 'Create Promo Code'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Promo Code</Text>
            <TextInput
              style={styles.textInput}
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
              placeholder="SAVE20"
              autoCapitalize="characters"
              maxLength={20}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Discount Percentage</Text>
            <View style={styles.percentageContainer}>
              <TextInput
                style={styles.percentageInput}
                value={formData.discountPercentage.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setFormData({ ...formData, discountPercentage: Math.min(100, Math.max(0, num)) });
                }}
                keyboardType="numeric"
                maxLength={3}
              />
              <Percent color={Colors.primary} size={20} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Special discount for loyal customers"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Maximum Usage Limit</Text>
              <TouchableOpacity
                style={[styles.switch, hasMaxUsage && styles.switchActive]}
                onPress={() => setHasMaxUsage(!hasMaxUsage)}
              >
                <View style={[styles.switchThumb, hasMaxUsage && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>
            {hasMaxUsage && (
              <TextInput
                style={styles.textInput}
                value={formData.maxUsage?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, maxUsage: parseInt(text) || undefined })}
                placeholder="100"
                keyboardType="numeric"
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Expiry Date</Text>
              <TouchableOpacity
                style={[styles.switch, hasExpiry && styles.switchActive]}
                onPress={() => setHasExpiry(!hasExpiry)}
              >
                <View style={[styles.switchThumb, hasExpiry && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>
            {hasExpiry && (
              <View style={styles.expiryContainer}>
                <Text style={styles.expiryLabel}>Expires in:</Text>
                <TextInput
                  style={styles.expiryInput}
                  value={expiryDays}
                  onChangeText={setExpiryDays}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.expiryLabel}>days</Text>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Active</Text>
              <TouchableOpacity
                style={[styles.switch, formData.isActive && styles.switchActive]}
                onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                <View style={[styles.switchThumb, formData.isActive && styles.switchThumbActive]} />
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
            <Text style={styles.saveButtonText}>Save Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminPromoCodesScreen() {
  const { isAuthenticated } = useAdmin();
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = useQuiz();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | undefined>();

  if (!isAuthenticated) {
    router.replace('/admin');
    return null;
  }

  const handleAddPromoCode = () => {
    setEditingPromoCode(undefined);
    setShowModal(true);
  };

  const handleEditPromoCode = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setShowModal(true);
  };

  const handleSavePromoCode = (data: PromoCodeFormData) => {
    if (editingPromoCode) {
      updatePromoCode(editingPromoCode.id, data);
    } else {
      addPromoCode({ ...data, createdBy: 'admin' });
    }
  };

  const handleDeletePromoCode = (promoCode: PromoCode) => {
    Alert.alert(
      'Delete Promo Code',
      `Are you sure you want to delete "${promoCode.code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deletePromoCode(promoCode.id) 
        }
      ]
    );
  };

  const activePromoCodes = promoCodes.filter(pc => pc.isActive);
  const inactivePromoCodes = promoCodes.filter(pc => !pc.isActive);
  const quizPromoCodes = promoCodes.filter(pc => pc.createdBy === 'quiz');
  const adminPromoCodes = promoCodes.filter(pc => pc.createdBy === 'admin');

  const isExpired = (promoCode: PromoCode) => {
    return promoCode.expiresAt && promoCode.expiresAt < Date.now();
  };

  const isMaxUsageReached = (promoCode: PromoCode) => {
    return promoCode.maxUsage && promoCode.usageCount >= promoCode.maxUsage;
  };

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
          <Text style={styles.title}>Promo Codes</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPromoCode}
          >
            <Plus color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activePromoCodes.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{quizPromoCodes.length}</Text>
            <Text style={styles.statLabel}>Quiz Rewards</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{adminPromoCodes.length}</Text>
            <Text style={styles.statLabel}>Admin Created</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {promoCodes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Gift color="#CCC" size={64} />
            <Text style={styles.emptyTitle}>No Promo Codes Yet</Text>
            <Text style={styles.emptyText}>
              Create your first promo code to offer discounts to customers!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddPromoCode}>
              <Plus color="#FFF" size={20} />
              <Text style={styles.emptyButtonText}>Create First Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.promoCodesContainer}>
            {promoCodes.map((promoCode) => {
              const expired = isExpired(promoCode);
              const maxUsageReached = isMaxUsageReached(promoCode);
              const isInvalid = expired || maxUsageReached || !promoCode.isActive;

              return (
                <View key={promoCode.id} style={[
                  styles.promoCodeCard,
                  isInvalid && styles.invalidPromoCodeCard
                ]}>
                  <View style={styles.promoCodeHeader}>
                    <View style={styles.promoCodeInfo}>
                      <Text style={styles.promoCodeText}>{promoCode.code}</Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{promoCode.discountPercentage}% OFF</Text>
                      </View>
                    </View>
                    <View style={styles.promoCodeStatus}>
                      {promoCode.createdBy === 'quiz' && (
                        <View style={styles.quizBadge}>
                          <Text style={styles.quizBadgeText}>Quiz Reward</Text>
                        </View>
                      )}
                      {promoCode.isActive && !expired && !maxUsageReached ? (
                        <CheckCircle color={Colors.success} size={20} />
                      ) : (
                        <XCircle color={Colors.error} size={20} />
                      )}
                    </View>
                  </View>

                  <Text style={styles.promoCodeDescription}>{promoCode.description}</Text>

                  <View style={styles.promoCodeDetails}>
                    <View style={styles.detailRow}>
                      <Users color={Colors.textSecondary} size={16} />
                      <Text style={styles.detailText}>
                        Used: {promoCode.usageCount}
                        {promoCode.maxUsage ? ` / ${promoCode.maxUsage}` : ' times'}
                      </Text>
                    </View>
                    
                    {promoCode.expiresAt && (
                      <View style={styles.detailRow}>
                        <Calendar color={expired ? Colors.error : Colors.textSecondary} size={16} />
                        <Text style={[
                          styles.detailText,
                          expired && styles.expiredText
                        ]}>
                          {expired ? 'Expired' : 'Expires'}: {new Date(promoCode.expiresAt).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Clock color={Colors.textSecondary} size={16} />
                      <Text style={styles.detailText}>
                        Created: {new Date(promoCode.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {expired && (
                    <View style={styles.warningBanner}>
                      <Text style={styles.warningText}>⚠️ This promo code has expired</Text>
                    </View>
                  )}

                  {maxUsageReached && (
                    <View style={styles.warningBanner}>
                      <Text style={styles.warningText}>⚠️ Maximum usage limit reached</Text>
                    </View>
                  )}

                  {promoCode.createdBy === 'admin' && (
                    <View style={styles.promoCodeActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditPromoCode(promoCode)}
                      >
                        <Edit3 color={Colors.primary} size={16} />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePromoCode(promoCode)}
                      >
                        <Trash2 color={Colors.error} size={16} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <PromoCodeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSavePromoCode}
        promoCode={editingPromoCode}
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
  promoCodesContainer: {
    padding: 20,
    gap: 16,
  },
  promoCodeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  invalidPromoCodeCard: {
    opacity: 0.6,
    borderLeftColor: Colors.error,
  },
  promoCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promoCodeInfo: {
    flex: 1,
  },
  promoCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  promoCodeStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  quizBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quizBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  promoCodeDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  promoCodeDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  expiredText: {
    color: Colors.error,
    fontWeight: '600',
  },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
  },
  promoCodeActions: {
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
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  percentageInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
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
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  expiryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  expiryInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    width: 80,
    textAlign: 'center',
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
});