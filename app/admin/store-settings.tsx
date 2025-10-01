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
import { Instagram, Plus, Trash2, Clock, Save, ExternalLink, Music, Facebook } from 'lucide-react-native';
import { useAdmin } from '@/app/contexts/AdminContext';
import type { SocialMediaLink, OpeningHours } from '@/app/contexts/AdminContext';
import { Colors } from '@/constants/colors';

const DAYS = [
  { key: 'monday' as const, label: 'Monday' },
  { key: 'tuesday' as const, label: 'Tuesday' },
  { key: 'wednesday' as const, label: 'Wednesday' },
  { key: 'thursday' as const, label: 'Thursday' },
  { key: 'friday' as const, label: 'Friday' },
  { key: 'saturday' as const, label: 'Saturday' },
  { key: 'sunday' as const, label: 'Sunday' },
];

const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music,
};

export default function StoreSettingsScreen() {
  const { storeSettings, addSocialMediaLink, updateSocialMediaLink, deleteSocialMediaLink, updateOpeningHours, updateStoreSettings } = useAdmin();
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [newLinkPlatform, setNewLinkPlatform] = useState<'instagram' | 'facebook' | 'tiktok'>('instagram');
  const [editingHours, setEditingHours] = useState<OpeningHours[]>(storeSettings.openingHours);
  const [storeDescription, setStoreDescription] = useState<string>(storeSettings.storeDescription);

  const handleAddSocialLink = () => {
    if (!newLinkUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    // Basic URL validation
    if (!newLinkUrl.includes('http') && !newLinkUrl.includes('www.')) {
      Alert.alert('Error', 'Please enter a valid URL (e.g., https://instagram.com/yourpage)');
      return;
    }

    addSocialMediaLink({
      platform: newLinkPlatform,
      url: newLinkUrl.trim(),
      isActive: true,
    });

    setNewLinkUrl('');
    Alert.alert('Success', 'Social media link added successfully!');
  };

  const handleDeleteSocialLink = (id: string) => {
    Alert.alert(
      'Delete Link',
      'Are you sure you want to delete this social media link?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSocialMediaLink(id) }
      ]
    );
  };

  const handleToggleSocialLink = (id: string, isActive: boolean) => {
    updateSocialMediaLink(id, { isActive });
  };

  const handleUpdateHours = (dayKey: string, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string) => {
    const updatedHours = editingHours.map(day => {
      if (day.day === dayKey) {
        return { ...day, [field]: value };
      }
      return day;
    });
    setEditingHours(updatedHours);
  };

  const handleSaveHours = () => {
    updateOpeningHours(editingHours);
    Alert.alert('Success', 'Opening hours updated successfully!');
  };

  const handleSaveDescription = () => {
    updateStoreSettings({ storeDescription });
    Alert.alert('Success', 'Store description updated successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Store Settings',
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerTintColor: '#1A1A1A',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Store Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Store Description</Text>
          </View>
          <View style={styles.card}>
            <TextInput
              style={styles.descriptionInput}
              value={storeDescription}
              onChangeText={setStoreDescription}
              placeholder="Enter store description (e.g., Fresh • Local • Artisan)"
              placeholderTextColor="#8B4513"
              multiline
              testID="store-description-input"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveDescription}
              testID="save-description"
            >
              <Save color="#FFF" size={16} />
              <Text style={styles.saveButtonText}>Save Description</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Media Links Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Instagram color="#2D1810" size={24} />
            <Text style={styles.sectionTitle}>Social Media Links</Text>
          </View>
          
          {/* Add New Link */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add New Link</Text>
            <View style={styles.addLinkContainer}>
              <View style={styles.platformSelector}>
                <TouchableOpacity
                  style={[styles.platformButton, newLinkPlatform === 'instagram' && styles.platformButtonActive]}
                  onPress={() => setNewLinkPlatform('instagram')}
                  testID="platform-instagram"
                >
                  <Text style={[styles.platformButtonText, newLinkPlatform === 'instagram' && styles.platformButtonTextActive]}>Instagram</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.platformButton, newLinkPlatform === 'facebook' && styles.platformButtonActive]}
                  onPress={() => setNewLinkPlatform('facebook')}
                  testID="platform-facebook"
                >
                  <Text style={[styles.platformButtonText, newLinkPlatform === 'facebook' && styles.platformButtonTextActive]}>Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.platformButton, newLinkPlatform === 'tiktok' && styles.platformButtonActive]}
                  onPress={() => setNewLinkPlatform('tiktok')}
                  testID="platform-tiktok"
                >
                  <Text style={[styles.platformButtonText, newLinkPlatform === 'tiktok' && styles.platformButtonTextActive]}>TikTok</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.urlInput}
                value={newLinkUrl}
                onChangeText={setNewLinkUrl}
                placeholder="Enter social media URL"
                placeholderTextColor="#8B4513"
                autoCapitalize="none"
                testID="social-url-input"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSocialLink}
                testID="add-social-link"
              >
                <Plus color="#FFF" size={20} />
                <Text style={styles.addButtonText}>Add Link</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Existing Links */}
          {storeSettings.socialMediaLinks.map((link) => {
            const IconComponent = PLATFORM_ICONS[link.platform];
            return (
              <View key={link.id} style={styles.card}>
                <View style={styles.linkHeader}>
                  <View style={styles.linkInfo}>
                    <IconComponent color="#2D1810" size={20} />
                    <Text style={styles.linkPlatform}>{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</Text>
                  </View>
                  <View style={styles.linkActions}>
                    <Switch
                      value={link.isActive}
                      onValueChange={(value) => handleToggleSocialLink(link.id, value)}
                      trackColor={{ false: '#D1D5DB', true: '#D4AF37' }}
                      thumbColor={link.isActive ? '#FFF' : '#F3F4F6'}
                      testID={`toggle-${link.id}`}
                    />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSocialLink(link.id)}
                      testID={`delete-${link.id}`}
                    >
                      <Trash2 color="#DC2626" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                <View style={styles.linkStatus}>
                  <View style={[styles.statusDot, { backgroundColor: link.isActive ? '#10B981' : '#6B7280' }]} />
                  <Text style={styles.statusText}>{link.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Opening Hours Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock color="#2D1810" size={24} />
            <Text style={styles.sectionTitle}>Opening Hours</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Schedule</Text>
            {DAYS.map((day) => {
              const dayHours = editingHours.find(h => h.day === day.key);
              if (!dayHours) return null;
              
              return (
                <View key={day.key} style={styles.dayRow}>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayLabel}>{day.label}</Text>
                    <Switch
                      value={dayHours.isOpen}
                      onValueChange={(value) => handleUpdateHours(day.key, 'isOpen', value)}
                      trackColor={{ false: '#D1D5DB', true: '#D4AF37' }}
                      thumbColor={dayHours.isOpen ? '#FFF' : '#F3F4F6'}
                      testID={`day-toggle-${day.key}`}
                    />
                  </View>
                  
                  {dayHours.isOpen && (
                    <View style={styles.timeInputs}>
                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>Open</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={dayHours.openTime}
                          onChangeText={(value) => handleUpdateHours(day.key, 'openTime', value)}
                          placeholder="08:00"
                          placeholderTextColor="#8B4513"
                          testID={`open-time-${day.key}`}
                        />
                      </View>
                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>Close</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={dayHours.closeTime}
                          onChangeText={(value) => handleUpdateHours(day.key, 'closeTime', value)}
                          placeholder="18:00"
                          placeholderTextColor="#8B4513"
                          testID={`close-time-${day.key}`}
                        />
                      </View>
                    </View>
                  )}
                  
                  {!dayHours.isOpen && (
                    <Text style={styles.closedText}>Closed</Text>
                  )}
                </View>
              );
            })}
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveHours}
              testID="save-hours"
            >
              <Save color="#FFF" size={16} />
              <Text style={styles.saveButtonText}>Save Hours</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ExternalLink color="#2D1810" size={24} />
            <Text style={styles.sectionTitle}>Footer Preview</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How it will appear in the menu</Text>
            <View style={styles.previewFooter}>
              <Text style={styles.previewDescription}>{storeDescription}</Text>
              
              {storeSettings.socialMediaLinks.filter(link => link.isActive).length > 0 && (
                <View style={styles.previewSocial}>
                  {storeSettings.socialMediaLinks
                    .filter(link => link.isActive)
                    .map((link) => {
                      const IconComponent = PLATFORM_ICONS[link.platform];
                      return (
                        <TouchableOpacity 
                          key={link.id} 
                          style={styles.previewSocialIcon}
                          onPress={() => {
                            // This shows how it will work in the menu
                            console.log('Would open:', link.url);
                          }}
                          activeOpacity={0.7}
                        >
                          <IconComponent color="#8B4513" size={20} />
                        </TouchableOpacity>
                      );
                    })
                  }
                </View>
              )}
              
              <View style={styles.previewHours}>
                <Text style={styles.previewHoursTitle}>Opening Hours</Text>
                {editingHours
                  .filter(day => day.isOpen)
                  .map((day) => (
                    <Text key={day.day} style={styles.previewHoursText}>
                      {day.day.charAt(0).toUpperCase() + day.day.slice(1)}: {day.openTime} - {day.closeTime}
                    </Text>
                  ))
                }
              </View>
            </View>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D1810',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  addLinkContainer: {
    gap: 16,
  },
  platformSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  platformButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  platformButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  platformButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  platformButtonTextActive: {
    color: '#FFF',
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D1810',
  },
  addButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkPlatform: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  linkUrl: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  linkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dayRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D1810',
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#2D1810',
    textAlign: 'center',
  },
  closedText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  previewFooter: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewDescription: {
    fontSize: 14,
    color: '#8B4513',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  previewSocial: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  previewSocialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewHours: {
    alignItems: 'center',
  },
  previewHoursTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  previewHoursText: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
  },
});