import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eeobuhwxcstbuwxzlsav.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nH1Gy2XuEuygdm0SDwDzMQ_SEjSC_n7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

