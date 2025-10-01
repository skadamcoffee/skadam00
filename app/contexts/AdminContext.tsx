import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { MenuItem, Category, menuItems as defaultMenuItems, categories as defaultCategories } from '@/data/menuItems';

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'paid';
  customerNote?: string;
  timestamp: number;
  orderNumber: number;
  paidAt?: number;
  tableNumber: number;
}

export interface SubUser {
  id: string;
  username: string;
  password: string;
  name: string;
  permissions: 'orders_only';
  createdAt: number;
  isActive: boolean;
}

export interface SocialMediaLink {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  url: string;
  isActive: boolean;
}

export interface OpeningHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface StoreSettings {
  socialMediaLinks: SocialMediaLink[];
  openingHours: OpeningHours[];
  storeDescription: string;
}

export type UserType = 'admin' | 'sub_user';

export interface AuthUser {
  type: UserType;
  id?: string;
  username?: string;
  name?: string;
}

interface AdminContextType {
  menuItems: MenuItem[];
  categories: Category[];
  orders: Order[];
  subUsers: SubUser[];
  storeSettings: StoreSettings;
  currentUser: AuthUser | null;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addOrder: (items: OrderItem[], tableNumber: number, customerNote?: string) => Promise<{ orderId: string; orderNumber: number }>;
  getOrderById: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  clearPaidOrders: () => Promise<void>;
  updateInventory: (itemId: string, quantity: number) => void;
  updateInventorySettings: (itemId: string, settings: { alertThreshold?: number; alertEnabled: boolean; unit?: string }) => void;
  getLowStockItems: () => MenuItem[];
  addSubUser: (subUser: Omit<SubUser, 'id' | 'createdAt'>) => void;
  updateSubUser: (id: string, updates: Partial<SubUser>) => void;
  deleteSubUser: (id: string) => void;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  addSocialMediaLink: (link: Omit<SocialMediaLink, 'id'>) => void;
  updateSocialMediaLink: (id: string, updates: Partial<SocialMediaLink>) => void;
  deleteSocialMediaLink: (id: string) => void;
  updateOpeningHours: (hours: OpeningHours[]) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (password: string, username?: string) => Promise<boolean>;
  logout: () => void;
}

const MENU_ITEMS_KEY = 'skadam_menu_items';
const CATEGORIES_KEY = 'skadam_categories';
const ORDERS_KEY = 'skadam_orders';
const ORDER_COUNTER_KEY = 'skadam_order_counter';
const AUTH_KEY = 'skadam_admin_auth';
const SUB_USERS_KEY = 'skadam_sub_users';
const STORE_SETTINGS_KEY = 'skadam_store_settings';
const ADMIN_PASSWORD = 'skadam2024';

