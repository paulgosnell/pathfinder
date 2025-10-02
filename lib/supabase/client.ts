import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey,
    env: process.env.NODE_ENV
  });
}

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface AgentSession {
  id: string;
  user_id: string;
  therapeutic_goal?: string;
  crisis_level: string;
  strategies_discussed: string[];
  session_outcome?: string;
  started_at: string;
  ended_at?: string;
}

export interface AgentConversation {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any;
  agent_reasoning?: string;
  created_at: string;
}