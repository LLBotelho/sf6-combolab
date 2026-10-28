import { createClient } from '@supabase/supabase-js';

// The publishable key is explicitly intended for use in browsers.
// Access to user data is enforced by Supabase Auth + Row Level Security.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://bwvzxcivxguuyyznpttp.supabase.co';
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_aH3zdXT6hbbhbhpmplMXJw_I9QUNTDp';

export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
