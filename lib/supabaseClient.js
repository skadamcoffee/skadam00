import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This client is used for non-authenticated public data fetching (like the menu)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);