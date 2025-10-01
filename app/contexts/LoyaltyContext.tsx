import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export interface LoyaltyCustomer {
  id: string;
  phoneNumber: string;
  name: string;
  points: number;
  totalSpent: number;
  visitCount: number;
  joinDate: number;
  lastVisit: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isActive: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  orderId: string;
  type: 'earn' | 'redeem';
  points: number;
  amount: number;
  description: string;
  timestamp: number;
}

export interface LoyaltySettings {
  pointsPerTND: number;
  pointsForRedemption: number;
  redemptionValue: number;
  welcomeBonus: number;
  birthdayBonus: number;
  tierThresholds: {
    silver: number;
    gold: number;
    platinum: number;
  };
  tierMultipliers: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  isEnabled: boolean;
}

interface LoyaltyContextType {
  customers: LoyaltyCustomer[];
  transactions: LoyaltyTransaction[];
  settings: LoyaltySettings;
  addCustomer: (customer: Omit<LoyaltyCustomer, 'id' | 'points' | 'totalSpent' | 'visitCount' | 'joinDate' | 'lastVisit' | 'tier' | 'isActive'>) => Promise<string>;
  updateCustomer: (id: string, updates: Partial<LoyaltyCustomer>) => void;
  deleteCustomer: (id: string) => Promise<void>;
  findCustomerByPhone: (phoneNumber: string) => LoyaltyCustomer | undefined;
  addPoints: (customerId: string, orderId: string, amount: number) => Promise<number>;
  redeemPoints: (customerId: string, orderId: string, points: number) => Promise<boolean>;
  updateSettings: (settings: Partial<LoyaltySettings>) => void;
  getCustomerTier: (totalSpent: number) => 'bronze' | 'silver' | 'gold' | 'platinum';
  getPointsMultiplier: (tier: string) => number;
  isLoading: boolean;
}

const LOYALTY_CUSTOMERS_KEY = 'skadam_loyalty_customers';
const LOYALTY_TRANSACTIONS_KEY = 'skadam_loyalty_transactions';
const LOYALTY_SETTINGS_KEY = 'skadam_loyalty_settings';

const defaultSettings: LoyaltySettings = {
  pointsPerTND: 1,
  pointsForRedemption: 100,
  redemptionValue: 5,
  welcomeBonus: 50,
  birthdayBonus: 100,
  tierThresholds: {
    silver: 100,
    gold: 500,
    platinum: 1000
  },
  tierMultipliers: {
    bronze: 1,
    silver: 1.2,
    gold: 1.5,
    platinum: 2
  },
  isEnabled: true
};

