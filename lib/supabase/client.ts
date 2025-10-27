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
  child_id?: string | null; // NEW: Which child this session is about
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
  // Time tracking columns
  time_budget_minutes?: number | null;
  time_elapsed_minutes?: number | null;
  can_extend_time?: boolean | null;
  time_extension_offered?: boolean | null;
  // Session type column
  session_type?: 'discovery' | 'quick-tip' | 'update' | 'strategy' | 'crisis' | 'coaching' | null;
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

export interface UserFeedback {
  id: string;
  user_id: string;
  session_id?: string | null;
  rating: number;
  feedback_text: string;
  context?: any | null;
  user_agent?: string | null;
  page_url?: string | null;
  submitted_at?: string | null;
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
  // Discovery call fields
  discovery_completed?: boolean | null;
  discovery_completed_at?: string | null;
  diagnosis_status?: string | null;  // 'diagnosed', 'in-process', 'suspected', 'not-diagnosed'
  diagnosis_details?: string | null;
  main_challenges?: string[] | null;
  family_context?: string | null;
  school_context?: string | null;
  medication_status?: string | null;
  support_network?: string[] | null;
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

// NEW: Child profile interface for multi-child support
export interface ChildProfile {
  id: string;
  user_id: string;

  // Child Identity
  child_name: string;
  nickname?: string | null;
  child_age?: number | null;
  child_age_range?: string | null;
  date_of_birth?: string | null;

  // ADHD Diagnosis
  diagnosis_status?: 'diagnosed' | 'suspected' | 'exploring' | 'not-adhd' | null;
  diagnosis_details?: string | null;
  diagnosed_date?: string | null;
  diagnosed_by?: string | null;
  adhd_subtype?: string | null;
  comorbidities?: string[] | null;

  // Challenges & Behaviors
  main_challenges?: string[] | null;
  common_triggers?: string[] | null;
  behavioral_patterns?: any | null;
  emotional_regulation_notes?: string | null;

  // School Information
  school_name?: string | null;
  school_type?: string | null;
  grade_level?: string | null;
  has_iep?: boolean | null;
  has_504_plan?: boolean | null;
  school_support_details?: string | null;
  teacher_relationship_notes?: string | null;
  academic_strengths?: string[] | null;
  academic_struggles?: string[] | null;

  // Medical & Treatment
  medication_status?: string | null;
  current_medications?: any | null;
  medication_notes?: string | null;
  therapy_status?: string | null;
  current_therapies?: any | null;
  therapy_notes?: string | null;

  // Strategy Tracking
  tried_solutions?: string[] | null;
  successful_strategies?: string[] | null;
  failed_strategies?: string[] | null;
  strategy_notes?: any | null;

  // Parent Notes
  strengths?: string[] | null;
  interests?: string[] | null;
  parent_observations?: string | null;
  communication_style?: string | null;

  // Photos
  photo_url?: string | null;
  photo_uploaded_at?: string | null;

  // Metadata
  is_primary?: boolean | null;
  profile_complete?: boolean | null;
  created_at?: string | null;
  last_updated?: string | null;
}

// Daily Check-in interface for tracking child's daily state
export interface DailyCheckIn {
  id: string;
  user_id: string;
  child_id: string;
  checkin_date: string; // YYYY-MM-DD format
  sleep_quality: number | null; // 1-10
  attention_focus: number | null; // 1-10
  emotional_regulation: number | null; // 1-10
  behavior_quality: number | null; // 1-10
  notes: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

// Check-in statistics interface
export interface CheckInStats {
  averageScore: number; // Average of 4 dimensions
  trend: 'improving' | 'declining' | 'stable';
  bestDay: string | null; // Day of week
  worstDay: string | null; // Day of week
  dimensionAverages: {
    sleep: number;
    attention: number;
    emotional: number;
    behavior: number;
  };
}