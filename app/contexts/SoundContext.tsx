import { useEffect, useState, useCallback, useMemo } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

type SoundType = 
  | 'button_tap'
  | 'success'
  | 'error'
  | 'notification'
  | 'door_open'
  | 'coffee_pour'
  | 'cash_register'
  | 'page_turn'
  | 'menu_open'
  | 'admin_access'
  | 'logout'
  | 'order_complete'
  | 'inventory_alert'
  | 'welcome';

// Sound URLs - using free sound effects from various sources
const SOUND_URLS: Record<SoundType, string> = {
  button_tap: 'https://www.soundjay.com/misc/sounds/button-09.wav',
  success: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  error: 'https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav',
  notification: 'https://www.soundjay.com/misc/sounds/message-incoming-132.wav',
  door_open: 'https://www.soundjay.com/misc/sounds/door-open-1.wav',
  coffee_pour: 'https://www.soundjay.com/misc/sounds/water-drop-1.wav',
  cash_register: 'https://www.soundjay.com/misc/sounds/cash-register-01.wav',
  page_turn: 'https://www.soundjay.com/misc/sounds/page-flip-01a.wav',
  menu_open: 'https://www.soundjay.com/misc/sounds/swoosh-1.wav',
  admin_access: 'https://www.soundjay.com/misc/sounds/beep-07a.wav',
  logout: 'https://www.soundjay.com/misc/sounds/button-10.wav',
  order_complete: 'https://www.soundjay.com/misc/sounds/ding-idea-40142.wav',
  inventory_alert: 'https://www.soundjay.com/misc/sounds/beep-28.wav',
  welcome: 'https://www.soundjay.com/misc/sounds/chime-02.wav'
};

// Fallback to simple beep sounds for web compatibility
const WEB_SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number; volume: number }> = {
  button_tap: { frequency: 800, duration: 100, volume: 0.3 },
  success: { frequency: 1000, duration: 200, volume: 0.4 },
  error: { frequency: 300, duration: 300, volume: 0.5 },
  notification: { frequency: 600, duration: 150, volume: 0.4 },
  door_open: { frequency: 400, duration: 500, volume: 0.3 },
  coffee_pour: { frequency: 200, duration: 800, volume: 0.2 },
  cash_register: { frequency: 1200, duration: 250, volume: 0.4 },
  page_turn: { frequency: 500, duration: 120, volume: 0.3 },
  menu_open: { frequency: 700, duration: 180, volume: 0.3 },
  admin_access: { frequency: 1500, duration: 100, volume: 0.4 },
  logout: { frequency: 600, duration: 150, volume: 0.3 },
  order_complete: { frequency: 1200, duration: 300, volume: 0.5 },
  inventory_alert: { frequency: 900, duration: 200, volume: 0.4 },
  welcome: { frequency: 800, duration: 400, volume: 0.4 }
};

export const [SoundProvider, useSound] = createContextHook(() => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundObjects, setSoundObjects] = useState<Record<string, Audio.Sound>>({});
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const initializeAudio = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        // Configure audio mode for mobile
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Preload some key sounds for better performance
        const keySounds: SoundType[] = ['button_tap', 'success', 'error', 'welcome'];
        const loadedSounds: Record<string, Audio.Sound> = {};

        for (const soundType of keySounds) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: SOUND_URLS[soundType] },
              { shouldPlay: false, volume: 0.5 }
            );
            loadedSounds[soundType] = sound;
          } catch (error) {
            console.log(`Failed to load sound ${soundType}:`, error);
          }
        }

        setSoundObjects(loadedSounds);
      } else {
        // Initialize Web Audio API for web platform
        if (typeof window !== 'undefined' && window.AudioContext) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          setAudioContext(ctx);
        }
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAudio();
    return () => {
      // Cleanup sound objects
      Object.values(soundObjects).forEach(sound => {
        sound.unloadAsync().catch(console.error);
      });
    };
  }, [initializeAudio, soundObjects]);

  const playWebSound = useCallback((frequency: number, duration: number, volume: number) => {
    if (!audioContext || typeof frequency !== 'number' || typeof duration !== 'number' || typeof volume !== 'number') return;
    if (frequency < 20 || frequency > 20000 || duration < 0 || volume < 0 || volume > 1) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.error('Failed to play web sound:', error);
    }
  }, [audioContext]);

  const playSound = useCallback(async (soundType: SoundType): Promise<void> => {
    if (isMuted || isLoading) return;

    try {
      if (Platform.OS === 'web') {
        // Use Web Audio API for web
        const soundConfig = WEB_SOUND_FREQUENCIES[soundType];
        playWebSound(soundConfig.frequency, soundConfig.duration, soundConfig.volume);
      } else {
        // Use expo-av for mobile
        let sound = soundObjects[soundType];
        
        if (!sound) {
          // Load sound on demand if not preloaded
          try {
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: SOUND_URLS[soundType] },
              { shouldPlay: false, volume: 0.5 }
            );
            sound = newSound;
            setSoundObjects(prev => ({ ...prev, [soundType]: sound! }));
          } catch (error) {
            console.log(`Failed to load sound ${soundType} on demand:`, error);
            return;
          }
        }

        // Reset and play the sound
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundType}:`, error);
    }
  }, [isMuted, isLoading, soundObjects, playWebSound]);

  const setMuted = useCallback((muted: boolean) => {
    if (typeof muted !== 'boolean') return;
    setIsMuted(muted);
  }, []);

  return useMemo(() => ({
    playSound,
    setMuted,
    isMuted,
    isLoading
  }), [playSound, setMuted, isMuted, isLoading]);
});

// Hook for easy sound playing with haptic feedback
export const useSoundEffects = () => {
  const { playSound } = useSound();

  const playButtonTap = useCallback(() => playSound('button_tap'), [playSound]);
  const playSuccess = useCallback(() => playSound('success'), [playSound]);
  const playError = useCallback(() => playSound('error'), [playSound]);
  const playNotification = useCallback(() => playSound('notification'), [playSound]);
  const playDoorOpen = useCallback(() => playSound('door_open'), [playSound]);
  const playCoffeePour = useCallback(() => playSound('coffee_pour'), [playSound]);
  const playCashRegister = useCallback(() => playSound('cash_register'), [playSound]);
  const playPageTurn = useCallback(() => playSound('page_turn'), [playSound]);
  const playMenuOpen = useCallback(() => playSound('menu_open'), [playSound]);
  const playAdminAccess = useCallback(() => playSound('admin_access'), [playSound]);
  const playLogout = useCallback(() => playSound('logout'), [playSound]);
  const playOrderComplete = useCallback(() => playSound('order_complete'), [playSound]);
  const playInventoryAlert = useCallback(() => playSound('inventory_alert'), [playSound]);
  const playWelcome = useCallback(() => playSound('welcome'), [playSound]);

  return useMemo(() => ({
    playButtonTap,
    playSuccess,
    playError,
    playNotification,
    playDoorOpen,
    playCoffeePour,
    playCashRegister,
    playPageTurn,
    playMenuOpen,
    playAdminAccess,
    playLogout,
    playOrderComplete,
    playInventoryAlert,
    playWelcome
  }), [
    playButtonTap,
    playSuccess,
    playError,
    playNotification,
    playDoorOpen,
    playCoffeePour,
    playCashRegister,
    playPageTurn,
    playMenuOpen,
    playAdminAccess,
    playLogout,
    playOrderComplete,
    playInventoryAlert,
    playWelcome
  ]);
};