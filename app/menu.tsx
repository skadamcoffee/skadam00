import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Coffee, Cake, Sandwich, Droplets, Settings, Instagram, Facebook, Music, Clock, Brain } from 'lucide-react-native';
import { useAdmin } from '@/app/contexts/AdminContext';
import { Colors } from '@/constants/colors';
import { useSoundEffects } from '@/app/contexts/SoundContext';
import * as Haptics from 'expo-haptics';
import SoundToggle from '@/components/SoundToggle';



const categoryIcons = {
  coffee: Coffee,
  tea: Droplets,
  pastries: Cake,
  food: Sandwich
};

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music,
};

export default function MenuScreen() {
  const { categories, storeSettings, isLoading } = useAdmin();
  const { playButtonTap, playMenuOpen, playPageTurn } = useSoundEffects();

  const handleSocialMediaPress = async (url: string) => {
    playButtonTap();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8E8E8', '#DCDCDC']}
        style={styles.header}
      >
        <View style={styles.headerButtons}>
          <SoundToggle size={16} style={styles.soundButton} />
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => {
              playButtonTap();
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/admin');
            }}
            activeOpacity={0.7}
            testID="admin-access"
          >
            <Settings color="#666666" size={16} opacity={0.8} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>SKADAM</Text>
          <Text style={styles.subtitle}>coffee shop</Text>
          <Text style={styles.welcome}>Welcome to our menu</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.id as keyof typeof categoryIcons] || Coffee;
            return (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => {
                  playMenuOpen();
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push(`/category/${category.id}`);
                }}
                activeOpacity={0.8}
                testID={`category-${category.id}`}
              >
                <Image 
                  source={{ uri: category.image }} 
                  style={styles.categoryImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.categoryOverlay}
                >
                  <View style={styles.categoryContent}>
                    <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                      <IconComponent color="#FFF" size={24} />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.quizSection}>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => {
              playPageTurn();
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push('/quiz');
            }}
            activeOpacity={0.8}
            testID="quiz-button"
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E', '#FFB3B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quizButtonGradient}
            >
              <View style={styles.quizIconContainer}>
                <Brain color="#FFF" size={36} />
              </View>
              <View style={styles.quizButtonContent}>
                <Text style={styles.quizButtonTitle}>Coffee Quiz Challenge</Text>
                <Text style={styles.quizButtonSubtitle}>Test your knowledge & win discounts!</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerSubtext}>{storeSettings.storeDescription}</Text>
          


          {/* Social Media Links */}
          {storeSettings.socialMediaLinks.filter(link => link.isActive).length > 0 && (
            <View style={styles.socialMediaContainer}>
              <View style={styles.socialMediaHeader}>
                <Text style={styles.socialMediaTitle}>Follow Us</Text>
                <View style={styles.socialIconsRow}>
                  {storeSettings.socialMediaLinks
                    .filter(link => link.isActive)
                    .map((link) => {
                      const IconComponent = socialIcons[link.platform] || Instagram;
                      return (
                        <TouchableOpacity
                          key={link.id}
                          style={styles.socialIcon}
                          onPress={() => handleSocialMediaPress(link.url)}
                          testID={`social-${link.platform}`}
                          activeOpacity={0.7}
                        >
                          <IconComponent color={Colors.secondary} size={22} />
                        </TouchableOpacity>
                      );
                    })
                  }
                </View>
              </View>
            </View>
          )}
          
          {/* Opening Hours */}
          <View style={styles.openingHoursContainer}>
            <View style={styles.openingHoursHeader}>
              <Clock color={Colors.secondary} size={18} />
              <Text style={styles.openingHoursTitle}>Opening Hours</Text>
            </View>
            <View style={styles.openingHoursGrid}>
              {storeSettings.openingHours
                .filter(day => day.isOpen)
                .map((day) => {
                  const dayName = day.day.charAt(0).toUpperCase() + day.day.slice(1, 3);
                  return (
                    <View key={day.day} style={styles.daySchedule}>
                      <Text style={styles.dayName}>{dayName}</Text>
                      <Text style={styles.dayTime}>{day.openTime}</Text>
                      <Text style={styles.timeSeparator}>-</Text>
                      <Text style={styles.dayTime}>{day.closeTime}</Text>
                    </View>
                  );
                })
              }
              {storeSettings.openingHours.filter(day => !day.isOpen).map((day) => {
                const dayName = day.day.charAt(0).toUpperCase() + day.day.slice(1, 3);
                return (
                  <View key={day.day} style={styles.daySchedule}>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <Text style={styles.closedText}>Closed</Text>
                  </View>
                );
              })}
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
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
    marginBottom: 10,
    letterSpacing: 2,
  },
  welcome: {
    fontSize: 14,
    color: '#666666',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 20,
    gap: 20,
  },
  categoryCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  categoryContent: {
    padding: 20,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },

  footerSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  socialMediaContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  socialMediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.secondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.secondary}40`,
  },
  openingHoursContainer: {
    alignItems: 'center',
    maxWidth: 280,
  },
  openingHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  openingHoursTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  openingHoursList: {
    alignItems: 'center',
  },
  openingHoursText: {
    fontSize: 11,
    color: '#8B4513',
    lineHeight: 16,
    opacity: 0.8,
  },
  openingHoursMore: {
    fontSize: 10,
    color: '#8B4513',
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  headerButtons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  soundButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  adminButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  // Social Media Styles
  socialMediaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },

  // Opening Hours Grid Styles
  openingHoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 300,
  },
  daySchedule: {
    backgroundColor: `${Colors.accent}20`,
    borderRadius: 8,
    padding: 8,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.accent}40`,
  },
  dayName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  dayTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  timeSeparator: {
    fontSize: 10,
    color: Colors.textSecondary,
    opacity: 0.6,
    marginVertical: 1,
  },
  closedText: {
    fontSize: 10,
    color: Colors.textSecondary,
    opacity: 0.6,
    fontStyle: 'italic',
  },

  // Quiz Section Styles
  quizSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quizButton: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 8,
  },
  quizButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 20,
    minHeight: 100,
  },
  quizButtonContent: {
    flex: 1,
  },
  quizButtonTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  quizButtonSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    fontWeight: '500',
  },
  quizIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

});