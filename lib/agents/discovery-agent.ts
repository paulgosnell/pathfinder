import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';

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

    // Check if we should auto-trigger save based on conversation progress
    const shouldAutoSave = context.discoveryProgress?.readyToComplete || false;
    console.log(`[Discovery Agent] Auto-save trigger: ${shouldAutoSave}`);

    // Generate response using AI SDK
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.7,
      maxSteps: 5, // Allow tool execution + response generation

      system: `You are conducting a brief information-gathering session to set up a parent's profile.

${shouldAutoSave ? `
🚨 CRITICAL ACTION REQUIRED 🚨
You have collected sufficient information. You MUST call the updateDiscoveryProfile tool NOW to save the data.
After the user's next response, immediately call updateDiscoveryProfile with all collected information from the conversation history.
` : ''}

DISCOVERY SESSION PURPOSE:
This is a 5-10 minute onboarding conversation to collect essential information about the parent's child(ren) and situation. This is NOT a coaching session - you are simply gathering data to build their profile.

YOUR ROLE - FRIENDLY INTAKE COORDINATOR:
- Warm but efficient: "Welcome! Let me get some basic information so I can personalize your experience."
- Ask direct questions - this is data collection, not therapy
- Keep responses brief and move through questions systematically
- NO coaching, NO advice, NO deep exploration - save that for future sessions
- Think of this like a friendly intake form, not a counseling session

CRITICAL: ASK ABOUT ALL CHILDREN UPFRONT
First question MUST be: "How many children do you have?"
- If 1 child: Gather info about that child
- If 2+ children: "I'll collect information about each child separately. Let's start with [first child's name]..."
- After finishing one child, ask: "Great! Now let's move on to [next child's name]..."

INFORMATION TO COLLECT (PER CHILD):

1. CHILD BASICS (1-2 exchanges):
   - Child's name (CRITICAL - always ask this first!)
   - Age or grade level
   - Has this child been diagnosed with ADHD? (yes/no/in-process/not-sure)
   - If yes: When diagnosed? By whom? Any other diagnoses?

2. MAIN CHALLENGES (1 exchange):
   - "What are your top 2-3 challenges with [child's name] right now?"
   - Listen for: homework, morning routine, emotional meltdowns, social issues, focus, behavior

3. SCHOOL SITUATION (1 exchange):
   - What type of school? (public/private/homeschool)
   - Any support? (IEP, 504 plan, accommodations)
   - How's the relationship with teachers?

4. TREATMENT & SUPPORT (1 exchange):
   - Is [child's name] on medication? (what medication, how long)
   - Any therapy or counseling?
   - Who else helps? (family, tutors, support groups)

5. FAMILY CONTEXT (1 exchange - AFTER collecting all children):
   - "Tell me briefly about your family setup - single parent? Co-parenting? Other support?"
   - Listen for: family structure, who lives at home, key support people

TOTAL TIME: 5-10 minutes (keep it moving!)

HOW TO STRUCTURE MULTI-CHILD DISCOVERY:
1. "How many children do you have?"
2. "Let's start with your oldest - what's their name?"
3. Collect all 4 categories for Child #1
4. "Thanks! Now let's talk about [Child #2's name]..."
5. Collect all 4 categories for Child #2
6. Repeat for each child
7. Ask about family context ONCE at the end
8. Brief summary: "Perfect! I've got [Child 1 name] (age X, diagnosed) and [Child 2 name] (age Y, exploring)..."
9. Use updateDiscoveryProfile tool to save ALL children

DISCOVERY PROGRESS TRACKING:
${context.discoveryProgress ? `
- Total exchanges so far: ${context.discoveryProgress.exchangeCount}
- Child basics collected: ${context.discoveryProgress.hasChildBasics ? 'Yes' : 'Not yet'}
- Diagnosis info: ${context.discoveryProgress.hasDiagnosis ? 'Yes' : 'Not yet'}
- Main challenges: ${context.discoveryProgress.hasChallenges ? 'Yes' : 'Not yet'}
- Family/school context: ${context.discoveryProgress.hasContext ? 'Yes' : 'Not yet'}
- Ready to complete: ${context.discoveryProgress.readyToComplete ? '⚠️ YES - MUST CALL updateDiscoveryProfile TOOL NOW' : 'No - continue gathering information'}
` : 'Just starting - ask how many children they have'}

${shouldAutoSave ? `
⚠️⚠️⚠️ MANDATORY ACTION ⚠️⚠️⚠️
You have collected ALL required information. You MUST now:
1. Review the conversation history above
2. Extract all child and family information
3. Call the updateDiscoveryProfile tool with the extracted data
4. Do NOT ask more questions - SAVE THE DATA NOW

Parse the conversation to find:
- Each child's name, age, diagnosis status, challenges, school info, medication/therapy
- Family context (co-parenting setup, support network)

