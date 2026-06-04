// db.js - Place this in your project root folder
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  console.log('Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
supabase
  .from('leads')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  });

export default supabase;