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

// Export a function to create browser clients (for SSR compatibility)
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Database types
export interface AgentSession {
  id: string;
  user_id: string | null;
  therapeutic_goal?: string | null;
  crisis_level?: string | null;
  strategies_discussed?: string[] | null;
  session_outcome?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // GROW model coaching state columns
  current_challenge?: string | null;
  parent_stress_level?: string | null;
  current_phase?: string | null;
  reality_exploration_depth?: number | null;
  emotions_reflected?: boolean | null;
  exceptions_explored?: boolean | null;
  strengths_identified?: string[] | null;
  parent_generated_ideas?: string[] | null;
  ready_for_options?: boolean | null;
  mode?: 'chat' | 'voice' | null;
}

export interface AgentConversation {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any;
  agent_reasoning?: string | null;
  created_at: string;
}

export interface AgentPerformance {
  id: string;
  session_id?: string | null;
  user_id?: string | null;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  tools_used: number;
  response_time_ms: number;
  successful_completion: boolean;
  crisis_detected: boolean;
  strategies_provided: number;
  prompt_cost: number;
  completion_cost: number;
  total_cost: number;
  model_used: string;
  created_at?: string | null;
}

export interface UserProfile {
  id: string;
  user_id?: string | null;
  child_age_range?: string | null;
  common_triggers?: string[] | null;
  behavioral_patterns?: any | null;
  parent_stress_level?: string | null;
  home_constraints?: string[] | null;
  tried_solutions?: string[] | null;
  successful_strategies?: string[] | null;
  failed_strategies?: string[] | null;
  communication_preferences?: any | null;
  last_updated?: string | null;
  created_at?: string | null;
  instance_id?: string | null;
}

export interface User {
  id: string;
  consent_given?: boolean | null;
  aud?: string | null;
  consent_timestamp?: string | null;
  role?: string | null;
  consent_details?: any | null;
  email?: string | null;
  gdpr_delete_at?: string | null;
  encrypted_password?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  email_confirmed_at?: string | null;
  // Additional auth.users columns omitted for brevity
}

export interface WaitlistSignup {
  id: string;
  email: string;
  early_tester: boolean;
  signup_date: string;
  contacted: boolean;
  contacted_date?: string | null;
  source?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  metadata?: any | null;
  created_at: string;
  updated_at: string;
}