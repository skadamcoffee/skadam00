import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useSound } from '@/app/contexts/SoundContext';
import * as Haptics from 'expo-haptics';

interface SoundToggleProps {
  size?: number;
  color?: string;
  style?: any;
}

export default function SoundToggle({ size = 20, color = '#666666', style }: SoundToggleProps) {
  const { isMuted, setMuted } = useSound();

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMuted(!isMuted);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleToggle}
      activeOpacity={0.7}
      testID="sound-toggle"
    >
      {isMuted ? (
        <VolumeX color={color} size={size} opacity={0.6} />
      ) : (
        <Volume2 color={color} size={size} opacity={0.8} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});