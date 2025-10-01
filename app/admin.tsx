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
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Tags, Settings, ArrowRight, Lock, LogOut, Eye, EyeOff, ShoppingBag, AlertTriangle, Bell, Users, Store, Star, Brain, Gift } from 'lucide-react-native';
import { useAdmin } from '@/app/contexts/AdminContext';
import { Colors } from '@/constants/colors';
import { useSoundEffects } from '@/app/contexts/SoundContext';
import * as Haptics from 'expo-haptics';

const adminOptions = [
  {
    id: 'orders',
    title: 'Manage Orders',
    description: 'View and manage customer orders',
    icon: ShoppingBag,
    color: '#FF6B35',
    route: '/admin/orders',
    adminOnly: false
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Track stock levels and set alerts',
    icon: AlertTriangle,
    color: '#DC143C',
    route: '/admin/inventory',
    adminOnly: true
  },
  {
    id: 'items',
    title: 'Manage Items',
    description: 'Add, edit, and delete menu items',
    icon: Package,
    color: '#8B4513',
    route: '/admin/items',
    adminOnly: true
  },
  {
    id: 'categories',
    title: 'Manage Categories',
    description: 'Add, edit, and delete categories',
    icon: Tags,
    color: '#228B22',
    route: '/admin/categories',
    adminOnly: true
  },
  {
    id: 'sub-users',
    title: 'Sub-Users Management',
    description: 'Manage order management staff',
    icon: Users,
    color: '#4B0082',
    route: '/admin/sub-users',
    adminOnly: true
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Configure push notifications and alerts',
    icon: Bell,
    color: '#FF8C00',
    route: '/admin/notifications',
    adminOnly: true
  },
  {
    id: 'loyalty',
    title: 'Loyalty Program',
    description: 'Manage customer loyalty and rewards',
    icon: Star,
    color: '#D4AF37',
    route: '/admin/loyalty',
    adminOnly: true
  },
  {
    id: 'customers',
    title: 'Customer Management',
    description: 'Manage loyalty customers and their data',
    icon: Users,
    color: '#8B5CF6',
    route: '/admin/customers',
    adminOnly: true
  },
  {
    id: 'store-settings',
    title: 'Store Settings',
    description: 'Manage social media links and opening hours',
    icon: Store,
    color: '#6B46C1',
    route: '/admin/store-settings',
    adminOnly: true
  },
  {
    id: 'quiz-questions',
    title: 'Quiz Questions',
    description: 'Manage quiz questions for customer engagement',
    icon: Brain,
    color: '#10B981',
    route: '/admin/quiz-questions',
    adminOnly: true
  },
  {
    id: 'promo-codes',
    title: 'Promo Codes',
    description: 'Create and manage discount codes',
    icon: Gift,
    color: '#F59E0B',
    route: '/admin/promo-codes',
    adminOnly: true
  }
];

