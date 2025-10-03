import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '../lib/supabaseClient'; // Path must be correct!
import { Alert } from 'react-native';

// --- INTERFACE DEFINITIONS ---

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    category_id: string;
    image: string; // Maps to image_url in DB
    is_popular: boolean;
    is_available: boolean;
    inventory?: { // Stored as JSONB in DB
        quantity: number;
        alertThreshold: number;
        alertEnabled: boolean;
        unit: string;
    };
}

export interface Category {
    id: string;
    name: string;
    description: string;
    image: string; // Maps to image_url in DB
    color: string;
}

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
    password?: string;
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
    // ... (All context properties remain the same) ...
    menuItems: MenuItem[];
    categories: Category[];
    orders: Order[];
    subUsers: SubUser[];
    storeSettings: StoreSettings;
    currentUser: AuthUser | null;
    addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
    updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
    deleteMenuItem: (id: string) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    addOrder: (items: OrderItem[], tableNumber: number, customerNote?: string) => Promise<{ orderId: string; orderNumber: number }>;
    getOrderById: (orderId: string) => Order | undefined;
    updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;
    clearPaidOrders: () => Promise<void>;
    updateInventory: (itemId: string, quantity: number) => Promise<void>;
    updateInventorySettings: (itemId: string, settings: { alertThreshold?: number; alertEnabled: boolean; unit?: string }) => Promise<void>;
    getLowStockItems: () => MenuItem[];
    addSubUser: (subUser: Omit<SubUser, 'id' | 'createdAt'>) => Promise<void>;
    updateSubUser: (id: string, updates: Partial<SubUser>) => Promise<void>;
    deleteSubUser: (id: string) => Promise<void>;
    updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;
    addSocialMediaLink: (link: Omit<SocialMediaLink, 'id'>) => Promise<void>;
    updateSocialMediaLink: (id: string, updates: Partial<SocialMediaLink>) => Promise<void>;
    deleteSocialMediaLink: (id: string) => Promise<void>;
    updateOpeningHours: (hours: OpeningHours[]) => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (password: string, username?: string) => Promise<boolean>;
    logout: () => void;
}

// --- CONSTANTS ---
const AUTH_KEY = 'skadam_admin_auth';
const ADMIN_PASSWORD = 'skadam2024';

const defaultStoreSettings: StoreSettings = {
    socialMediaLinks: [],
    openingHours: [],
    storeDescription: 'Fresh • Local • Artisan'
};


