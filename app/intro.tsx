import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Coffee, Sparkles, ChevronRight, Quote } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRandomQuote } from '@/constants/motivationQuotes';
import { Colors } from '@/constants/colors';
import { useSoundEffects } from '@/app/contexts/SoundContext';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { playWelcome, playDoorOpen, playCoffeePour } = useSoundEffects();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const coffeeAnim = useRef(new Animated.Value(0)).current;
  
  const [showContent, setShowContent] = useState(false);
  const [isDoorOpening, setIsDoorOpening] = useState(false);
  const [motivationQuote, setMotivationQuote] = useState<string>('');
  const [showQuote, setShowQuote] = useState(false);
  
  // Door animation values
  const leftDoorAnim = useRef(new Animated.Value(0)).current;
  const rightDoorAnim = useRef(new Animated.Value(0)).current;
  const doorHandleAnim = useRef(new Animated.Value(0)).current;
  const doorShadowAnim = useRef(new Animated.Value(0)).current;
  const menuRevealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Initial fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Logo animation
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Text animation
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Button animation
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    // Start sparkle and coffee animations
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const coffeeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(coffeeAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(coffeeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    sequence.start(() => {
      setShowContent(true);
      sparkleLoop.start();
      coffeeLoop.start();
      // Play welcome sound after animations complete
      setTimeout(() => {
        playWelcome();
      }, 500);
    });

    return () => {
      sparkleLoop.stop();
      coffeeLoop.stop();
    };
  }, [fadeAnim, scaleAnim, logoAnim, textAnim, buttonAnim, sparkleAnim, coffeeAnim]);

  const handleEnterCoffeeShop = () => {
    // Play button tap sound and haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    playDoorOpen();
    
    // Get a random motivation quote
    const quote = getRandomQuote();
    setMotivationQuote(quote);
    setShowQuote(true);
    setIsDoorOpening(true);
    
    // Animate door opening
    Animated.parallel([
      // Left door slides left
      Animated.timing(leftDoorAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      // Right door slides right
      Animated.timing(rightDoorAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      // Door handle rotates
      Animated.timing(doorHandleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Shadow appears
      Animated.timing(doorShadowAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Menu reveals behind door
      Animated.timing(menuRevealAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Play coffee pour sound when door opens
      setTimeout(() => {
        playCoffeePour();
      }, 600);
      
      // Show quote for 2 seconds, then navigate to menu
      setTimeout(() => {
        setShowQuote(false);
        setTimeout(() => {
          router.replace('/menu');
        }, 500);
      }, 2000);
    });
  };

  const sparkleRotate = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const coffeeTranslateY = coffeeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  // Door animation interpolations
  const leftDoorTranslateX = leftDoorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screenWidth * 0.6],
  });

  const rightDoorTranslateX = rightDoorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth * 0.6],
  });

  const doorHandleRotate = doorHandleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const doorShadowOpacity = doorShadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const menuRevealScale = menuRevealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const menuRevealOpacity = menuRevealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#F5F5F5', '#E8E8E8', '#DCDCDC']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Background decorative elements */}
          <View style={styles.decorativeElements}>
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkle1,
                {
                  transform: [{ rotate: sparkleRotate }],
                  opacity: sparkleAnim,
                },
              ]}
            >
              <Sparkles color={Colors.gold} size={20} />
            </Animated.View>
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkle2,
                {
                  transform: [{ rotate: sparkleRotate }],
                  opacity: sparkleAnim,
                },
              ]}
            >
              <Sparkles color={Colors.gold} size={16} />
            </Animated.View>
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkle3,
                {
                  transform: [{ rotate: sparkleRotate }],
                  opacity: sparkleAnim,
                },
              ]}
            >
              <Sparkles color={Colors.gold} size={24} />
            </Animated.View>
          </View>

          {/* Coffee cup floating animation */}
          <Animated.View
            style={[
              styles.coffeeIcon,
              {
                transform: [{ translateY: coffeeTranslateY }],
                opacity: coffeeAnim,
              },
            ]}
          >
            <Coffee color={Colors.gold} size={40} />
          </Animated.View>

          {/* Main logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoAnim,
                transform: [
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tcjioi0s9bixg31e0yjlo' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Welcome text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textAnim,
                transform: [
                  {
                    translateY: textAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandText}>SKADAM</Text>
            <Text style={styles.taglineText}>Where every cup tells a story</Text>
            <View style={styles.divider} />
            <Text style={styles.descriptionText}>
              Experience the finest artisan coffee,{"\n"}
              crafted with passion and served with love
            </Text>
          </Animated.View>

          {/* Enter button */}
          {showContent && (
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: buttonAnim,
                  transform: [
                    {
                      translateY: buttonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.enterButton}
                onPress={handleEnterCoffeeShop}
                activeOpacity={0.8}
                testID="enter-coffee-shop"
              >
                <LinearGradient
                  colors={[Colors.gold, Colors.warning, Colors.primaryDark]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>Enter Coffee Shop</Text>
                  <ChevronRight color={Colors.textOnPrimary} size={20} />
                </LinearGradient>
              </TouchableOpacity>
              
              <Text style={styles.hintText}>Tap to explore our menu</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Bottom decorative wave */}
        <View style={styles.bottomWave}>
          <LinearGradient
            colors={['transparent', `${Colors.gold}20`]}
            style={styles.waveGradient}
          />
        </View>

        {/* Door Animation Overlay */}
        {isDoorOpening && (
          <View style={styles.doorContainer}>
            {/* Empty background behind doors - no menu preview */}
            <Animated.View
              style={[
                styles.menuPreview,
                {
                  opacity: menuRevealOpacity,
                  transform: [{ scale: menuRevealScale }],
                },
              ]}
            >
              <LinearGradient
                colors={[Colors.background, Colors.surfaceLight, Colors.accent]}
                style={styles.menuBackground}
              />
            </Animated.View>

            {/* Door Shadow */}
            <Animated.View
              style={[
                styles.doorShadow,
                {
                  opacity: doorShadowOpacity,
                },
              ]}
            />

            {/* Left Door */}
            <Animated.View
              style={[
                styles.door,
                styles.leftDoor,
                {
                  transform: [{ translateX: leftDoorTranslateX }],
                },
              ]}
            >
              <LinearGradient
                colors={[Colors.textPrimary, Colors.textSecondary, Colors.accent]}
                style={styles.doorGradient}
              >
                {/* Door panels */}
                <View style={styles.doorPanel}>
                  <View style={styles.doorPanelInner} />
                </View>
                <View style={styles.doorPanel}>
                  <View style={styles.doorPanelInner} />
                </View>
                
                {/* Door handle */}
                <Animated.View
                  style={[
                    styles.doorHandle,
                    styles.leftDoorHandle,
                    {
                      transform: [{ rotate: doorHandleRotate }],
                    },
                  ]}
                >
                  <View style={styles.doorHandleInner} />
                </Animated.View>
              </LinearGradient>
            </Animated.View>

            {/* Right Door */}
            <Animated.View
              style={[
                styles.door,
                styles.rightDoor,
                {
                  transform: [{ translateX: rightDoorTranslateX }],
                },
              ]}
            >
              <LinearGradient
                colors={[Colors.textPrimary, Colors.textSecondary, Colors.accent]}
                style={styles.doorGradient}
              >
                {/* Door panels */}
                <View style={styles.doorPanel}>
                  <View style={styles.doorPanelInner} />
                </View>
                <View style={styles.doorPanel}>
                  <View style={styles.doorPanelInner} />
                </View>
                
                {/* Door handle */}
                <Animated.View
                  style={[
                    styles.doorHandle,
                    styles.rightDoorHandle,
                    {
                      transform: [{ rotate: doorHandleRotate }],
                    },
                  ]}
                >
                  <View style={styles.doorHandleInner} />
                </Animated.View>
              </LinearGradient>
            </Animated.View>

            {/* Motivation Quote Overlay */}
            {showQuote && (
              <Animated.View
                style={[
                  styles.quoteOverlay,
                  {
                    opacity: menuRevealAnim,
                  },
                ]}
              >
                <View style={styles.quoteContainer}>
                  <Quote color={Colors.gold} size={32} style={styles.quoteIcon} />
                  <Text style={styles.quoteText}>{motivationQuote}</Text>
                  <View style={styles.quoteDivider} />
                  <Text style={styles.quoteSubtext}>Welcome to SKADAM Coffee Shop</Text>
                </View>
              </Animated.View>
            )}


          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: '20%',
    left: '15%',
  },
  sparkle2: {
    top: '30%',
    right: '20%',
  },
  sparkle3: {
    bottom: '25%',
    left: '20%',
  },
  coffeeIcon: {
    position: 'absolute',
    top: '15%',
    right: '15%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: '80%',
    height: 120,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666666',
    opacity: 0.8,
    marginBottom: 5,
    fontWeight: '300',
  },
  brandText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 16,
    color: '#8B4513',
    fontStyle: 'italic',
    opacity: 0.9,
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#8B4513',
    marginBottom: 20,
    opacity: 0.7,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  enterButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 15,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
    marginRight: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#666666',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  waveGradient: {
    flex: 1,
  },
  // Door Animation Styles
  doorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  menuBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  doorShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 2,
  },
  door: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 3,
  },
  leftDoor: {
    left: 0,
  },
  rightDoor: {
    right: 0,
  },
  doorGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-around',
  },
  doorPanel: {
    flex: 1,
    marginVertical: 20,
    borderWidth: 3,
    borderColor: Colors.textSecondary,
    borderRadius: 10,
    padding: 15,
  },
  doorPanelInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.textLight,
    borderRadius: 5,
  },
  doorHandle: {
    position: 'absolute',
    top: '50%',
    width: 20,
    height: 60,
    marginTop: -30,
  },
  leftDoorHandle: {
    right: 15,
  },
  rightDoorHandle: {
    left: 15,
  },
  doorHandleInner: {
    flex: 1,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.warning,
  },

  // Quote Overlay Styles
  quoteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${Colors.overlay}95`,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  quoteContainer: {
    backgroundColor: `${Colors.textOnPrimary}10`,
    borderRadius: 20,
    padding: 40,
    marginHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.gold}50`,
  },
  quoteIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  quoteText: {
    fontSize: 20,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: 20,
    fontWeight: '300',
  },
  quoteDivider: {
    width: 80,
    height: 2,
    backgroundColor: Colors.gold,
    marginBottom: 15,
    opacity: 0.7,
  },
  quoteSubtext: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '500',
    letterSpacing: 1,
  },
});