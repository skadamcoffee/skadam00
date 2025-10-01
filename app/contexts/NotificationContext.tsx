import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useAdmin } from './AdminContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  orderNotifications: boolean;
  inventoryNotifications: boolean;
  customerNotifications: boolean;
  soundEnabled: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  sendOrderNotification: (orderNumber: number, tableNumber: number) => Promise<void>;
  sendInventoryAlert: (itemName: string, quantity: number, threshold: number) => Promise<void>;
  sendOrderReadyNotification: (orderNumber: number, tableNumber: number) => Promise<void>;
  sendGreetingNotification: (orderNumber: number, tableNumber: number) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  isPermissionGranted: boolean;
  expoPushToken: string | null;
}

const NOTIFICATION_SETTINGS_KEY = 'skadam_notification_settings';
const PUSH_TOKEN_KEY = 'skadam_push_token';

const defaultSettings: NotificationSettings = {
  orderNotifications: true,
  inventoryNotifications: true,
  customerNotifications: true,
  soundEnabled: true,
};

export const [NotificationProvider, useNotifications] = createContextHook<NotificationContextType>(() => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const { getLowStockItems, orders } = useAdmin();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const lastInventoryCheck = useRef<number>(0);
  const lastOrderCount = useRef<number>(0);
  const lastOrderStatuses = useRef<Map<string, string>>(new Map());

  const loadSettings = useCallback(async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === ('web' as any)) {
        if ('Notification' in window) {
          const permission = await (window as any).Notification.requestPermission();
          const granted = permission === 'granted';
          setIsPermissionGranted(granted);
          return granted;
        }
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      const granted = finalStatus === 'granted';
      setIsPermissionGranted(granted);
      
      if (!granted && Platform.OS !== ('web' as any)) {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in your device settings to receive order updates and inventory alerts.',
          [{ text: 'OK' }]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  const registerForPushNotifications = useCallback(async () => {
    try {
      if (Platform.OS === ('web' as any)) {
        return;
      }

      // Check if we have a projectId in the manifest
      try {
        const token = (await Notifications.getExpoPushTokenAsync({
          projectId: undefined // Let Expo infer from app.json
        })).data;
        setExpoPushToken(token);
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        console.log('Expo push token:', token);
      } catch (tokenError) {
        console.log('Push notifications not available in this environment:', tokenError);
        // Continue without push token for development
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  }, []);

  const sendLocalNotification = useCallback(async (title: string, body: string, data?: any) => {
    try {
      if (Platform.OS === ('web' as any)) {
        if ('Notification' in window && (window as any).Notification.permission === 'granted') {
          new (window as any).Notification(title, {
            body,
            icon: '/assets/images/icon.png',
            badge: '/assets/images/icon.png',
            tag: data?.type || 'general',
          });
        }
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: settings.soundEnabled ? 'default' : undefined,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }, [settings.soundEnabled]);

  const setupNotifications = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      await registerForPushNotifications();
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      
      if (data?.type === 'order_ready' && data?.orderId) {
        console.log('Order ready notification tapped:', data.orderId);
      } else if (data?.type === 'new_order' && data?.orderId) {
        console.log('New order notification tapped:', data.orderId);
      } else if (data?.type === 'inventory_alert' && data?.itemId) {
        console.log('Inventory alert tapped:', data.itemId);
      }
    });
  }, [requestPermissions, registerForPushNotifications]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  const sendOrderNotification = useCallback(async (orderNumber: number, tableNumber: number) => {
    if (!settings.orderNotifications || !isPermissionGranted) return;
    
    await sendLocalNotification(
      '🔔 New Order Received!',
      `Order #${orderNumber} from Table ${tableNumber}`,
      {
        type: 'new_order',
        orderNumber,
        tableNumber,
      }
    );
  }, [settings.orderNotifications, isPermissionGranted, sendLocalNotification]);

  const sendInventoryAlert = useCallback(async (itemName: string, quantity: number, threshold: number) => {
    if (!settings.inventoryNotifications || !isPermissionGranted) return;
    
    await sendLocalNotification(
      '⚠️ Low Stock Alert',
      `${itemName} is running low (${quantity} left, threshold: ${threshold})`,
      {
        type: 'inventory_alert',
        itemName,
        quantity,
        threshold,
      }
    );
  }, [settings.inventoryNotifications, isPermissionGranted, sendLocalNotification]);

  const sendOrderReadyNotification = useCallback(async (orderNumber: number, tableNumber: number) => {
    if (!settings.customerNotifications || !isPermissionGranted) return;
    
    await sendLocalNotification(
      '✅ Order Ready!',
      `Order #${orderNumber} for Table ${tableNumber} is ready for pickup`,
      {
        type: 'order_ready',
        orderNumber,
        tableNumber,
      }
    );
  }, [settings.customerNotifications, isPermissionGranted, sendLocalNotification]);

  const sendGreetingNotification = useCallback(async (orderNumber: number, tableNumber: number) => {
    if (!settings.customerNotifications || !isPermissionGranted) return;
    
    await sendLocalNotification(
      '🎉 Thank You for Your Order!',
      `Welcome to SKADAM! Your order #${orderNumber} has been received. We're preparing it with love at Table ${tableNumber}.`,
      {
        type: 'order_greeting',
        orderNumber,
        tableNumber,
      }
    );
  }, [settings.customerNotifications, isPermissionGranted, sendLocalNotification]);

  useEffect(() => {
    loadSettings();
    setupNotifications();
    
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [loadSettings, setupNotifications]);

  // Monitor for new orders
  useEffect(() => {
    if (orders.length > lastOrderCount.current && lastOrderCount.current > 0) {
      const newOrder = orders[0];
      if (newOrder && settings.orderNotifications) {
        sendOrderNotification(newOrder.orderNumber, newOrder.tableNumber);
      }
    }
    lastOrderCount.current = orders.length;
  }, [orders, settings.orderNotifications, sendOrderNotification]);

  // Monitor for order status changes
  useEffect(() => {
    orders.forEach(order => {
      const previousStatus = lastOrderStatuses.current.get(order.id);
      if (previousStatus && previousStatus !== order.status && order.status === 'ready') {
        // Order status changed to ready, send notification
        sendOrderReadyNotification(order.orderNumber, order.tableNumber);
      }
      lastOrderStatuses.current.set(order.id, order.status);
    });
  }, [orders, sendOrderReadyNotification]);

  // Monitor inventory levels
  useEffect(() => {
    const now = Date.now();
    if (now - lastInventoryCheck.current > 30000) {
      const lowStockItems = getLowStockItems();
      if (lowStockItems.length > 0 && settings.inventoryNotifications) {
        lowStockItems.forEach(item => {
          if (item.inventory) {
            sendInventoryAlert(item.name, item.inventory.quantity, item.inventory.alertThreshold || 5);
          }
        });
      }
      lastInventoryCheck.current = now;
    }
  }, [getLowStockItems, settings.inventoryNotifications, sendInventoryAlert]);

  return useMemo(() => ({
    settings,
    updateSettings,
    sendOrderNotification,
    sendInventoryAlert,
    sendOrderReadyNotification,
    sendGreetingNotification,
    requestPermissions,
    isPermissionGranted,
    expoPushToken,
  }), [
    settings,
    updateSettings,
    sendOrderNotification,
    sendInventoryAlert,
    sendOrderReadyNotification,
    sendGreetingNotification,
    requestPermissions,
    isPermissionGranted,
    expoPushToken,
  ]);
});