const defaultStoreSettings: StoreSettings = {
  socialMediaLinks: [],
  openingHours: [
    { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' }
  ],
  storeDescription: 'Fresh • Local • Artisan'
};

export const [AdminProvider, useAdmin] = createContextHook<AdminContextType>(() => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    loadData();
    checkAuthStatus();
  }, []);

  const loadData = async () => {
    try {
      const [storedMenuItems, storedCategories, storedOrders, storedSubUsers, storedStoreSettings] = await Promise.all([
        AsyncStorage.getItem(MENU_ITEMS_KEY),
        AsyncStorage.getItem(CATEGORIES_KEY),
        AsyncStorage.getItem(ORDERS_KEY),
        AsyncStorage.getItem(SUB_USERS_KEY),
        AsyncStorage.getItem(STORE_SETTINGS_KEY)
      ]);

      if (storedMenuItems) {
        setMenuItems(JSON.parse(storedMenuItems));
      }
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
      if (storedSubUsers) {
        setSubUsers(JSON.parse(storedSubUsers));
      }
      if (storedStoreSettings) {
        setStoreSettings(JSON.parse(storedStoreSettings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem(AUTH_KEY);
      if (authStatus) {
        const { isAuth, timestamp, user } = JSON.parse(authStatus);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (isAuth && (now - timestamp) < oneHour) {
          setIsAuthenticated(true);
          setCurrentUser(user || { type: 'admin' });
        } else {
          await AsyncStorage.removeItem(AUTH_KEY);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const login = useCallback(async (password: string, username?: string): Promise<boolean> => {
    // Admin login
    if (!username && password === ADMIN_PASSWORD) {
      const user: AuthUser = { type: 'admin' };
      const authData = {
        isAuth: true,
        timestamp: Date.now(),
        user
      };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      setCurrentUser(user);
      return true;
    }
    
    // Sub-user login
    if (username) {
      const subUser = subUsers.find(u => u.username === username && u.password === password && u.isActive);
      if (subUser) {
        const user: AuthUser = {
          type: 'sub_user',
          id: subUser.id,
          username: subUser.username,
          name: subUser.name
        };
        const authData = {
          isAuth: true,
          timestamp: Date.now(),
          user
        };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        setIsAuthenticated(true);
        setCurrentUser(user);
        return true;
      }
    }
    
    return false;
  }, [subUsers]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  const saveMenuItems = useCallback(async (items: MenuItem[]) => {
    if (!items || !Array.isArray(items)) return;
    try {
      await AsyncStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving menu items:', error);
    }
  }, []);

  const saveCategories = useCallback(async (cats: Category[]) => {
    if (!cats || !Array.isArray(cats)) return;
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }, []);

  const saveOrders = useCallback(async (orderList: Order[]) => {
    if (!orderList || !Array.isArray(orderList)) return;
    try {
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orderList));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }, []);

  const getNextOrderNumber = useCallback(async (): Promise<number> => {
    try {
      const counterStr = await AsyncStorage.getItem(ORDER_COUNTER_KEY);
      const counter = counterStr ? parseInt(counterStr, 10) : 0;
      const nextCounter = counter + 1;
      await AsyncStorage.setItem(ORDER_COUNTER_KEY, nextCounter.toString());
      return nextCounter;
    } catch (error) {
      console.error('Error getting order number:', error);
      return Date.now() % 10000;
    }
  }, []);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString()
    };
    const updatedItems = [...menuItems, newItem];
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
  }, [menuItems, saveMenuItems]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    const updatedItems = menuItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
  }, [menuItems, saveMenuItems]);

  const deleteMenuItem = useCallback((id: string) => {
    const updatedItems = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
  }, [menuItems, saveMenuItems]);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
  }, [categories, saveCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(category => 
      category.id === id ? { ...category, ...updates } : category
    );
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((id: string) => {
    const updatedCategories = categories.filter(category => category.id !== id);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
  }, [categories, saveCategories]);

  const addOrder = useCallback(async (items: OrderItem[], tableNumber: number, customerNote?: string): Promise<{ orderId: string; orderNumber: number }> => {
    const orderNumber = await getNextOrderNumber();
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace(' TND', ''));
      return sum + (price * item.quantity);
    }, 0).toFixed(2);

    const newOrder: Order = {
      id: Date.now().toString(),
      items,
      total: `${total} TND`,
      status: 'pending',
      customerNote,
      timestamp: Date.now(),
      orderNumber,
      tableNumber
    };

    // Update inventory quantities when order is placed
    const updatedMenuItems = menuItems.map(menuItem => {
      const orderedItem = items.find(item => item.id === menuItem.id);
      if (orderedItem && menuItem.inventory) {
        return {
          ...menuItem,
          inventory: {
            ...menuItem.inventory,
            quantity: Math.max(0, menuItem.inventory.quantity - orderedItem.quantity)
          }
        };
      }
      return menuItem;
    });
    
    const updatedOrders = [newOrder, ...orders];
    
    // Update state first and ensure it's synchronous
    setOrders(updatedOrders);
    setMenuItems(updatedMenuItems);
    
    // Save to storage in background (don't wait for it)
    Promise.all([
      saveOrders(updatedOrders),
      saveMenuItems(updatedMenuItems)
    ]).then(() => {
      console.log('New order created and saved:', newOrder.orderNumber, 'for table', newOrder.tableNumber);
    }).catch((error) => {
      console.error('Error saving order:', error);
    });
    
    // Return both the order ID and order number immediately
    return { orderId: newOrder.id, orderNumber: newOrder.orderNumber };
  }, [orders, menuItems, saveOrders, saveMenuItems, getNextOrderNumber]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status };
        if (status === 'paid') {
          updatedOrder.paidAt = Date.now();
        }
        return updatedOrder;
      }
      return order;
    });
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    
    // Trigger notification when order is ready
    if (status === 'ready') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // This will be handled by the notification context
        console.log(`Order #${order.orderNumber} for Table ${order.tableNumber} is ready`);
      }
    }
  }, [orders, saveOrders]);

  const deleteOrder = useCallback((orderId: string) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  }, [orders, saveOrders]);

  const clearPaidOrders = useCallback(async () => {
    const unpaidOrders = orders.filter(order => order.status !== 'paid');
    setOrders(unpaidOrders);
    await saveOrders(unpaidOrders);
    
    // Reset order counter to 0 when clearing paid orders
    await AsyncStorage.setItem(ORDER_COUNTER_KEY, '0');
    
    console.log('Cleared all paid orders from the system and reset order counter to 0');
  }, [orders, saveOrders]);

  const updateInventory = useCallback((itemId: string, quantity: number) => {
    const updatedItems = menuItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          inventory: {
            ...item.inventory,
            quantity: Math.max(0, quantity),
            alertThreshold: item.inventory?.alertThreshold || 5,
            alertEnabled: item.inventory?.alertEnabled || false,
            unit: item.inventory?.unit || 'units'
          }
        };
      }
      return item;
    });
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
  }, [menuItems, saveMenuItems]);

  const updateInventorySettings = useCallback((itemId: string, settings: { alertThreshold?: number; alertEnabled: boolean; unit?: string }) => {
    const updatedItems = menuItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          inventory: {
            quantity: item.inventory?.quantity || 0,
            alertThreshold: settings.alertThreshold ?? item.inventory?.alertThreshold ?? 5,
            alertEnabled: settings.alertEnabled,
            unit: settings.unit || item.inventory?.unit || 'units'
          }
        };
      }
      return item;
    });
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
  }, [menuItems, saveMenuItems]);

  const getLowStockItems = useCallback((): MenuItem[] => {
    return menuItems.filter(item => {
      if (!item.inventory || !item.inventory.alertEnabled) return false;
      return item.inventory.quantity <= (item.inventory.alertThreshold || 0);
    });
  }, [menuItems]);

  const saveSubUsers = useCallback(async (users: SubUser[]) => {
    if (!users || !Array.isArray(users)) return;
    try {
      await AsyncStorage.setItem(SUB_USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving sub users:', error);
    }
  }, []);

  const addSubUser = useCallback((subUser: Omit<SubUser, 'id' | 'createdAt'>) => {
    const newSubUser: SubUser = {
      ...subUser,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    const updatedSubUsers = [...subUsers, newSubUser];
    setSubUsers(updatedSubUsers);
    saveSubUsers(updatedSubUsers);
  }, [subUsers, saveSubUsers]);

  const updateSubUser = useCallback((id: string, updates: Partial<SubUser>) => {
    const updatedSubUsers = subUsers.map(user => 
      user.id === id ? { ...user, ...updates } : user
    );
    setSubUsers(updatedSubUsers);
    saveSubUsers(updatedSubUsers);
  }, [subUsers, saveSubUsers]);

  const deleteSubUser = useCallback((id: string) => {
    const updatedSubUsers = subUsers.filter(user => user.id !== id);
    setSubUsers(updatedSubUsers);
    saveSubUsers(updatedSubUsers);
  }, [subUsers, saveSubUsers]);

  const saveStoreSettings = useCallback(async (settings: StoreSettings) => {
    try {
      await AsyncStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving store settings:', error);
    }
  }, []);

  const updateStoreSettings = useCallback((updates: Partial<StoreSettings>) => {
    const updatedSettings = { ...storeSettings, ...updates };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
  }, [storeSettings, saveStoreSettings]);

  const addSocialMediaLink = useCallback((link: Omit<SocialMediaLink, 'id'>) => {
    const newLink: SocialMediaLink = {
      ...link,
      id: Date.now().toString()
    };
    const updatedLinks = [...storeSettings.socialMediaLinks, newLink];
    const updatedSettings = { ...storeSettings, socialMediaLinks: updatedLinks };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
  }, [storeSettings, saveStoreSettings]);

  const updateSocialMediaLink = useCallback((id: string, updates: Partial<SocialMediaLink>) => {
    const updatedLinks = storeSettings.socialMediaLinks.map(link => 
      link.id === id ? { ...link, ...updates } : link
    );
    const updatedSettings = { ...storeSettings, socialMediaLinks: updatedLinks };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
  }, [storeSettings, saveStoreSettings]);

  const deleteSocialMediaLink = useCallback((id: string) => {
    const updatedLinks = storeSettings.socialMediaLinks.filter(link => link.id !== id);
    const updatedSettings = { ...storeSettings, socialMediaLinks: updatedLinks };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
  }, [storeSettings, saveStoreSettings]);

  const updateOpeningHours = useCallback((hours: OpeningHours[]) => {
    const updatedSettings = { ...storeSettings, openingHours: hours };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
  }, [storeSettings, saveStoreSettings]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  return useMemo(() => ({
    menuItems,
    categories,
    orders,
    subUsers,
    storeSettings,
    currentUser,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addOrder,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    clearPaidOrders,
    updateInventory,
    updateInventorySettings,
    getLowStockItems,
    addSubUser,
    updateSubUser,
    deleteSubUser,
    updateStoreSettings,
    addSocialMediaLink,
    updateSocialMediaLink,
    deleteSocialMediaLink,
    updateOpeningHours,
    isLoading,
    isAuthenticated,
    login,
    logout
  }), [menuItems, categories, orders, subUsers, storeSettings, currentUser, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, updateCategory, deleteCategory, addOrder, getOrderById, updateOrderStatus, deleteOrder, clearPaidOrders, updateInventory, updateInventorySettings, getLowStockItems, addSubUser, updateSubUser, deleteSubUser, updateStoreSettings, addSocialMediaLink, updateSocialMediaLink, deleteSocialMediaLink, updateOpeningHours, isLoading, isAuthenticated, login, logout]);
});