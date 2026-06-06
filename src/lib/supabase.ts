import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
// Note: For full type safety, generate types with `supabase gen types typescript`
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
