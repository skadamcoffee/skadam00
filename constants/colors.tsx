// Modern, vibrant color palette for SKADAM Coffee Shop
// Inspired by contemporary brands and energizing experiences
export const Colors = {
  // Primary colors - Vibrant, energizing coral-orange
  primary: '#FF6B6B',        // Vibrant coral red
  primaryDark: '#E55555',    // Deeper coral
  primaryLight: '#FF8E8E',   // Light coral pink
  
  // Secondary colors - Deep, sophisticated navy
  secondary: '#2C3E50',      // Deep navy blue
  secondaryDark: '#1A252F',  // Darker navy
  secondaryLight: '#34495E', // Lighter navy
  
  // Accent colors - Fresh, energizing mint green
  accent: '#4ECDC4',         // Vibrant teal mint
  accentDark: '#45B7B8',     // Deeper teal
  accentLight: '#6BCF7F',    // Fresh mint green
  
  // Neutral colors - Clean, modern backgrounds
  background: '#FAFBFC',     // Ultra clean white
  surface: '#FFFFFF',        // Pure white surface
  surfaceLight: '#F8F9FA',   // Subtle cool gray
  surfaceDark: '#F1F3F4',    // Slightly darker surface
  
  // Text colors - High contrast, modern
  textPrimary: '#2C3E50',    // Deep navy (matches secondary)
  textSecondary: '#5D6D7E',  // Medium gray-blue
  textLight: '#85929E',      // Light gray-blue
  textOnPrimary: '#FFFFFF',  // White text on primary
  textOnSecondary: '#FFFFFF', // White text on secondary
  textOnAccent: '#FFFFFF',   // White text on accent
  
  // Status colors - Vibrant and clear
  success: '#27AE60',        // Fresh green
  warning: '#F39C12',        // Bright orange
  error: '#E74C3C',          // Clear red
  info: '#3498DB',           // Bright blue
  
  // Special colors
  gold: '#F1C40F',           // Bright gold
  shadow: 'rgba(44, 62, 80, 0.15)', // Cool shadow
  overlay: 'rgba(44, 62, 80, 0.8)', // Dark overlay
  border: '#E8EAED',         // Subtle border
  
  // Gradient combinations - Modern, energizing transitions
  gradients: {
    primary: ['#FF6B6B', '#E55555'],           // Coral gradient
    secondary: ['#2C3E50', '#1A252F'],         // Navy gradient
    accent: ['#4ECDC4', '#45B7B8'],            // Teal gradient
    energizing: ['#FF6B6B', '#4ECDC4'],        // Coral to teal
    modern: ['#2C3E50', '#4ECDC4'],            // Navy to teal
    sunset: ['#FF6B6B', '#F39C12', '#4ECDC4'], // Vibrant sunset
    fresh: ['#4ECDC4', '#6BCF7F', '#27AE60'],  // Fresh greens
  }
};

// Legacy color mapping for backward compatibility
export const LegacyColors = {
  brown: Colors.textPrimary,
  lightBrown: Colors.textSecondary,
  cream: Colors.background,
  gold: Colors.gold,
  darkBrown: Colors.textPrimary,
};