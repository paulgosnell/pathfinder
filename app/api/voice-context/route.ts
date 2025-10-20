import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';

export interface VoiceContextData {
  userId: string;
  userProfile?: {
    familyContext?: string;
    supportNetwork?: string[];
    parentStressLevel?: string;
  };
  childProfiles?: Array<{
    childName: string;
    childAge?: number | null;
    childAgeRange?: string | null;
    diagnosisStatus?: string | null;
    diagnosisDetails?: string | null;
    mainChallenges?: string[];
    schoolType?: string | null;
    gradeLevel?: string | null;
    hasIEP?: boolean | null;
    has504Plan?: boolean | null;
    medicationStatus?: string | null;
    therapyStatus?: string | null;
    strengths?: string[];
    interests?: string[];
    isPrimary?: boolean | null;
  }>;
  recentConversations?: Array<{
    role: string;
    content: string;
  }>;
}

/**
 * GET /api/voice-context
 * Fetch user context (profile, children, recent conversations) for voice agent personalization
 */
export async function GET(req: NextRequest) {
  try {
    // Check for authenticated user
    const supabase = await createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return new Response(JSON.stringify({
        error: "Authentication required"
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = authUser.id;
    const serviceClient = createServiceClient();

    // Load user profile
    const { data: userProfile } = await serviceClient
      .from('user_profiles')
      .select('family_context, support_network, parent_stress_level')
      .eq('user_id', userId)
      .single();

    // Load child profiles
    const { data: childProfiles } = await serviceClient
      .from('child_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    // Load recent conversation history (last 20 messages across all sessions)
    // This gives the agent context about what you've discussed recently
    const { data: recentConversations } = await serviceClient
      .from('agent_conversations')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Map database columns to expected format
    const contextData: VoiceContextData = {
      userId,
      userProfile: userProfile ? {
        familyContext: userProfile.family_context,
        supportNetwork: userProfile.support_network,
        parentStressLevel: userProfile.parent_stress_level,
      } : undefined,
      childProfiles: childProfiles?.map(child => ({
        childName: child.child_name,
        childAge: child.child_age,
        childAgeRange: child.child_age_range,
        diagnosisStatus: child.diagnosis_status,
        diagnosisDetails: child.diagnosis_details,
        mainChallenges: child.main_challenges,
        schoolType: child.school_type,
        gradeLevel: child.grade_level,
        hasIEP: child.has_iep,
        has504Plan: child.has_504_plan,
        medicationStatus: child.medication_status,
        therapyStatus: child.therapy_status,
        strengths: child.strengths,
        interests: child.interests,
        isPrimary: child.is_primary,
      })),
      recentConversations: recentConversations?.reverse(), // Oldest first for context
    };

    return new Response(JSON.stringify(contextData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to load voice context:', error);
    return new Response(JSON.stringify({
      error: 'Failed to load user context'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
