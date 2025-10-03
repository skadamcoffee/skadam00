import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// IMPORTANT: Use environment variables in production instead of hardcoding
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://oplwqtpipcevwgpgujge.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbHdxdHBpcGNldndncGd1amdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTAxMDksImV4cCI6MjA3NDk4NjEwOX0.BJefB4YEqKNhVJnBrSCiyV_-kUhPCTXcZJmHGQGI1vA";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
