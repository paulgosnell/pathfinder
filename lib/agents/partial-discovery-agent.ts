import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';
import type { ProfileCompleteness } from '@/lib/profile/completeness';

export interface PartialDiscoveryContext {
  userId: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  profileCompleteness: ProfileCompleteness;
  existingUserProfile: any; // From user_profiles table
  existingChildProfiles: any[]; // From child_profiles table
}

/**
 * Partial Discovery Agent - Resume Incomplete Discovery
 *
 * Purpose: Continue discovery session by asking ONLY for missing information.
 * This agent is used when a user has partial profile data (0% < completeness < 100%).
 *
 * Unlike the full discovery agent which starts from scratch, this agent:
 * - Reviews what data is already collected
 * - Asks targeted questions ONLY for missing fields
 * - Updates existing database records instead of creating duplicates
 *
 * Example: If user has child name/age but missing school info and treatment info,
 * this agent will start with: "I see you already told me about [child name].
 * Let me ask a couple more questions to complete your profile..."
 */
export const createPartialDiscoveryAgent = () => {
  return async (message: string, context: PartialDiscoveryContext) => {
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
    console.log(`[Partial Discovery Agent] Processing message ${messages.length}`);
    console.log(`[Partial Discovery Agent] Completeness: ${context.profileCompleteness.completionPercentage}%`);
    console.log(`[Partial Discovery Agent] Missing fields:`, context.profileCompleteness.missingFields);
    console.log(`[Partial Discovery Agent] Existing children:`, context.existingChildProfiles.length);

    // Determine if we should auto-save (collected all missing fields)
    const exchangeCount = context.conversationHistory?.filter(m => m.role === 'assistant').length || 0;
    const shouldAutoSave = exchangeCount >= 3 && context.profileCompleteness.missingFields.length <= 1;

    // Build context about what we already have
    const existingDataSummary = buildExistingDataSummary(
      context.existingUserProfile,
      context.existingChildProfiles,
      context.profileCompleteness
    );

    // Generate response using AI SDK
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.7,

      system: `You are continuing a discovery session by collecting ONLY the missing information.

${shouldAutoSave ? `
🚨 CRITICAL ACTION REQUIRED 🚨
You have collected the missing information. You MUST call the updatePartialDiscoveryProfile tool NOW to save the data.
After the user's next response, immediately call the tool with all collected information.
` : ''}

CONTEXT - PARTIAL DISCOVERY RESUME:
This user started discovery previously but didn't complete it. Their profile is ${context.profileCompleteness.completionPercentage}% complete.

WHAT WE ALREADY HAVE:
${existingDataSummary}

WHAT WE STILL NEED:
${context.profileCompleteness.missingFields.join('\n')}

YOUR ROLE - EFFICIENT FOLLOW-UP:
- Start by acknowledging what you already know: "I see you already told me about [child name]. Let me get the remaining information..."
- Ask ONLY about the missing fields listed above
- Keep it brief and focused - we're finishing up, not starting over
- DO NOT re-ask for information we already have
- Move quickly through missing fields (2-4 exchanges max)

APPROACH FOR EACH MISSING FIELD TYPE:

${!context.profileCompleteness.hasParentInfo ? `
MISSING: Parent Information
→ Ask: "What's your first name? And tell me briefly about your family setup - are you single parenting, co-parenting, or something else?"
` : ''}

${!context.profileCompleteness.hasChildren ? `
MISSING: Child Profiles
→ Ask: "How many children do you have? Let's start with the first one - what's their name and age?"
` : ''}

${!context.profileCompleteness.hasChildDetails ? `
MISSING: Child Details (age, challenges, strengths)
→ Ask: "What are the top 2-3 challenges you're facing with ${context.existingChildProfiles[0]?.child_name || 'your child'}? And what are some of their strengths?"
→ If missing age: "How old is ${context.existingChildProfiles[0]?.child_name || 'your child'}?"
` : ''}

${!context.profileCompleteness.hasSchoolInfo ? `
MISSING: School Information
→ Ask: "Tell me about ${context.existingChildProfiles[0]?.child_name || 'your child'}'s school - what type of school and what grade? Do they have any support like an IEP or 504 plan?"
` : ''}

${!context.profileCompleteness.hasTreatmentInfo ? `
MISSING: Treatment Information
→ Ask: "Is ${context.existingChildProfiles[0]?.child_name || 'your child'} on any medication for ADHD? Are they working with a therapist or counselor?"
` : ''}

CONVERSATION PACING:
- Exchange count: ${exchangeCount}
- Target: 2-4 exchanges to complete
- After collecting all missing fields, CALL updatePartialDiscoveryProfile tool

${shouldAutoSave ? `
⚠️⚠️⚠️ MANDATORY ACTION ⚠️⚠️⚠️
You have collected ALL missing information. You MUST now:
1. Review the conversation history above
2. Extract the NEW information provided
3. Call the updatePartialDiscoveryProfile tool with ONLY the new data
4. Do NOT ask more questions - SAVE THE DATA NOW
` : ''}

CRITICAL REMINDERS:
- This is RESUME mode, not START mode - acknowledge what we already have
- Ask ONLY about missing fields - don't re-ask questions
- Keep it brief and efficient (user already started this process once)
- When ready, call updatePartialDiscoveryProfile to UPDATE existing records
- DO NOT create duplicate child profiles - we're updating existing ones

TONE:
- "I see you already told me about [name]..."
- "Just a couple more quick questions to complete your profile..."
- "Almost done! Let me get..."
- Efficient and appreciative of their time`,

      messages,

      tools: {
        updatePartialDiscoveryProfile: tool({
          description: 'Update existing profile with missing information. Only provide fields that are NEW - do not repeat existing data.',
          inputSchema: z.object({
            // Parent-level updates
            parentName: z.string().optional().describe('Parent\'s name if newly provided'),
            familyContext: z.string().optional().describe('Family setup if newly provided or updated'),
            supportNetwork: z.array(z.string()).optional().describe('Support network if newly provided'),

            // Child profile updates (keyed by child_name to match existing records)
            childUpdates: z.array(z.object({
              childName: z.string().describe('Child\'s name (must match existing record)'),
              childAge: z.number().optional().describe('Age if newly provided'),
              childAgeRange: z.string().optional().describe('Age range if newly provided'),
              mainChallenges: z.array(z.string()).optional().describe('Challenges if newly provided'),
              strengths: z.array(z.string()).optional().describe('Strengths if newly provided'),
              schoolType: z.string().optional().describe('School type if newly provided'),
              gradeLevel: z.string().optional().describe('Grade level if newly provided'),
              hasIEP: z.boolean().optional().describe('IEP status if newly provided'),
              has504Plan: z.boolean().optional().describe('504 plan status if newly provided'),
              medicationStatus: z.string().optional().describe('Medication if newly provided'),
              therapyStatus: z.string().optional().describe('Therapy if newly provided'),
            })).optional().describe('Updates for existing child profiles'),
          }),
          execute: async (updates) => {
            try {
              console.log('[Partial Discovery Agent] Updating profile for user:', context.userId);
              console.log('[Partial Discovery Agent] Updates:', JSON.stringify(updates, null, 2));

              const supabase = createServiceClient();

              // Update parent profile if any parent-level data provided
              if (updates.parentName || updates.familyContext || updates.supportNetwork) {
                const parentUpdates: any = {
                  user_id: context.userId,
                  updated_at: new Date().toISOString()
                };

                if (updates.parentName) parentUpdates.parent_name = updates.parentName;
                if (updates.familyContext) parentUpdates.family_context = updates.familyContext;
                if (updates.supportNetwork) parentUpdates.support_network = updates.supportNetwork;

                // Check if profile needs discovery_completed flag set
                // We'll set it to true if this update brings completeness to 100%
                const willBeComplete = context.profileCompleteness.completionPercentage >= 80; // threshold
                if (willBeComplete) {
                  parentUpdates.discovery_completed = true;
                  parentUpdates.discovery_completed_at = new Date().toISOString();
                }

                const { error: profileError } = await supabase
                  .from('user_profiles')
                  .upsert(parentUpdates, { onConflict: 'user_id' });

                if (profileError) {
                  console.error('[Partial Discovery Agent] Error updating parent profile:', profileError);
                  throw profileError;
                }

                console.log('[Partial Discovery Agent] Parent profile updated');
              }

              // Update child profiles
              const childUpdateResults = [];
              if (updates.childUpdates && updates.childUpdates.length > 0) {
                for (const childUpdate of updates.childUpdates) {
                  // Find existing child by name
                  const existingChild = context.existingChildProfiles.find(
                    c => c.child_name.toLowerCase() === childUpdate.childName.toLowerCase()
                  );

                  if (!existingChild) {
                    console.warn(`[Partial Discovery Agent] Child not found: ${childUpdate.childName}`);
                    continue;
                  }

                  // Build update object with only provided fields
                  const childUpdates: any = {
                    updated_at: new Date().toISOString()
                  };

                  if (childUpdate.childAge) childUpdates.child_age = childUpdate.childAge;
                  if (childUpdate.childAgeRange) childUpdates.child_age_range = childUpdate.childAgeRange;
                  if (childUpdate.mainChallenges) childUpdates.main_challenges = childUpdate.mainChallenges;
                  if (childUpdate.strengths) childUpdates.strengths = childUpdate.strengths;
                  if (childUpdate.schoolType) childUpdates.school_type = childUpdate.schoolType;
                  if (childUpdate.gradeLevel) childUpdates.grade_level = childUpdate.gradeLevel;
                  if (childUpdate.hasIEP !== undefined) childUpdates.has_iep = childUpdate.hasIEP;
                  if (childUpdate.has504Plan !== undefined) childUpdates.has_504_plan = childUpdate.has504Plan;
                  if (childUpdate.medicationStatus) childUpdates.medication_status = childUpdate.medicationStatus;
                  if (childUpdate.therapyStatus) childUpdates.therapy_status = childUpdate.therapyStatus;

                  // Mark profile as complete if we have essential data
                  const hasEssentials =
                    (existingChild.child_age || childUpdate.childAge) &&
                    ((existingChild.main_challenges?.length ?? 0) > 0 || (childUpdate.mainChallenges?.length ?? 0) > 0) &&
                    (existingChild.school_type || childUpdate.schoolType);

                  if (hasEssentials) {
                    childUpdates.profile_complete = true;
                  }

                  const { error: childError } = await supabase
                    .from('child_profiles')
                    .update(childUpdates)
                    .eq('id', existingChild.id);

                  if (childError) {
                    console.error(`[Partial Discovery Agent] Error updating child ${childUpdate.childName}:`, childError);
                    throw childError;
                  }

                  console.log(`[Partial Discovery Agent] Updated child profile: ${childUpdate.childName}`);
                  childUpdateResults.push({
                    name: childUpdate.childName,
                    updated: true
                  });
                }
              }

              return {
                success: true,
                message: `Profile updated successfully! ${childUpdateResults.length > 0 ? `Updated info for ${childUpdateResults.map(c => c.name).join(', ')}.` : ''}`,
                updateSummary: {
                  parentUpdated: !!(updates.parentName || updates.familyContext || updates.supportNetwork),
                  childrenUpdated: childUpdateResults.length,
                  children: childUpdateResults
                }
              };
            } catch (error) {
              console.error('[Partial Discovery Agent] Failed to update profile:', error);
              return {
                success: false,
                message: 'Failed to update profile',
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          }
        }),
      },
    });

    // Check if tool was executed successfully
    const toolResults = result.steps?.map(step => step.toolResults).flat().filter(Boolean) || [];
    const updateToolResult = toolResults.find((r: any) => r.toolName === 'updatePartialDiscoveryProfile');

    // If tool executed but no text response, provide completion message
    let responseText = result.text;
    if (updateToolResult && !result.text) {
      const toolOutput = (updateToolResult as any).result;
      if (toolOutput?.success) {
        responseText = `Perfect! Your profile is now complete. 🎉\n\nI've saved all the information and I'm ready to support you in coaching sessions whenever you need.`;
      } else {
        responseText = `I tried to update your profile but encountered an error: ${toolOutput?.error || 'Unknown error'}. Please try again or contact support.`;
      }
    }

    return {
      text: responseText,
      toolResults,
      usage: result.usage
    };
  };
};