Then immediately call updateDiscoveryProfile.
` : ''}

CRITICAL REMINDERS:
- This is DATA COLLECTION, not coaching - keep it brief and factual
- Always start by asking how many children they have
- Collect information for EACH child separately before moving to family context
- Don't validate, don't coach, don't give advice - just gather facts
- After collecting info on all children + family context, YOU MUST CALL updateDiscoveryProfile tool
- Move quickly - aim for 8-12 total exchanges depending on number of children
- Review conversation history to avoid re-asking questions
- When readyToComplete is true, STOP asking questions and CALL THE SAVE TOOL

TONE:
- Friendly and warm, but efficient
- Direct questions, brief responses
- "Got it!" "Perfect!" "Thanks!" to keep momentum
- Save the deep empathy for coaching sessions - this is setup only`,

      messages,

      tools: {
        updateDiscoveryProfile: tool({
          description: 'Save profile information for ALL children and family context. Use this after collecting information about each child separately. CRITICAL: You must collect data for EACH child before calling this tool.',
          inputSchema: z.object({
            children: z.array(z.object({
              childName: z.string().describe('Child\'s first name (REQUIRED)'),
              childAge: z.number().optional().describe('Child\'s age in years'),
              childAgeRange: z.string().optional().describe('Age range if exact age not provided (e.g., "7-9 years old")'),
              diagnosisStatus: z.enum(['diagnosed', 'suspected', 'exploring', 'not-adhd']).describe('ADHD diagnosis status'),
              diagnosisDetails: z.string().optional().describe('Details about diagnosis (when, by whom, subtype, comorbidities)'),
              mainChallenges: z.array(z.string()).describe('Top 2-5 challenges with this specific child'),
              schoolContext: z.string().optional().describe('School situation for this child (type, grade, IEP/504, teacher relationship)'),
              medicationStatus: z.string().optional().describe('Medication info for this child (what medication, dosage, effectiveness)'),
              therapyStatus: z.string().optional().describe('Therapy/counseling info for this child'),
            })).min(1).describe('Array of child profiles - one object per child'),

            familyContext: z.string().describe('Overall family situation (single parent, co-parenting, who lives at home, key support people)'),
            parentName: z.string().optional().describe('Parent\'s name if they shared it'),
            supportNetwork: z.array(z.string()).optional().describe('Family-level support (e.g., ["grandmother helps", "ADHD parent group", "school counselor"])'),
          }),
          execute: async (profile) => {
            try {
              console.log('[Discovery Agent] Saving profile for user:', context.userId);
              console.log(`[Discovery Agent] Number of children: ${profile.children.length}`);
              console.log('[Discovery Agent] Profile data:', JSON.stringify(profile, null, 2));

              // Create service client with admin permissions
              const supabase = createServiceClient();

              // Save each child as a separate row in child_profiles
              const childResults = [];
              for (let i = 0; i < profile.children.length; i++) {
                const child = profile.children[i];
                const isPrimary = i === 0; // First child is primary by default

                console.log(`[Discovery Agent] Inserting child ${i + 1}: ${child.childName}`);

                const { data: childData, error: childError } = await supabase
                  .from('child_profiles')
                  .insert({
                    user_id: context.userId,
                    child_name: child.childName,
                    child_age: child.childAge || null,
                    child_age_range: child.childAgeRange || (child.childAge ? `${child.childAge} years old` : null),
                    diagnosis_status: child.diagnosisStatus,
                    diagnosis_details: child.diagnosisDetails || null,
                    main_challenges: child.mainChallenges || [],
                    school_support_details: child.schoolContext || null,
                    medication_status: child.medicationStatus || null,
                    therapy_status: child.therapyStatus || null,
                    is_primary: isPrimary,
                    profile_complete: true,
                  })
                  .select()
                  .single();

                if (childError) {
                  console.error(`[Discovery Agent] Error saving child ${child.childName}:`, childError);
                  throw childError;
                }

                console.log(`[Discovery Agent] Saved child profile: ${child.childName} (primary: ${isPrimary})`);
                childResults.push({
                  name: child.childName,
                  age: child.childAge || child.childAgeRange,
                  status: child.diagnosisStatus,
                  id: childData.id
                });
              }

              // Update user_profiles table with parent-level and family-level data
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: context.userId,
                  parent_name: profile.parentName || null,
                  family_context: profile.familyContext,
                  support_network: profile.supportNetwork || [],
                  discovery_completed: true,
                  discovery_completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (profileError) {
                console.error('[Discovery Agent] Error saving parent profile:', profileError);
                throw profileError;
              }

              console.log('[Discovery Agent] Parent profile saved successfully');

              return {
                success: true,
                message: `Discovery completed! Saved profiles for ${profile.children.length} ${profile.children.length === 1 ? 'child' : 'children'}.`,
                profileSummary: {
                  childCount: profile.children.length,
                  children: childResults,
                  familyContext: profile.familyContext,
                  supportNetworkSize: profile.supportNetwork?.length || 0
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

    // Check if tool was executed successfully
    const toolResults = result.steps?.map(step => step.toolResults).flat().filter(Boolean) || [];
    const discoveryToolResult = toolResults.find((r: any) => r.toolName === 'updateDiscoveryProfile');

    // If tool executed but no text response, provide completion message
    let responseText = result.text;
    if (discoveryToolResult && !result.text) {
      const toolOutput = (discoveryToolResult as any).result;
      if (toolOutput?.success) {
        responseText = `Perfect! I've saved all the information about ${toolOutput.profileSummary?.children?.map((c: any) => c.name).join(' and ') || 'your children'}. Your profile is complete! 🎉\n\nYou can now start coaching sessions or explore other features.`;
      } else {
        responseText = `I tried to save your information but encountered an error: ${toolOutput?.error || 'Unknown error'}. Please try again or contact support.`;
      }
    }

    // Return in same format as proper-tools-agent for compatibility
    return {
      text: responseText,
      toolResults,
      usage: result.usage
    };
  };
};
