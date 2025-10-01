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
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Star, Gift, Settings as SettingsIcon, Save, Search, Award } from 'lucide-react-native';
import { useLoyalty } from '@/app/contexts/LoyaltyContext';
import type { LoyaltySettings } from '@/app/contexts/LoyaltyContext';
import { Colors } from '@/constants/colors';

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2'
};

export default function LoyaltyManagementScreen() {
  const { customers, settings, updateSettings, transactions } = useLoyalty();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingSettings, setEditingSettings] = useState<LoyaltySettings>(settings);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phoneNumber.includes(searchQuery)
  );

  const handleSaveSettings = () => {
    updateSettings(editingSettings);
    Alert.alert('Success', 'Loyalty settings updated successfully!');
  };

  const getTierStats = () => {
    const stats = {
      bronze: customers.filter(c => c.tier === 'bronze').length,
      silver: customers.filter(c => c.tier === 'silver').length,
      gold: customers.filter(c => c.tier === 'gold').length,
      platinum: customers.filter(c => c.tier === 'platinum').length,
    };
    return stats;
  };

  const tierStats = getTierStats();
  const totalPoints = customers.reduce((sum, customer) => sum + customer.points, 0);
  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Loyalty Program',
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerTintColor: '#1A1A1A',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star color="#D4AF37" size={24} fill="#D4AF37" />
            <Text style={styles.sectionTitle}>Program Overview</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{customers.length}</Text>
              <Text style={styles.statLabel}>Total Members</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalPoints.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalSpent.toFixed(0)} TND</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
          </View>
        </View>

        {/* Tier Distribution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award color="#2D1810" size={24} />
            <Text style={styles.sectionTitle}>Tier Distribution</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.tierGrid}>
              {Object.entries(tierStats).map(([tier, count]) => (
                <View key={tier} style={styles.tierCard}>
                  <View style={[styles.tierIcon, { backgroundColor: TIER_COLORS[tier as keyof typeof TIER_COLORS] }]}>
                    <Award color="#FFF" size={16} />
                  </View>
                  <Text style={styles.tierName}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
                  <Text style={styles.tierCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SettingsIcon color="#2D1810" size={24} />
            <Text style={styles.sectionTitle}>Program Settings</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Loyalty Program</Text>
              <Switch
                value={editingSettings.isEnabled}
                onValueChange={(value) => setEditingSettings(prev => ({ ...prev, isEnabled: value }))}
                trackColor={{ false: '#D1D5DB', true: '#D4AF37' }}
                thumbColor={editingSettings.isEnabled ? '#FFF' : '#F3F4F6'}
                testID="loyalty-enabled-toggle"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Points per TND</Text>
              <TextInput
                style={styles.settingInput}
                value={editingSettings.pointsPerTND.toString()}
                onChangeText={(value) => {
                  const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 1;
                  setEditingSettings(prev => ({ ...prev, pointsPerTND: numValue }));
                }}
                keyboardType="numeric"
                testID="points-per-tnd-input"
                autoCorrect={false}
                selectTextOnFocus
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Points for Redemption</Text>
              <TextInput
                style={styles.settingInput}
                value={editingSettings.pointsForRedemption.toString()}
                onChangeText={(value) => {
                  const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 100;
                  setEditingSettings(prev => ({ ...prev, pointsForRedemption: numValue }));
                }}
                keyboardType="numeric"
                testID="points-for-redemption-input"
                autoCorrect={false}
                selectTextOnFocus
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Redemption Value (TND)</Text>
              <TextInput
                style={styles.settingInput}
                value={editingSettings.redemptionValue.toString()}
                onChangeText={(value) => {
                  const cleanValue = value.replace(/[^0-9.]/g, '');
                  const numValue = parseFloat(cleanValue) || 5;
                  setEditingSettings(prev => ({ ...prev, redemptionValue: numValue }));
                }}
                keyboardType="decimal-pad"
                testID="redemption-value-input"
                autoCorrect={false}
                selectTextOnFocus
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Welcome Bonus</Text>
              <TextInput
                style={styles.settingInput}
                value={editingSettings.welcomeBonus.toString()}
                onChangeText={(value) => {
                  const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 50;
                  setEditingSettings(prev => ({ ...prev, welcomeBonus: numValue }));
                }}
                keyboardType="numeric"
                testID="welcome-bonus-input"
                autoCorrect={false}
                selectTextOnFocus
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveSettings}
              testID="save-settings"
            >
              <Save color="#FFF" size={16} />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color="#2D1810" size={24} />
            <Text style={styles.sectionTitle}>Loyalty Members</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.searchContainer}>
              <Search color="#8B4513" size={20} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by name or phone..."
                placeholderTextColor="#8B4513"
                testID="customer-search"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            {filteredCustomers.length === 0 ? (
              <Text style={styles.emptyText}>
                {searchQuery ? 'No customers found matching your search.' : 'No loyalty members yet.'}
              </Text>
            ) : (
              filteredCustomers.map((customer) => (
                <View key={customer.id} style={styles.customerCard}>
                  <View style={styles.customerHeader}>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <Text style={styles.customerPhone}>{customer.phoneNumber}</Text>
                    </View>
                    <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[customer.tier] }]}>
                      <Text style={styles.tierBadgeText}>{customer.tier.toUpperCase()}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.customerStats}>
                    <View style={styles.customerStat}>
                      <Text style={styles.customerStatValue}>{customer.points}</Text>
                      <Text style={styles.customerStatLabel}>Points</Text>
                    </View>
                    <View style={styles.customerStat}>
                      <Text style={styles.customerStatValue}>{customer.totalSpent.toFixed(0)} TND</Text>
                      <Text style={styles.customerStatLabel}>Spent</Text>
                    </View>
                    <View style={styles.customerStat}>
                      <Text style={styles.customerStatValue}>{customer.visitCount}</Text>
                      <Text style={styles.customerStatLabel}>Visits</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.customerJoinDate}>
                    Joined: {new Date(customer.joinDate).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
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
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
  },
  tierGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  tierCard: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 4,
  },
  tierCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#2D1810',
    flex: 1,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    color: '#2D1810',
    textAlign: 'center',
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D1810',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8B4513',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  customerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#8B4513',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  customerStat: {
    alignItems: 'center',
  },
  customerStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  customerStatLabel: {
    fontSize: 12,
    color: '#8B4513',
  },
  customerJoinDate: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});