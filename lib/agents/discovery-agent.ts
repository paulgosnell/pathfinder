import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';

export interface DiscoveryContext {
  userId: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  discoveryProgress?: {
    exchangeCount: number;
    hasChildBasics: boolean;
    hasDiagnosis: boolean;
    hasChallenges: boolean;
    hasContext: boolean;
    readyToComplete: boolean;
  };
}

/**
 * Discovery Agent - Onboarding Flow
 *
 * Purpose: Conduct structured onboarding conversation to gather comprehensive
 * profile information about the parent and their child(ren).
 *
 * Conversation Flow (8-10 exchanges):
 * 1. Warm welcome and orientation
 * 2-3. Child basics: Name, age, diagnosis status
 * 4-5. Main challenges parent is facing
 * 6-7. Family and school context
 * 8. Support network and medication (if applicable)
 * 9-10. Summary and transition
 *
 * Collected Data:
 * - Child's name, age, diagnosis status
 * - Main challenges (behavior, attention, emotional regulation, etc.)
 * - Family context (siblings, co-parenting, support)
 * - School context (type, support, accommodations)
 * - Medication status (if applicable)
 * - Support network (therapists, family, groups)
 */
export const createDiscoveryAgent = () => {
  return async (message: string, context: DiscoveryContext) => {
    // Build messages array from conversation history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      for (const msg of context.conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          });
        }
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Debug logging
    console.log(`[Discovery Agent] Processing message ${messages.length}`);
    console.log(`[Discovery Agent] Progress:`, context.discoveryProgress);

    // Generate response using AI SDK
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.7,

      system: `You are an ADHD parent coach conducting a discovery session with a parent.

DISCOVERY SESSION PURPOSE:
This is a first-time onboarding conversation. Your goal is to understand the parent's situation so you can provide personalized support in future sessions.

YOUR APPROACH - WARM, CURIOUS, NON-JUDGMENTAL:
- Start with a warm welcome: "I'm so glad you're here. Let's take a few minutes to understand your situation."
- Be genuinely curious - every family is unique
- Use open questions to invite storytelling
- Validate emotions: "That sounds overwhelming" / "I can hear how hard this is"
- NO advice during discovery - just gather information and build trust
- Keep it conversational - this isn't an interrogation

STRUCTURED CONVERSATION FLOW (8-10 exchanges total):

EXCHANGE 1-2: CHILD BASICS
- "Tell me about your child - what's their name and age?"
- "Has your child been formally diagnosed with ADHD, or are you still exploring?"
- Listen for: Name, age, diagnosis status, when diagnosed, by whom

EXCHANGE 3-4: MAIN CHALLENGES
- "What are the biggest challenges you're facing right now?"
- "What does a difficult day look like in your house?"
- Listen for: Behavior issues, attention problems, emotional dysregulation, social struggles, school challenges, family stress

EXCHANGE 5-6: FAMILY & SCHOOL CONTEXT
- "Tell me a bit about your family situation - do you have other children?"
- "What's school like for them - what kind of support do they have?"
- Listen for: Siblings, co-parenting, single parent, extended family support, school type, IEP/504, teacher relationships

EXCHANGE 7-8: SUPPORT & RESOURCES
- "What support do you currently have - therapists, medication, support groups?"
- "Who helps you when things get tough?"
- Listen for: Medication, therapy, school accommodations, family support, friend support, online communities

EXCHANGE 9-10: SUMMARY & TRANSITION
- Summarize what you've learned: "Let me make sure I've understood..."
- Reflect key themes and validate their experience
- Orient to next steps: "This gives me a really good picture. In our future sessions, we'll use this context to tackle specific challenges together."
- Use the updateDiscoveryProfile tool to save everything you've learned
- Mark discovery as complete

DISCOVERY PROGRESS TRACKING:
${context.discoveryProgress ? `
- Total exchanges so far: ${context.discoveryProgress.exchangeCount}
- Child basics collected: ${context.discoveryProgress.hasChildBasics ? 'Yes' : 'Not yet'}
- Diagnosis info: ${context.discoveryProgress.hasDiagnosis ? 'Yes' : 'Not yet'}
- Main challenges: ${context.discoveryProgress.hasChallenges ? 'Yes' : 'Not yet'}
- Family/school context: ${context.discoveryProgress.hasContext ? 'Yes' : 'Not yet'}
- Ready to complete: ${context.discoveryProgress.readyToComplete ? 'Yes - summarize and save profile' : 'No - continue gathering information'}
` : 'Just starting - welcome them warmly'}

CRITICAL REMINDERS:
- Review the conversation history above before responding
- Reference specific details they've already shared
- Don't re-ask questions you already know the answers to
- After 8+ exchanges, if you have comprehensive information, use the updateDiscoveryProfile tool
- Be patient - some parents share quickly, others need more prompting
- If they share something concerning (abuse, severe crisis), acknowledge it but stay focused on discovery - crisis support comes in dedicated crisis sessions

TONE:
- Warm, empathetic, professional
- Conversational, not clinical
- Curious, not interrogative
- Validating, not minimizing
- Hope-building, not overwhelming`,

      messages,

      tools: {
        updateDiscoveryProfile: tool({
          description: 'Save the comprehensive profile information gathered during discovery session and mark discovery as complete. Use this after 8+ exchanges when you have collected: child basics (name, age), diagnosis info, main challenges, family context, school context, and support network.',
          inputSchema: z.object({
            childName: z.string().describe('Child\'s name'),
            childAge: z.number().describe('Child\'s age in years'),
            diagnosisStatus: z.enum(['diagnosed', 'suspected', 'exploring', 'not-adhd']).describe('ADHD diagnosis status'),
            diagnosisDetails: z.string().optional().describe('Details about diagnosis (when, by whom, subtype, comorbidities)'),
            mainChallenges: z.array(z.string()).describe('Array of main challenges (e.g., ["homework refusal", "emotional dysregulation", "morning routine battles"])'),
            familyContext: z.string().describe('Family situation summary (siblings, co-parenting, support structure)'),
            schoolContext: z.string().describe('School situation summary (type, support, accommodations, teacher relationships)'),
            medicationStatus: z.string().optional().describe('Medication info if applicable (what medication, dosage, how long, effectiveness)'),
            supportNetwork: z.array(z.string()).describe('Array of support sources (e.g., ["therapist", "grandmother", "ADHD Facebook group"])'),
          }),
          execute: async (profile) => {
            try {
              console.log('[Discovery Agent] Saving profile for user:', context.userId);

              // Update user_profiles table
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: context.userId,
                  child_age_range: `${profile.childAge} years old`,
                  diagnosis_status: profile.diagnosisStatus,
                  diagnosis_details: profile.diagnosisDetails || null,
                  main_challenges: profile.mainChallenges,
                  family_context: profile.familyContext,
                  school_context: profile.schoolContext,
                  medication_status: profile.medicationStatus || null,
                  support_network: profile.supportNetwork,
                  discovery_completed: true,
                  discovery_completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (profileError) {
                console.error('[Discovery Agent] Error saving profile:', profileError);
                throw profileError;
              }

              console.log('[Discovery Agent] Profile saved successfully');

              return {
                success: true,
                message: 'Profile saved successfully. Discovery completed.',
                profileSummary: {
                  childName: profile.childName,
                  childAge: profile.childAge,
                  diagnosisStatus: profile.diagnosisStatus,
                  challengeCount: profile.mainChallenges.length,
                  supportCount: profile.supportNetwork.length
                }
              };
            } catch (error) {
              console.error('[Discovery Agent] Failed to save profile:', error);
              return {
                success: false,
                message: 'Failed to save profile',
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          }
        }),
      },
    });

    // Return in same format as proper-tools-agent for compatibility
    return {
      text: result.text,
      toolResults: result.steps?.map(step => step.toolResults).flat().filter(Boolean) || [],
      usage: result.usage
    };
  };
};
