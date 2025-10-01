import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdmin, OrderItem } from '@/app/contexts/AdminContext';
import { useNotifications } from '@/app/contexts/NotificationContext';
import { Star, Plus, Minus, Coffee, Clock, CheckCircle, X, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { menuItems, addOrder } = useAdmin();
  const { sendGreetingNotification } = useNotifications();
  const [quantity, setQuantity] = useState<number>(1);
  const [customerNote, setCustomerNote] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showBrewing, setShowBrewing] = useState<boolean>(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<number>(0);
  const [brewingAnimation] = useState<Animated.Value>(new Animated.Value(0));
  const [steamAnimation] = useState<Animated.Value>(new Animated.Value(0));
  
  const item = menuItems.find(item => item.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item not found</Text>
        </View>
      </View>
    );
  }

  const handleOrderPress = () => {
    setShowConfirmation(true);
  };

  const confirmOrder = async () => {
    try {
      const orderItem: OrderItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        image: item.image
      };

      const { orderNumber } = await addOrder([orderItem], selectedTable, customerNote.trim() || undefined);
      
      // Set the order number directly from the response
      setCurrentOrderNumber(orderNumber);
      
      // Send greeting notification when order is placed
      sendGreetingNotification(orderNumber, selectedTable);
      console.log('Order placed successfully:', orderNumber, 'for table', selectedTable);
      
      setShowConfirmation(false);
      setShowBrewing(true);
      
      // Start brewing animation
      startBrewingAnimation();
      
      // Auto close after 4 seconds
      setTimeout(() => {
        setShowBrewing(false);
        router.back();
      }, 4000);
    } catch (error) {
      console.error('Error placing order:', error);
      setShowConfirmation(false);
    }
  };

  const startBrewingAnimation = () => {
    // Coffee brewing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(brewingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(brewingAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Steam animation
    Animated.loop(
      Animated.timing(steamAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const priceValue = parseFloat(item.price.replace(' TND', ''));
  const totalPrice = (priceValue * quantity).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8E8E8', '#DCDCDC']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#666666" size={20} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{item.name}</Text>
          <Text style={styles.headerSubtitle}>Item Details</Text>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Star color="#D4AF37" size={16} fill="#D4AF37" />
              <Text style={styles.rating}>4.8</Text>
            </View>
          </View>
          
          <Text style={styles.itemPrice}>{item.price}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>

          {item.ingredients && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.ingredients}>{item.ingredients.join(', ')}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Any special requests? (e.g., extra hot, no sugar, etc.)"
              placeholderTextColor="#999"
              value={customerNote}
              onChangeText={setCustomerNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Table</Text>
            <View style={styles.tableMapContainer}>
              <View style={styles.tableMap}>
                {/* Counter */}
                <View style={styles.counter}>
                  <Text style={styles.counterText}>Counter</Text>
                </View>
                
                {/* Tables - First Row (4 tables aligned) */}
                <TouchableOpacity
                  style={[
                    styles.table,
                    styles.table1,
                    selectedTable === 1 && styles.selectedTable
                  ]}
                  onPress={() => setSelectedTable(1)}
                >
                  <Text style={[
                    styles.tableNumber,
                    selectedTable === 1 && styles.selectedTableNumber
                  ]}>1</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.table,
                    styles.table2,
                    selectedTable === 2 && styles.selectedTable
                  ]}
                  onPress={() => setSelectedTable(2)}
                >
                  <Text style={[
                    styles.tableNumber,
                    selectedTable === 2 && styles.selectedTableNumber
                  ]}>2</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.table,
                    styles.table3,
                    selectedTable === 3 && styles.selectedTable
                  ]}
                  onPress={() => setSelectedTable(3)}
                >
                  <Text style={[
                    styles.tableNumber,
                    selectedTable === 3 && styles.selectedTableNumber
                  ]}>3</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.table,
                    styles.table4,
                    selectedTable === 4 && styles.selectedTable
                  ]}
                  onPress={() => setSelectedTable(4)}
                >
                  <Text style={[
                    styles.tableNumber,
                    selectedTable === 4 && styles.selectedTableNumber
                  ]}>4</Text>
                </TouchableOpacity>
                
                {/* Tables - Second Row */}
                <TouchableOpacity
                  style={[
                    styles.table,
                    styles.table5,
                    selectedTable === 5 && styles.selectedTable
                  ]}
                  onPress={() => setSelectedTable(5)}
                >
                  <Text style={[
                    styles.tableNumber,
                    selectedTable === 5 && styles.selectedTableNumber
                  ]}>5</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.table,
                    styles.table6,
                    selectedTable === 6 && styles.selectedTable
                  ]}
                  onPress={() => setSelectedTable(6)}
                >
                  <Text style={[
                    styles.tableNumber,
                    selectedTable === 6 && styles.selectedTableNumber
                  ]}>6</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.tableMapHint}>
                Tap on a table to select it. Table {selectedTable} is currently selected.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus color="#2D1810" size={20} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus color="#2D1810" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.orderContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{totalPrice} TND</Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderPress}>
          <Text style={styles.orderButtonText}>Add to Order</Text>
        </TouchableOpacity>
      </View>

      {/* Order Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowConfirmation(false)}
            >
              <X color="#666" size={24} />
            </TouchableOpacity>
            
            <View style={styles.confirmationHeader}>
              <Coffee color="#D4AF37" size={48} />
              <Text style={styles.confirmationTitle}>Confirm Your Order</Text>
            </View>
            
            <View style={styles.orderSummary}>
              <Image source={{ uri: item.image }} style={styles.summaryImage} />
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryName}>{item.name}</Text>
                <Text style={styles.summaryQuantity}>Quantity: {quantity}</Text>
                <Text style={styles.summaryTable}>Table: {selectedTable}</Text>
                {customerNote.trim() && (
                  <Text style={styles.summaryNote}>Special Instructions: {customerNote.trim()}</Text>
                )}
                <Text style={styles.summaryPrice}>{totalPrice} TND</Text>
              </View>
            </View>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmOrder}
              >
                <Text style={styles.confirmButtonText}>Confirm Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Brewing Status Modal */}
      <Modal
        visible={showBrewing}
        transparent
        animationType="fade"
      >
        <View style={styles.brewingOverlay}>
          <View style={styles.brewingModal}>
            <View style={styles.brewingAnimation}>
              {/* Steam effect */}
              <Animated.View 
                style={[
                  styles.steam,
                  {
                    opacity: steamAnimation,
                    transform: [{
                      translateY: steamAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30]
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.steamText}>☁️ ☁️ ☁️</Text>
              </Animated.View>
              
              {/* Coffee cup with brewing animation */}
              <Animated.View 
                style={[
                  styles.coffeeContainer,
                  {
                    transform: [{
                      scale: brewingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1]
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.coffeeEmoji}>☕</Text>
              </Animated.View>
            </View>
            
            <View style={styles.brewingContent}>
              <Text style={styles.brewingTitle}>Your Order is Being Prepared!</Text>
              <Text style={styles.orderNumberText}>Order #{currentOrderNumber}</Text>
              
              <View style={styles.brewingSteps}>
                <View style={styles.brewingStep}>
                  <CheckCircle color="#4CAF50" size={20} />
                  <Text style={styles.stepText}>Order Received</Text>
                </View>
                <View style={styles.brewingStep}>
                  <Clock color="#D4AF37" size={20} />
                  <Text style={styles.stepText}>Brewing Your {item.name}</Text>
                </View>
              </View>
              
              <Text style={styles.brewingSubtitle}>
                Our skilled baristas are crafting your perfect cup.
                We&apos;ll notify you when it&apos;s ready!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  itemImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  itemDetails: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  itemDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
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
  ingredients: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D1810',
    backgroundColor: '#FFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tableMapContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableMap: {
    height: 280,
    position: 'relative',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2D1810',
  },
  counter: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 80,
    height: 50,
    backgroundColor: '#8E8E8E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  table: {
    position: 'absolute',
    width: 55,
    height: 55,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#654321',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedTable: {
    backgroundColor: '#D4AF37',
    borderColor: '#B8941F',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  table1: {
    left: 25,
    top: 30,
  },
  table2: {
    left: 25,
    top: 95,
  },
  table3: {
    left: 25,
    top: 160,
  },
  table4: {
    left: 25,
    top: 225,
  },
  table5: {
    right: 25,
    top: 90,
  },
  table6: {
    right: 25,
    top: 155,
  },
  tableNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedTableNumber: {
    color: '#2D1810',
  },

  tableMapHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
    minWidth: 30,
    textAlign: 'center',
  },
  orderContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  orderButton: {
    backgroundColor: '#2D1810',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5E6D3',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
    marginTop: 12,
    textAlign: 'center',
  },
  orderSummary: {
    flexDirection: 'row',
    backgroundColor: '#F5E6D3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  summaryDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 4,
  },
  summaryNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  summaryQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  summaryTable: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2D1810',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5E6D3',
  },
  // Brewing Modal Styles
  brewingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 24, 16, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  brewingModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  brewingAnimation: {
    alignItems: 'center',
    marginBottom: 32,
    height: 120,
    justifyContent: 'center',
  },
  steam: {
    position: 'absolute',
    top: -20,
  },
  steamText: {
    fontSize: 24,
    opacity: 0.7,
  },
  coffeeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coffeeEmoji: {
    fontSize: 64,
  },
  brewingContent: {
    alignItems: 'center',
  },
  brewingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
    textAlign: 'center',
    marginBottom: 8,
  },
  orderNumberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 24,
  },
  brewingSteps: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  brewingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#2D1810',
    marginLeft: 12,
    fontWeight: '500',
  },
  brewingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});