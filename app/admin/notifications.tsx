import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Settings, Volume2, VolumeX, Smartphone, Package, ShoppingCart } from 'lucide-react-native';
import { useNotifications } from '@/app/contexts/NotificationContext';
import { useAdmin } from '@/app/contexts/AdminContext';
import { Colors } from '@/constants/colors';

export default function NotificationSettings() {
  const { settings, updateSettings, requestPermissions, isPermissionGranted, expoPushToken } = useNotifications();
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubText}>Please login to access notification settings</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePermissionRequest = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('Success', 'Notification permissions granted!');
    } else {
      Alert.alert('Permission Denied', 'Please enable notifications in your device settings to receive alerts.');
    }
  };

  const testNotification = () => {
    Alert.alert(
      'Test Notification',
      'This would send a test notification to verify your settings are working correctly.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Bell size={32} color="#8B4513" />
          <Text style={styles.title}>Notification Settings</Text>
          <Text style={styles.subtitle}>Manage your notification preferences</Text>
        </View>

        {/* Permission Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#8B4513" />
            <Text style={styles.sectionTitle}>Permission Status</Text>
          </View>
          
          <View style={styles.permissionCard}>
            <View style={styles.permissionRow}>
              <Smartphone size={20} color={isPermissionGranted ? "#22C55E" : "#EF4444"} />
              <Text style={[styles.permissionText, { color: isPermissionGranted ? "#22C55E" : "#EF4444" }]}>
                {isPermissionGranted ? "Notifications Enabled" : "Notifications Disabled"}
              </Text>
            </View>
            
            {!isPermissionGranted && (
              <TouchableOpacity style={styles.enableButton} onPress={handlePermissionRequest}>
                <Text style={styles.enableButtonText}>Enable Notifications</Text>
              </TouchableOpacity>
            )}
            
            {expoPushToken && (
              <Text style={styles.tokenText}>Push Token: {expoPushToken.substring(0, 20)}...</Text>
            )}
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#8B4513" />
            <Text style={styles.sectionTitle}>Notification Types</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ShoppingCart size={20} color="#8B4513" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>New Orders</Text>
                  <Text style={styles.settingDescription}>Get notified when customers place new orders</Text>
                </View>
              </View>
              <Switch
                value={settings.orderNotifications}
                onValueChange={(value) => updateSettings({ orderNotifications: value })}
                trackColor={{ false: '#D1D5DB', true: '#8B4513' }}
                thumbColor={settings.orderNotifications ? '#F5E6D3' : '#F3F4F6'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Package size={20} color="#8B4513" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Inventory Alerts</Text>
                  <Text style={styles.settingDescription}>Get notified when items are running low</Text>
                </View>
              </View>
              <Switch
                value={settings.inventoryNotifications}
                onValueChange={(value) => updateSettings({ inventoryNotifications: value })}
                trackColor={{ false: '#D1D5DB', true: '#8B4513' }}
                thumbColor={settings.inventoryNotifications ? '#F5E6D3' : '#F3F4F6'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#8B4513" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Customer Notifications</Text>
                  <Text style={styles.settingDescription}>Send order ready notifications to customers</Text>
                </View>
              </View>
              <Switch
                value={settings.customerNotifications}
                onValueChange={(value) => updateSettings({ customerNotifications: value })}
                trackColor={{ false: '#D1D5DB', true: '#8B4513' }}
                thumbColor={settings.customerNotifications ? '#F5E6D3' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Sound Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {settings.soundEnabled ? (
              <Volume2 size={20} color="#8B4513" />
            ) : (
              <VolumeX size={20} color="#8B4513" />
            )}
            <Text style={styles.sectionTitle}>Sound Settings</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                {settings.soundEnabled ? (
                  <Volume2 size={20} color="#8B4513" />
                ) : (
                  <VolumeX size={20} color="#8B4513" />
                )}
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notification Sounds</Text>
                  <Text style={styles.settingDescription}>Play sound when notifications arrive</Text>
                </View>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSettings({ soundEnabled: value })}
                trackColor={{ false: '#D1D5DB', true: '#8B4513' }}
                thumbColor={settings.soundEnabled ? '#F5E6D3' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Test Notification */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.testButton} onPress={testNotification}>
            <Bell size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>Test Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Notifications help you stay updated with new orders and inventory alerts in real-time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1810',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1810',
    marginLeft: 8,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  enableButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});