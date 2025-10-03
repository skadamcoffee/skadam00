import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This client is used for non-authenticated public data fetching (like the menu)
export const supabase = createClient(https://oplwqtpipcevwgpgujge.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbHdxdHBpcGNldndncGd1amdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTAxMDksImV4cCI6MjA3NDk4NjEwOX0.BJefB4YEqKNhVJnBrSCiyV_-kUhPCTXcZJmHGQGI1vAy);