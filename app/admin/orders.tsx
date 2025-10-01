import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Modal,
  Share,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package,
  Trash2,
  Filter,
  CreditCard,
  Receipt,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Bell,
  BellOff,
  Phone,
  Gift,
  Tag,
  Sparkles,
  Star,
  Trophy
} from 'lucide-react-native';
import { useAdmin, Order } from '@/app/contexts/AdminContext';
import { useNotifications } from '@/app/contexts/NotificationContext';
import { useLoyalty } from '@/app/contexts/LoyaltyContext';
import { useQuiz } from '@/app/contexts/QuizContext';
import { Colors } from '@/constants/colors';

type OrderStatus = 'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'paid';

const statusConfig = {
  pending: { color: '#FF6B35', icon: Clock, label: 'Pending' },
  preparing: { color: '#FFA500', icon: ChefHat, label: 'Preparing' },
  ready: { color: '#32CD32', icon: Package, label: 'Ready' },
  completed: { color: '#228B22', icon: CheckCircle, label: 'Completed' },
  paid: { color: '#4CAF50', icon: CreditCard, label: 'Paid' }
};

function OrderCard({ order, onStatusUpdate, onDelete, onPaidWithPhone }: {
  order: Order;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onDelete: (orderId: string) => void;
  onPaidWithPhone: (orderId: string) => void;
}) {
  const config = statusConfig[order.status];
  const IconComponent = config.icon;
  const orderDate = new Date(order.timestamp).toLocaleString();
  const paidDate = order.paidAt ? new Date(order.paidAt).toLocaleString() : null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Order',
      `Are you sure you want to delete order #${order.orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => onDelete(order.id) 
        }
      ]
    );
  };

  const statusButtons = [
    { status: 'pending' as const, label: 'Pending', color: '#FF6B35', icon: Clock },
    { status: 'preparing' as const, label: 'Preparing', color: '#FFA500', icon: ChefHat },
    { status: 'ready' as const, label: 'Ready', color: '#32CD32', icon: Package },
    { status: 'completed' as const, label: 'Complete', color: '#228B22', icon: CheckCircle },
    { status: 'paid' as const, label: 'Paid', color: '#4CAF50', icon: CreditCard },
  ];

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <View style={styles.orderTitleRow}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
            <View style={styles.tableInfo}>
              <MapPin color="#D4AF37" size={14} />
              <Text style={styles.tableNumber}>Table {order.tableNumber}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>{orderDate}</Text>
          {paidDate && (
            <Text style={styles.paidDate}>Paid: {paidDate}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Trash2 color="#FF4444" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusButtons}>
        {statusButtons.map((btn) => {
          const BtnIcon = btn.icon;
          const isActive = order.status === btn.status;
          return (
            <TouchableOpacity
              key={btn.status}
              style={[
                styles.statusButton,
                {
                  backgroundColor: isActive ? btn.color : '#F5F5F5',
                  borderColor: btn.color,
                  borderWidth: isActive ? 0 : 1,
                }
              ]}
              onPress={() => {
                if (btn.status === 'paid') {
                  onPaidWithPhone(order.id);
                } else {
                  onStatusUpdate(order.id, btn.status);
                }
              }}
            >
              <BtnIcon 
                color={isActive ? '#FFF' : btn.color} 
                size={14} 
              />
              <Text style={[
                styles.statusButtonText,
                { color: isActive ? '#FFF' : btn.color }
              ]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        ))}
      </View>

      {order.customerNote && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Customer Note:</Text>
          <Text style={styles.noteText}>{order.customerNote}</Text>
        </View>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>{order.total}</Text>
      </View>
    </View>
  );
}

function PromoCodeModal({ visible, onClose, onConfirm, orderTotal }: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (phoneNumber: string, promoCode?: string, discount?: number) => void;
  orderTotal: number;
}) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { findCustomerByPhone } = useLoyalty();
  const { validatePromoCode } = useQuiz();

  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code.toUpperCase());
    setPromoError('');
    setDiscount(0);
    
    if (code.trim()) {
      const validPromo = validatePromoCode(code.trim());
      if (validPromo) {
        const discountAmount = (orderTotal * validPromo.discountPercentage) / 100;
        setDiscount(discountAmount);
      } else {
        setPromoError('Invalid or expired promo code');
      }
    }
  };

  const handleConfirm = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (promoCode.trim() && !discount) {
      Alert.alert('Error', 'Please enter a valid promo code or remove it');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(phoneNumber.trim(), promoCode.trim() || undefined, discount || undefined);
      setPhoneNumber('');
      setPromoCode('');
      setDiscount(0);
      setPromoError('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const customer = phoneNumber.trim() ? findCustomerByPhone(phoneNumber.trim()) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.phoneModalOverlay}>
        <View style={styles.phoneModalContent}>
          <View style={styles.phoneModalHeader}>
            <Text style={styles.phoneModalTitle}>Process Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#8B4513" size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.phoneModalBody}>
            <Text style={styles.phoneModalDescription}>
              Enter customer details and apply any promo codes.
            </Text>
            
            <View style={styles.phoneInputContainer}>
              <Phone color="#8B4513" size={20} />
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor="#8B4513"
                keyboardType="phone-pad"
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            
            {customer && (
              <View style={styles.customerPreview}>
                <Gift color="#4CAF50" size={16} />
                <Text style={styles.customerPreviewText}>
                  Customer: {customer.name} ({customer.points} points)
                </Text>
              </View>
            )}
            
            {phoneNumber.trim() && !customer && (
              <Text style={styles.newCustomerText}>
                📝 New customer will be created
              </Text>
            )}
            
            <View style={styles.promoCodeSection}>
              <Text style={styles.promoSectionTitleModal}>Promo Code (Optional)</Text>
              <View style={styles.phoneInputContainer}>
                <Tag color="#8B4513" size={20} />
                <TextInput
                  style={styles.phoneInput}
                  value={promoCode}
                  onChangeText={handlePromoCodeChange}
                  placeholder="Enter promo code"
                  placeholderTextColor="#8B4513"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              
              {promoError ? (
                <Text style={styles.promoErrorText}>{promoError}</Text>
              ) : discount > 0 ? (
                <View style={styles.discountPreview}>
                  <Text style={styles.discountText}>
                    ✅ Discount applied: -{discount.toFixed(2)} TND
                  </Text>
                  <Text style={styles.finalTotalText}>
                    Final total: {(orderTotal - discount).toFixed(2)} TND
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          
          <View style={styles.phoneModalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              <CreditCard color="#FFF" size={16} />
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Processing...' : `Pay ${discount > 0 ? (orderTotal - discount).toFixed(2) : orderTotal.toFixed(2)} TND`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PaymentSuccessModal({ visible, onClose, customerName, earnedPoints, totalPoints, promoCode, discount, finalTotal }: {
  visible: boolean;
  onClose: () => void;
  customerName?: string;
  earnedPoints?: number;
  totalPoints?: number;
  promoCode?: string;
  discount?: number;
  finalTotal?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      const sparkleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      sparkleAnimation.start();

      return () => {
        sparkleAnimation.stop();
      };
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      sparkleAnim.setValue(0);
    }
  }, [visible, scaleAnim, sparkleAnim, fadeAnim, slideAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const sparkleRotation = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 0.8],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.successModalOverlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.successModalContent,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <View style={styles.successHeader}>
            <View style={styles.successIconContainer}>
              <Animated.View 
                style={[
                  styles.sparkleIcon,
                  {
                    transform: [
                      { rotate: sparkleRotation },
                      { scale: sparkleScale }
                    ]
                  }
                ]}
              >
                <Sparkles color="#FFD700" size={32} />
              </Animated.View>
              <CheckCircle color="#4CAF50" size={48} />
            </View>
            <Text style={styles.successTitle}>Payment Processed! 🎉</Text>
            <Text style={styles.successSubtitle}>Order marked as paid.</Text>
          </View>

          <View style={styles.successBody}>
            {customerName && earnedPoints !== undefined && totalPoints !== undefined && (
              <View style={styles.loyaltySection}>
                <View style={styles.loyaltyHeader}>
                  <Trophy color="#D4AF37" size={24} />
                  <Text style={styles.loyaltySectionTitle}>Loyalty Points Awarded</Text>
                </View>
                <View style={styles.loyaltyDetails}>
                  <Text style={styles.customerNameText}>{customerName} earned</Text>
                  <View style={styles.pointsContainer}>
                    <Star color="#FFD700" size={20} />
                    <Text style={styles.earnedPointsText}>{earnedPoints} points!</Text>
                  </View>
                  <Text style={styles.totalPointsText}>Total points: {totalPoints}</Text>
                </View>
              </View>
            )}

            {promoCode && discount && finalTotal && (
              <View style={styles.promoSection}>
                <View style={styles.promoHeader}>
                  <Tag color="#4CAF50" size={20} />
                  <Text style={styles.promoSectionTitle}>Promo Code Applied</Text>
                </View>
                <View style={styles.promoDetails}>
                  <Text style={styles.promoCodeText}>{promoCode}</Text>
                  <Text style={styles.discountAmountText}>-{discount.toFixed(2)} TND discount</Text>
                  <Text style={styles.finalAmountText}>Final amount: {finalTotal.toFixed(2)} TND</Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.successButton} onPress={handleClose}>
            <Text style={styles.successButtonText}>Great!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function PaidOrdersModal({ visible, onClose, paidOrders, onClearPaidOrders }: {
  visible: boolean;
  onClose: () => void;
  paidOrders: Order[];
  onClearPaidOrders: () => void;
}) {
  const totalRevenue = useMemo(() => {
    return paidOrders.reduce((sum, order) => {
      const price = parseFloat(order.total.replace(' TND', ''));
      return sum + price;
    }, 0).toFixed(2);
  }, [paidOrders]);

  const categorizedItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number; }>;
    
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const price = parseFloat(item.price.replace(' TND', ''));
        const revenue = price * item.quantity;
        
        if (itemMap.has(item.name)) {
          const existing = itemMap.get(item.name)!;
          existing.quantity += item.quantity;
          existing.revenue += revenue;
        } else {
          itemMap.set(item.name, {
            name: item.name,
            quantity: item.quantity,
            revenue
          });
        }
      });
    });
    
    return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [paidOrders]);

  const generateReceipt = () => {
    const receiptText = `
🏪 SKADAM COFFEE SHOP
📊 SALES REPORT
${new Date().toLocaleDateString()}

📋 SUMMARY:
Total Orders: ${paidOrders.length}
Total Revenue: ${totalRevenue} TND

📦 ITEMS SOLD:
${categorizedItems.map(item => 
  `${item.name}: ${item.quantity}x - ${item.revenue.toFixed(2)} TND`
).join('\n')}

📅 ORDER DETAILS:
${paidOrders.map(order => 
  `#${order.orderNumber} - ${order.total} - ${new Date(order.paidAt || order.timestamp).toLocaleString()}`
).join('\n')}

✨ Generated by SKADAM Admin
    `;
    
    Share.share({
      message: receiptText,
      title: 'SKADAM Sales Report'
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Paid Orders & Receipt</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.receiptSummary}>
          <View style={styles.summaryCard}>
            <Receipt color="#4CAF50" size={32} />
            <Text style={styles.summaryTitle}>Total Revenue</Text>
            <Text style={styles.summaryAmount}>{totalRevenue} TND</Text>
            <Text style={styles.summarySubtext}>{paidOrders.length} paid orders</Text>
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Items Sold</Text>
            {categorizedItems.map((item, index) => (
              <View key={index} style={styles.itemSummary}>
                <View style={styles.itemSummaryLeft}>
                  <Text style={styles.itemSummaryName}>{item.name}</Text>
                  <Text style={styles.itemSummaryQty}>{item.quantity} sold</Text>
                </View>
                <Text style={styles.itemSummaryRevenue}>{item.revenue.toFixed(2)} TND</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Order History</Text>
            {paidOrders.map((order) => (
              <View key={order.id} style={styles.paidOrderCard}>
                <View style={styles.paidOrderHeader}>
                  <View style={styles.paidOrderTitleRow}>
                    <Text style={styles.paidOrderNumber}>#{order.orderNumber}</Text>
                    <View style={styles.paidOrderTable}>
                      <MapPin color="#4CAF50" size={12} />
                      <Text style={styles.paidOrderTableText}>Table {order.tableNumber}</Text>
                    </View>
                  </View>
                  <Text style={styles.paidOrderTotal}>{order.total}</Text>
                </View>
                <Text style={styles.paidOrderDate}>
                  Paid: {new Date(order.paidAt || order.timestamp).toLocaleString()}
                </Text>
                <View style={styles.paidOrderItems}>
                  {order.items.map((item, idx) => (
                    <Text key={idx} style={styles.paidOrderItem}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.generateReceiptButton} onPress={generateReceipt}>
            <Receipt color="#FFF" size={20} />
            <Text style={styles.generateReceiptText}>Generate Full Receipt</Text>
          </TouchableOpacity>
          
          {paidOrders.length > 0 && (
            <TouchableOpacity 
              style={styles.clearOrdersButton} 
              onPress={() => {
                Alert.alert(
                  'Clear Paid Orders',
                  `Are you sure you want to clear all ${paidOrders.length} paid orders? This action cannot be undone.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Clear All', 
                      style: 'destructive', 
                      onPress: () => {
                        onClearPaidOrders();
                        onClose();
                      }
                    }
                  ]
                );
              }}
            >
              <Trash2 color="#FFF" size={20} />
              <Text style={styles.clearOrdersText}>Clear All Paid Orders</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function OrdersScreen() {
  const { orders, updateOrderStatus, deleteOrder, clearPaidOrders, isAuthenticated } = useAdmin();
  const { settings, isPermissionGranted } = useNotifications();
  const { findCustomerByPhone, addCustomer, addPoints, settings: loyaltySettings } = useLoyalty();
  const { usePromoCode: applyPromoCode } = useQuiz();
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [showPaidModal, setShowPaidModal] = useState<boolean>(false);
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedOrderTotal, setSelectedOrderTotal] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{
    customerName?: string;
    earnedPoints?: number;
    totalPoints?: number;
    promoCode?: string;
    discount?: number;
    finalTotal?: number;
  }>({});

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const paidOrders = useMemo(() => {
    return orders.filter(order => order.status === 'paid');
  }, [orders]);

  const pendingCount = orders.filter(order => order.status === 'pending').length;
  const preparingCount = orders.filter(order => order.status === 'preparing').length;
  const readyCount = orders.filter(order => order.status === 'ready').length;
  const paidCount = paidOrders.length;

  if (!isAuthenticated) {
    router.replace('/admin');
    return null;
  }

  const handleStatusUpdate = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  const handleDelete = (orderId: string) => {
    deleteOrder(orderId);
  };

  const handlePaidWithPhone = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const orderTotal = parseFloat(order.total.replace(' TND', ''));
      setSelectedOrderId(orderId);
      setSelectedOrderTotal(orderTotal);
      setShowPhoneModal(true);
    }
  };

  const handlePhoneConfirm = async (phoneNumber: string, promoCodeValue?: string, discountAmount?: number) => {
    if (!loyaltySettings.isEnabled) {
      updateOrderStatus(selectedOrderId, 'paid');
      return;
    }

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    try {
      let customer = findCustomerByPhone(phoneNumber);
      
      if (!customer) {
        // Create new customer
        const customerId = await addCustomer({
          name: `Customer ${phoneNumber}`,
          phoneNumber: phoneNumber
        });
        customer = findCustomerByPhone(phoneNumber);
      }

      if (customer) {
        // Apply promo code if provided
        let finalTotal = parseFloat(order.total.replace(' TND', ''));
        if (promoCodeValue && discountAmount) {
          const promoUsed = applyPromoCode(promoCodeValue);
          if (promoUsed) {
            finalTotal = finalTotal - discountAmount;
          }
        }
        
        // Calculate order total for points (use original total for points calculation)
        const orderTotal = parseFloat(order.total.replace(' TND', ''));
        const earnedPoints = await addPoints(customer.id, order.orderNumber.toString(), orderTotal);
        
        updateOrderStatus(selectedOrderId, 'paid');
        
        let alertMessage = `Order marked as paid.\n\nLoyalty Points Awarded:\n${customer.name} earned ${earnedPoints} points!\nTotal points: ${customer.points + earnedPoints}`;
        
        if (promoCodeValue && discountAmount) {
          alertMessage += `\n\nPromo Code Applied:\n${promoCodeValue} - ${discountAmount.toFixed(2)} TND discount\nFinal amount: ${finalTotal.toFixed(2)} TND`;
        }
        
        setSuccessData({
          customerName: customer.name,
          earnedPoints,
          totalPoints: customer.points + earnedPoints,
          promoCode: promoCodeValue,
          discount: discountAmount,
          finalTotal: promoCodeValue && discountAmount ? finalTotal : undefined
        });
        setShowSuccessModal(true);
      } else {
        updateOrderStatus(selectedOrderId, 'paid');
      }
    } catch (error) {
      console.error('Error processing loyalty points:', error);
      updateOrderStatus(selectedOrderId, 'paid');
      Alert.alert('Payment Processed', 'Order marked as paid. Loyalty points could not be processed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8E8E8', '#DCDCDC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#8B4513" size={24} />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Orders Management</Text>
            <View style={styles.notificationIndicator}>
              {isPermissionGranted && settings.orderNotifications ? (
                <Bell color="#4CAF50" size={20} />
              ) : (
                <BellOff color="#FF6B6B" size={20} />
              )}
            </View>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{preparingCount}</Text>
              <Text style={styles.statLabel}>Preparing</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{readyCount}</Text>
              <Text style={styles.statLabel}>Ready</Text>
            </View>
            <TouchableOpacity 
              style={styles.paidStatItem}
              onPress={() => setShowPaidModal(true)}
            >
              <Text style={styles.paidStatNumber}>{paidCount}</Text>
              <Text style={styles.paidStatLabel}>💰 Paid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('all')}
          >
            <Filter color={statusFilter === 'all' ? '#FFF' : '#666'} size={16} />
            <Text style={[
              styles.filterText,
              statusFilter === 'all' && styles.filterTextActive
            ]}>All ({orders.length})</Text>
          </TouchableOpacity>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter(order => order.status === status).length;
            const isActive = statusFilter === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  isActive && { backgroundColor: config.color }
                ]}
                onPress={() => setStatusFilter(status as OrderStatus)}
              >
                <config.icon color={isActive ? '#FFF' : '#666'} size={16} />
                <Text style={[
                  styles.filterText,
                  isActive && styles.filterTextActive
                ]}>{config.label} ({count})</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package color="#CCC" size={64} />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptyText}>
              {statusFilter === 'all' 
                ? 'No orders have been placed yet.'
                : `No ${statusFilter} orders found.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDelete}
                onPaidWithPhone={handlePaidWithPhone}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <PaidOrdersModal 
        visible={showPaidModal}
        onClose={() => setShowPaidModal(false)}
        paidOrders={paidOrders}
        onClearPaidOrders={clearPaidOrders}
      />
      
      <PromoCodeModal
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onConfirm={handlePhoneConfirm}
        orderTotal={selectedOrderTotal}
      />
      
      <PaymentSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        customerName={successData.customerName}
        earnedPoints={successData.earnedPoints}
        totalPoints={successData.totalPoints}
        promoCode={successData.promoCode}
        discount={successData.discount}
        finalTotal={successData.finalTotal}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  notificationIndicator: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.9,
  },
  filterContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#2D1810',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  paidStatItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  paidStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paidStatLabel: {
    fontSize: 12,
    color: '#4CAF50',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  ordersContainer: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tableNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paidDate: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
  },
  orderItems: {
    gap: 12,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  noteContainer: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#2D1810',
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  receiptSummary: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 12,
  },
  itemSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemSummaryLeft: {
    flex: 1,
  },
  itemSummaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
  },
  itemSummaryQty: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemSummaryRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paidOrderCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  paidOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  paidOrderTitleRow: {
    flex: 1,
  },
  paidOrderTable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  paidOrderTableText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  paidOrderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  paidOrderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paidOrderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  paidOrderItems: {
    gap: 2,
  },
  paidOrderItem: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  generateReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateReceiptText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  clearOrdersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  clearOrdersText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  phoneModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  phoneModalContent: {
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
  phoneModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  phoneModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  phoneModalBody: {
    padding: 20,
    gap: 16,
  },
  phoneModalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  promoCodeSection: {
    marginTop: 16,
  },
  promoSectionTitleModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 8,
  },
  promoErrorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 8,
    textAlign: 'center',
  },
  discountPreview: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  discountText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  finalTotalText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D1810',
    paddingVertical: 8,
  },
  customerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  customerPreviewText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  newCustomerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  phoneModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  // Payment Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  successHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'linear-gradient(135deg, #E8F5E8 0%, #F0F9FF 100%)',
  },
  successIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  successBody: {
    padding: 24,
    gap: 20,
  },
  loyaltySection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  loyaltySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  loyaltyDetails: {
    alignItems: 'center',
    gap: 8,
  },
  customerNameText: {
    fontSize: 16,
    color: '#2D1810',
    textAlign: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  earnedPointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  totalPointsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  promoSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  promoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  promoDetails: {
    alignItems: 'center',
    gap: 8,
  },
  promoCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    textAlign: 'center',
  },
  discountAmountText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  finalAmountText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});