export const [AdminProvider, useAdmin] = createContextHook<AdminContextType>(() => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [subUsers, setSubUsers] = useState<SubUser[]>([]);
    const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

    // --- RPC Helper ---

    const getNextOrderNumber = useCallback(async (): Promise<number> => {
        const { data, error } = await supabase.rpc('get_next_order_number');
        if (error) {
            console.error('Order number RPC Error:', error);
            // Fallback to a random number, but a proper solution requires a DB connection.
            return Date.now() % 10000; 
        }
        return data as number;
    }, []);

    // --- 1. DATA FETCHING (Supabase Read Operations) ---

    const fetchCategories = useCallback(async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, description, image_url, color, sort_order')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        const mappedCategories = data.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            description: cat.description,
            image: cat.image_url,
            color: cat.color || '#333',
        })) as Category[];
        setCategories(mappedCategories);
    }, []);

    const fetchMenuItems = useCallback(async () => {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*');

        if (error) throw error;
        setMenuItems(data as MenuItem[]);
    }, []);

    const fetchOrders = useCallback(async () => {
        const { data, error } = await supabase
            .from('orders')
            .neq('status', 'paid')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        setOrders(data as Order[]);
    }, []);

    const fetchSubUsers = useCallback(async () => {
        const { data, error } = await supabase
            .from('sub_users')
            .select('id, username, name, permissions, created_at, is_active');

        if (error) throw error;
        setSubUsers(data as SubUser[]);
    }, []);

    const fetchStoreSettings = useCallback(async () => {
        const [social, hours, desc] = await Promise.all([
            supabase.from('social_media').select('*'),
            supabase.from('opening_hours').select('*'),
            supabase.from('store_details').select('store_description').eq('id', 1).single(),
        ]);

        if (social.error || hours.error || desc.error) {
            console.error('Settings load error:', social.error || hours.error || desc.error);
            return;
        }

        setStoreSettings({
            socialMediaLinks: social.data as SocialMediaLink[],
            openingHours: hours.data as OpeningHours[],
            storeDescription: desc.data?.store_description || defaultStoreSettings.storeDescription,
        });
    }, []);


    const loadData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchCategories(),
                fetchMenuItems(),
                fetchOrders(),
                fetchSubUsers(),
                fetchStoreSettings(),
            ]);
        } catch (error: any) {
            console.error('Global data load error:', error.message);
            Alert.alert('Server Error', 'Could not fetch data. Please check connection.');
        } finally {
            setIsLoading(false);
        }
    };


    // --- 2. INITIALIZATION AND REALTIME ---

    const checkAuthStatus = useCallback(async () => {
        // Keeping local auth check logic
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
    }, []);

    useEffect(() => {
        loadData();
        checkAuthStatus();

        // Set up Realtime Subscription for Orders
        const orderChannel = supabase
            .channel('public:orders')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    setOrders(prevOrders => [payload.new as Order, ...prevOrders]);
                    Alert.alert("NEW ORDER", `Order #${(payload.new as Order).orderNumber} placed.`);
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    setOrders(prevOrders => prevOrders.map(order =>
                        order.id === payload.new.id ? payload.new as Order : order
                    ));
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'orders' },
                (payload) => {
                    setOrders(prevOrders => prevOrders.filter(order => order.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(orderChannel);
        };
    }, [loadData, checkAuthStatus]);


    // --- 3. AUTHENTICATION ---

    const login = useCallback(async (password: string, username?: string): Promise<boolean> => {
        // Admin login
        if (!username && password === ADMIN_PASSWORD) {
            const user: AuthUser = { type: 'admin' };
            const authData = { isAuth: true, timestamp: Date.now(), user };
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authData));
            setIsAuthenticated(true);
            setCurrentUser(user);
            return true;
        }

        // Sub-user login
        if (username) {
            // Find user in local state (fetched from DB)
            const subUser = subUsers.find(u => u.username === username && u.password === password && u.isActive);
            if (subUser) {
                const user: AuthUser = { type: 'sub_user', id: subUser.id, username: subUser.username, name: subUser.name };
                const authData = { isAuth: true, timestamp: Date.now(), user };
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
        // Supabase sign out goes here if using Supabase Auth
        setIsAuthenticated(false);
        setCurrentUser(null);
    }, []);


    // --- 4. CRUD OPERATIONS ---

    // MENU ITEMS
    const updateInventory = useCallback(async (itemId: string, quantity: number) => {
        // Find current inventory to merge updates
        const currentItem = menuItems.find(item => item.id === itemId);
        const updatedInventory = {
            ...currentItem?.inventory,
            quantity: Math.max(0, quantity),
        };

        const { error } = await supabase
            .from('menu_items')
            .update({ inventory: updatedInventory })
            .eq('id', itemId);

        if (error) { Alert.alert('Error', `Failed to update inventory: ${error.message}`); return; }

        setMenuItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, inventory: updatedInventory } : item));
    }, [menuItems]);

    const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
        const { data: newItem, error } = await supabase
            .from('menu_items')
            .insert([{ ...item, id: undefined, image_url: item.image, inventory: item.inventory || {} }])
            .select()
            .single();

        if (error) { Alert.alert('Error', `Failed to add item: ${error.message}`); return; }
        setMenuItems(prevItems => [...prevItems, newItem as MenuItem]);
    }, []);

    const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
        const dbUpdates: Partial<MenuItem & { image_url?: string }> = { ...updates };
        if (updates.image) {
            dbUpdates.image_url = updates.image;
            delete dbUpdates.image;
        }

        const { error } = await supabase.from('menu_items').update(dbUpdates).eq('id', id);
        if (error) { Alert.alert('Error', `Failed to update item: ${error.message}`); return; }
        setMenuItems(prevItems => prevItems.map(item => item.id === id ? { ...item, ...updates } : item));
    }, []);

    const deleteMenuItem = useCallback(async (id: string) => {
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) { Alert.alert('Error', `Failed to delete item: ${error.message}`); return; }
        setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    // CATEGORIES
    const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
        const { data: newCategory, error } = await supabase
            .from('categories')
            .insert([{ ...category, id: undefined, image_url: category.image }])
            .select()
            .single();

        if (error) { Alert.alert('Error', `Failed to add category: ${error.message}`); return; }
        setCategories(prevCats => [...prevCats, { ...newCategory, image: newCategory.image_url } as Category]);
    }, []);

    const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
        const dbUpdates: Partial<Category & { image_url?: string }> = { ...updates };
        if (updates.image) {
            dbUpdates.image_url = updates.image;
            delete dbUpdates.image;
        }

        const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
        if (error) { Alert.alert('Error', `Failed to update category: ${error.message}`); return; }
        setCategories(prevCats => prevCats.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
    }, []);

    const deleteCategory = useCallback(async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) { Alert.alert('Error', `Failed to delete category: ${error.message}`); return; }
        setCategories(prevCats => prevCats.filter(cat => cat.id !== id));
    }, []);

    // ORDERS
    const addOrder = useCallback(async (items: OrderItem[], tableNumber: number, customerNote?: string): Promise<{ orderId: string; orderNumber: number }> => {
        const orderNumber = await getNextOrderNumber();
        const total = items.reduce((sum, item) => parseFloat(item.price.replace(' TND', '')) * item.quantity + sum, 0).toFixed(2);

        const newOrderData = {
            items: items, // JSONB column
            total: `${total} TND`,
            status: 'pending',
            customer_note: customerNote,
            order_number: orderNumber,
            table_number: tableNumber,
            timestamp: Date.now(),
        };

        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert([newOrderData])
            .select()
            .single();

        if (orderError) { Alert.alert('Error', `Failed to create order: ${orderError.message}`); throw new Error(orderError.message); }

        // Inventory deduction (Manual implementation)
        const updates = items.map(item => ({
            id: item.id,
            // Calculate new quantity
            quantity: menuItems.find(mi => mi.id === item.id)?.inventory?.quantity - item.quantity
        }));
        updates.forEach(update => updateInventory(update.id, update.quantity));

        // State update for orders is primarily handled by Realtime, but this gives immediate feedback
        setOrders(prevOrders => [newOrder as Order, ...prevOrders]);

        return { orderId: newOrder.id, orderNumber: newOrder.order_number };
    }, [menuItems, getNextOrderNumber, updateInventory]); // updateInventory is required for inventory deduction

    const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
        const updates = { status, paid_at: status === 'paid' ? Date.now() : undefined };

        const { error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId);

        if (error) { Alert.alert('Error', `Failed to update status: ${error.message}`); return; }
        // State update handled by Realtime
    }, []);

    const deleteOrder = useCallback(async (orderId: string) => {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) { Alert.alert('Error', `Failed to delete order: ${error.message}`); return; }
        // State update handled by Realtime
    }, []);

    const clearPaidOrders = useCallback(async () => {
        // 1. Delete all orders marked as 'paid'
        const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .eq('status', 'paid');

        if (deleteError) { Alert.alert('Error', `Failed to clear paid orders: ${deleteError.message}`); return; }

        // 2. Reset order counter via RPC
        await supabase.rpc('reset_order_counter');

        // 3. Manually update state
        setOrders(prevOrders => prevOrders.filter(order => order.status !== 'paid'));
    }, []);

    // INVENTORY SETTINGS
    const updateInventorySettings = useCallback(async (itemId: string, settings: { alertThreshold?: number; alertEnabled: boolean; unit?: string }) => {
        const currentInventory = menuItems.find(item => item.id === itemId)?.inventory || {};
        const updatedInventory = {
            ...currentInventory,
            ...settings,
            alertThreshold: settings.alertThreshold ?? currentInventory.alertThreshold ?? 5,
            quantity: currentInventory.quantity ?? 0,
            unit: settings.unit ?? currentInventory.unit ?? 'units'
        };

        const { error } = await supabase
            .from('menu_items')
            .update({ inventory: updatedInventory })
            .eq('id', itemId);

        if (error) { Alert.alert('Error', `Failed to update inventory settings: ${error.message}`); return; }

        setMenuItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, inventory: updatedInventory } : item));
    }, [menuItems]);

    const getLowStockItems = useCallback((): MenuItem[] => {
        return menuItems.filter(item => {
            if (!item.inventory || !item.inventory.alertEnabled) return false;
            return item.inventory.quantity <= (item.inventory.alertThreshold || 0);
        });
    }, [menuItems]);

    // SUB USERS
    const addSubUser = useCallback(async (subUser: Omit<SubUser, 'id' | 'createdAt'>) => {
        const { data: newUser, error } = await supabase
            .from('sub_users')
            .insert([{ ...subUser, created_at: Date.now() }])
            .select()
            .single();

        if (error) { Alert.alert('Error', `Failed to add user: ${error.message}`); return; }
        setSubUsers(prevUsers => [...prevUsers, newUser as SubUser]);
    }, []);

    const updateSubUser = useCallback(async (id: string, updates: Partial<SubUser>) => {
        const { error } = await supabase.from('sub_users').update(updates).eq('id', id);
        if (error) { Alert.alert('Error', `Failed to update user: ${error.message}`); return; }
        setSubUsers(prevUsers => prevUsers.map(user => user.id === id ? { ...user, ...updates } : user));
    }, []);

    const deleteSubUser = useCallback(async (id: string) => {
        const { error } = await supabase.from('sub_users').delete().eq('id', id);
        if (error) { Alert.alert('Error', `Failed to delete user: ${error.message}`); return; }
        setSubUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    }, []);

    // STORE SETTINGS
    const updateStoreSettings = useCallback(async (updates: Partial<StoreSettings>) => {
        if (updates.storeDescription !== undefined) {
            const { error } = await supabase
                .from('store_details')
                .update({ store_description: updates.storeDescription })
                .eq('id', 1);

            if (error) { Alert.alert('Error', `Failed to update description: ${error.message}`); }
        }
        setStoreSettings(prevSettings => ({ ...prevSettings, ...updates }));
    }, []);

    const addSocialMediaLink = useCallback(async (link: Omit<SocialMediaLink, 'id'>) => {
        const { data: newLink, error } = await supabase.from('social_media').insert([link]).select().single();
        if (error) { Alert.alert('Error', `Failed to add link: ${error.message}`); return; }
        setStoreSettings(prevSettings => ({ ...prevSettings, socialMediaLinks: [...prevSettings.socialMediaLinks, newLink as SocialMediaLink] }));
    }, []);

    const updateSocialMediaLink = useCallback(async (id: string, updates: Partial<SocialMediaLink>) => {
        const { error } = await supabase.from('social_media').update(updates).eq('id', id);
        if (error) { Alert.alert('Error', `Failed to update link: ${error.message}`); return; }
        setStoreSettings(prevSettings => ({ ...prevSettings,
            socialMediaLinks: prevSettings.socialMediaLinks.map(link => link.id === id ? { ...link, ...updates } : link)
        }));
    }, []);

    const deleteSocialMediaLink = useCallback(async (id: string) => {
        const { error } = await supabase.from('social_media').delete().eq('id', id);
        if (error) { Alert.alert('Error', `Failed to delete link: ${error.message}`); return; }
        setStoreSettings(prevSettings => ({ ...prevSettings,
            socialMediaLinks: prevSettings.socialMediaLinks.filter(link => link.id !== id)
        }));
    }, []);

    const updateOpeningHours = useCallback(async (hours: OpeningHours[]) => {
        // Clear all existing hours and insert the new array
        const { error: deleteError } = await supabase.from('opening_hours').delete().neq('day', '');
        if (deleteError) { Alert.alert('Error', `Failed to clear old hours: ${deleteError.message}`); return; }

        const { error: insertError } = await supabase.from('opening_hours').insert(hours);
        if (insertError) { Alert.alert('Error', `Failed to update hours: ${insertError.message}`); return; }

        setStoreSettings(prevSettings => ({ ...prevSettings, openingHours: hours }));
    }, []);

    const getOrderById = useCallback((orderId: string): Order | undefined => {
        return orders.find(order => order.id === orderId);
    }, [orders]);


    return useMemo(() => ({
        menuItems, categories, orders, subUsers, storeSettings, currentUser,
        addMenuItem, updateMenuItem, deleteMenuItem, addCategory, updateCategory, deleteCategory,
        addOrder, getOrderById, updateOrderStatus, deleteOrder, clearPaidOrders,
        updateInventory, updateInventorySettings, getLowStockItems,
        addSubUser, updateSubUser, deleteSubUser,
        updateStoreSettings, addSocialMediaLink, updateSocialMediaLink, deleteSocialMediaLink, updateOpeningHours,
        isLoading, isAuthenticated, login, logout
    }), [
        menuItems, categories, orders, subUsers, storeSettings, currentUser,
        addMenuItem, updateMenuItem, deleteMenuItem, addCategory, updateCategory, deleteCategory,
        addOrder, getOrderById, updateOrderStatus, deleteOrder, clearPaidOrders,
        updateInventory, updateInventorySettings, getLowStockItems,
        addSubUser, updateSubUser, deleteSubUser,
        updateStoreSettings, addSocialMediaLink, updateSocialMediaLink, deleteSocialMediaLink, updateOpeningHours,
        isLoading, isAuthenticated, login, logout
    ]);
});