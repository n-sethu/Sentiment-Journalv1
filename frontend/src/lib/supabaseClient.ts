import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode - create a mock Supabase client if no credentials
const isDemoMode = !supabaseUrl || !supabaseKey || 
  supabaseUrl.includes('placeholder') || 
  supabaseKey.includes('placeholder');

if (isDemoMode) {
  console.warn('🚀 Running in DEMO MODE - Supabase credentials not found');
  console.warn('📝 To enable full functionality, set up Supabase and add your credentials to .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseKey || 'demo-key'
);