function LoginScreen() {
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'sub_user'>('admin');
  const { login } = useAdmin();
  const { playButtonTap, playAdminAccess, playError, playSuccess } = useSoundEffects();

  const handleLogin = async () => {
    if (!password.trim()) {
      playError();
      Alert.alert('Error', 'Please enter the password');
      return;
    }

    if (loginMode === 'sub_user' && !username.trim()) {
      playError();
      Alert.alert('Error', 'Please enter the username');
      return;
    }

    playButtonTap();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);
    try {
      const success = await login(password, loginMode === 'sub_user' ? username : undefined);
      if (!success) {
        playError();
        Alert.alert('Error', loginMode === 'admin' ? 'Invalid admin password.' : 'Invalid username or password.');
        setPassword('');
        if (loginMode === 'sub_user') {
          setUsername('');
        }
      } else {
        playAdminAccess();
        playSuccess();
      }
    } catch (error) {
      playError();
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <View style={styles.loginContent}>
          <View style={styles.lockIconContainer}>
            <Lock color={Colors.primary} size={48} />
          </View>
          <Text style={styles.loginTitle}>
            {loginMode === 'admin' ? 'Admin Access' : 'Staff Login'}
          </Text>
          <Text style={styles.loginSubtitle}>
            {loginMode === 'admin' 
              ? 'Enter admin password to manage SKADAM menu'
              : 'Enter your staff credentials to access orders'
            }
          </Text>
          
          <View style={styles.loginModeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, loginMode === 'admin' && styles.activeModeButton]}
              onPress={() => {
                setLoginMode('admin');
                setUsername('');
                setPassword('');
              }}
              testID="admin-mode"
            >
              <Text style={[styles.modeButtonText, loginMode === 'admin' && styles.activeModeButtonText]}>
                Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, loginMode === 'sub_user' && styles.activeModeButton]}
              onPress={() => {
                setLoginMode('sub_user');
                setUsername('');
                setPassword('');
              }}
              testID="staff-mode"
            >
              <Text style={[styles.modeButtonText, loginMode === 'sub_user' && styles.activeModeButtonText]}>
                Staff
              </Text>
            </TouchableOpacity>
          </View>
          
          {loginMode === 'sub_user' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor={Colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                testID="username-input"
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={loginMode === 'admin' ? 'Enter admin password' : 'Enter password'}
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
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
                <EyeOff color={Colors.textSecondary} size={20} />
              ) : (
                <Eye color={Colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            testID="login-button"
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AdminDashboard() {
  const { logout, orders, getLowStockItems, currentUser, subUsers } = useAdmin();
  const { playButtonTap, playLogout, playMenuOpen } = useSoundEffects();
  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
  const lowStockCount = getLowStockItems().length;
  const isAdmin = currentUser?.type === 'admin';
  
  // Filter options based on user type
  const availableOptions = adminOptions.filter(option => 
    !option.adminOnly || isAdmin
  );

  const handleLogout = () => {
    playButtonTap();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            playLogout();
            logout();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8E8E8', '#DCDCDC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Settings color="#666666" size={32} />
          <Text style={styles.title}>
            {isAdmin ? 'Admin Panel' : 'Staff Panel'}
          </Text>
          <Text style={styles.subtitle}>
            {isAdmin ? 'Manage your menu' : `Welcome, ${currentUser?.name || currentUser?.username}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          testID="logout-button"
        >
          <LogOut color="#666666" size={20} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {availableOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => {
                  playMenuOpen();
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push(option.route as any);
                }}
                activeOpacity={0.8}
                testID={`admin-${option.id}`}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                    <IconComponent color="#FFF" size={24} />
                    {option.id === 'orders' && pendingOrdersCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{pendingOrdersCount}</Text>
                      </View>
                    )}
                    {option.id === 'inventory' && lowStockCount > 0 && isAdmin && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{lowStockCount}</Text>
                      </View>
                    )}
                    {option.id === 'sub-users' && subUsers.length > 0 && isAdmin && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{subUsers.filter(u => u.isActive).length}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>
                      {option.id === 'orders' && pendingOrdersCount > 0 
                        ? `${pendingOrdersCount} pending orders`
                        : option.id === 'inventory' && lowStockCount > 0 && isAdmin
                        ? `${lowStockCount} low stock alerts`
                        : option.id === 'sub-users' && subUsers.length > 0 && isAdmin
                        ? `${subUsers.filter(u => u.isActive).length} active staff`
                        : option.description
                      }
                    </Text>
                  </View>
                  <ArrowRight color={Colors.textSecondary} size={20} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Currency</Text>
          <Text style={styles.infoText}>All prices are displayed in Tunisian Dinar (TND)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AdminScreen() {
  const { isAuthenticated } = useAdmin();
  
  return isAuthenticated ? <AdminDashboard /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loginContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: `${Colors.gold}50`,
  },
  passwordInput: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: `${Colors.gold}50`,
  },
  loginModeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    width: '100%',
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: Colors.gold,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  activeModeButtonText: {
    color: Colors.textPrimary,
    opacity: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    opacity: 0.8,
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
    color: '#1A1A1A',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
    opacity: 0.9,
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  optionsContainer: {
    padding: 20,
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  infoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: `${Colors.accent}20`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.accent}50`,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
  },
});