export const [LoyaltyProvider, useLoyalty] = createContextHook<LoyaltyContextType>(() => {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [settings, setSettings] = useState<LoyaltySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedCustomers, storedTransactions, storedSettings] = await Promise.all([
        AsyncStorage.getItem(LOYALTY_CUSTOMERS_KEY),
        AsyncStorage.getItem(LOYALTY_TRANSACTIONS_KEY),
        AsyncStorage.getItem(LOYALTY_SETTINGS_KEY)
      ]);

      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      }
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCustomers = useCallback(async (customerList: LoyaltyCustomer[]) => {
    try {
      await AsyncStorage.setItem(LOYALTY_CUSTOMERS_KEY, JSON.stringify(customerList));
    } catch (error) {
      console.error('Error saving customers:', error);
    }
  }, []);

  const saveTransactions = useCallback(async (transactionList: LoyaltyTransaction[]) => {
    try {
      await AsyncStorage.setItem(LOYALTY_TRANSACTIONS_KEY, JSON.stringify(transactionList));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }, []);

  const saveSettings = useCallback(async (loyaltySettings: LoyaltySettings) => {
    try {
      await AsyncStorage.setItem(LOYALTY_SETTINGS_KEY, JSON.stringify(loyaltySettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  const getCustomerTier = useCallback((totalSpent: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (totalSpent >= settings.tierThresholds.platinum) return 'platinum';
    if (totalSpent >= settings.tierThresholds.gold) return 'gold';
    if (totalSpent >= settings.tierThresholds.silver) return 'silver';
    return 'bronze';
  }, [settings]);

  const getPointsMultiplier = useCallback((tier: string): number => {
    return settings.tierMultipliers[tier as keyof typeof settings.tierMultipliers] || 1;
  }, [settings]);

  const addCustomer = useCallback(async (customerData: Omit<LoyaltyCustomer, 'id' | 'points' | 'totalSpent' | 'visitCount' | 'joinDate' | 'lastVisit' | 'tier' | 'isActive'>): Promise<string> => {
    const newCustomer: LoyaltyCustomer = {
      ...customerData,
      id: Date.now().toString(),
      points: settings.welcomeBonus,
      totalSpent: 0,
      visitCount: 0,
      joinDate: Date.now(),
      lastVisit: Date.now(),
      tier: 'bronze',
      isActive: true
    };

    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);

    // Add welcome bonus transaction
    const welcomeTransaction: LoyaltyTransaction = {
      id: Date.now().toString(),
      customerId: newCustomer.id,
      orderId: 'welcome',
      type: 'earn',
      points: settings.welcomeBonus,
      amount: 0,
      description: 'Welcome bonus',
      timestamp: Date.now()
    };

    const updatedTransactions = [...transactions, welcomeTransaction];
    setTransactions(updatedTransactions);
    await saveTransactions(updatedTransactions);

    return newCustomer.id;
  }, [customers, transactions, settings, saveCustomers, saveTransactions]);

  const updateCustomer = useCallback((id: string, updates: Partial<LoyaltyCustomer>) => {
    const updatedCustomers = customers.map(customer => {
      if (customer.id === id) {
        const updated = { ...customer, ...updates };
        // Update tier based on total spent if not being deactivated
        if (updates.isActive !== false) {
          updated.tier = getCustomerTier(updated.totalSpent);
        }
        return updated;
      }
      return customer;
    });
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);
  }, [customers, saveCustomers, getCustomerTier]);

  const findCustomerByPhone = useCallback((phoneNumber: string): LoyaltyCustomer | undefined => {
    return customers.find(customer => customer.phoneNumber === phoneNumber && customer.isActive);
  }, [customers]);

  const addPoints = useCallback(async (customerId: string, orderId: string, amount: number): Promise<number> => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return 0;

    const basePoints = Math.floor(amount * settings.pointsPerTND);
    const multiplier = getPointsMultiplier(customer.tier);
    const earnedPoints = Math.floor(basePoints * multiplier);

    // Update customer
    const updatedCustomer = {
      ...customer,
      points: customer.points + earnedPoints,
      totalSpent: customer.totalSpent + amount,
      visitCount: customer.visitCount + 1,
      lastVisit: Date.now()
    };
    updatedCustomer.tier = getCustomerTier(updatedCustomer.totalSpent);

    const updatedCustomers = customers.map(c => c.id === customerId ? updatedCustomer : c);
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);

    // Add transaction
    const transaction: LoyaltyTransaction = {
      id: Date.now().toString(),
      customerId,
      orderId,
      type: 'earn',
      points: earnedPoints,
      amount,
      description: `Earned from order #${orderId}`,
      timestamp: Date.now()
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    await saveTransactions(updatedTransactions);

    return earnedPoints;
  }, [customers, transactions, settings, saveCustomers, saveTransactions, getCustomerTier, getPointsMultiplier]);

  const redeemPoints = useCallback(async (customerId: string, orderId: string, points: number): Promise<boolean> => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || customer.points < points) return false;

    const redemptionValue = (points / settings.pointsForRedemption) * settings.redemptionValue;

    // Update customer
    const updatedCustomer = {
      ...customer,
      points: customer.points - points,
      lastVisit: Date.now()
    };

    const updatedCustomers = customers.map(c => c.id === customerId ? updatedCustomer : c);
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);

    // Add transaction
    const transaction: LoyaltyTransaction = {
      id: Date.now().toString(),
      customerId,
      orderId,
      type: 'redeem',
      points: -points,
      amount: redemptionValue,
      description: `Redeemed ${points} points for ${redemptionValue.toFixed(2)} TND discount`,
      timestamp: Date.now()
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    await saveTransactions(updatedTransactions);

    return true;
  }, [customers, transactions, settings, saveCustomers, saveTransactions]);

  const deleteCustomer = useCallback(async (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);
    
    // Also remove related transactions
    const updatedTransactions = transactions.filter(transaction => transaction.customerId !== id);
    setTransactions(updatedTransactions);
    await saveTransactions(updatedTransactions);
  }, [customers, transactions, saveCustomers, saveTransactions]);

  const updateSettings = useCallback((updates: Partial<LoyaltySettings>) => {
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  return useMemo(() => ({
    customers,
    transactions,
    settings,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomerByPhone,
    addPoints,
    redeemPoints,
    updateSettings,
    getCustomerTier,
    getPointsMultiplier,
    isLoading
  }), [customers, transactions, settings, addCustomer, updateCustomer, deleteCustomer, findCustomerByPhone, addPoints, redeemPoints, updateSettings, getCustomerTier, getPointsMultiplier, isLoading]);
});