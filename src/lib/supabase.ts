import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SignDictionary {
  id: string;
  word: string;
  category: string;
  sign_description: string;
  video_url?: string;
  image_url?: string;
  difficulty: string;
  usage_count: number;
  created_at: string;
}

export interface ConversationHistory {
  id: string;
  user_id?: string;
  input_text: string;
  input_type: 'text' | 'voice' | 'sign';
  output_type: 'sign' | 'text' | 'voice';
  signs_used: string[];
  created_at: string;
}