/**
 * Build a human-readable summary of existing data
 */
function buildExistingDataSummary(
  userProfile: any,
  childProfiles: any[],
  completeness: ProfileCompleteness
): string {
  const lines: string[] = [];

  if (completeness.hasParentInfo && userProfile) {
    lines.push(`✅ Parent info: ${userProfile.parent_name || 'Name on file'}${userProfile.family_context ? `, ${userProfile.family_context}` : ''}`);
  }

  if (completeness.hasChildren && childProfiles.length > 0) {
    for (const child of childProfiles) {
      const details = [];
      if (child.child_age) details.push(`age ${child.child_age}`);
      if (child.diagnosis_status) details.push(child.diagnosis_status);
      lines.push(`✅ Child: ${child.child_name}${details.length > 0 ? ` (${details.join(', ')})` : ''}`);
    }
  }

  if (completeness.hasChildDetails && childProfiles.length > 0) {
    const child = childProfiles[0];
    if (child.main_challenges?.length > 0) {
      lines.push(`✅ Challenges: ${child.main_challenges.slice(0, 2).join(', ')}`);
    }
    if (child.strengths?.length > 0) {
      lines.push(`✅ Strengths: ${child.strengths.slice(0, 2).join(', ')}`);
    }
  }

  if (completeness.hasSchoolInfo && childProfiles.length > 0) {
    const child = childProfiles[0];
    lines.push(`✅ School: ${child.school_type || 'Info on file'}${child.grade_level ? `, grade ${child.grade_level}` : ''}`);
  }

  if (completeness.hasTreatmentInfo && childProfiles.length > 0) {
    const child = childProfiles[0];
    if (child.medication_status) lines.push(`✅ Medication: ${child.medication_status}`);
    if (child.therapy_status) lines.push(`✅ Therapy: ${child.therapy_status}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'No existing data found';
}
