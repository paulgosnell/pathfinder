import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface AgentContext {
  userId: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userProfile?: {
    childAgeRange?: string;
    commonTriggers?: string[];
    triedSolutions?: string[];
    successfulStrategies?: string[];
    failedStrategies?: string[];
    parentStressLevel?: string;
  };
}

export const createProperToolsAgent = () => {
  return async (message: string, context: AgentContext) => {
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
    console.log(`Sending ${messages.length} messages to AI (including current)`);
    if (messages.length > 1) {
      console.log(`History: ${messages.length - 1} previous messages`);
      console.log(`Context passed: ${context.conversationHistory?.length || 0} messages from DB`);
    } else {
      console.log(`No conversation history found`);
    }

    // Generate response using AI SDK
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.7,
      
      system: `You are an ADHD support coach for parents. You help with any ADHD-related parenting challenges they face.

CONVERSATIONAL APPROACH:
- Be conversational and responsive - listen to what they're telling you
- If they correct or clarify you, acknowledge and adapt immediately
- Don't assume you know their specific challenge - let them guide the conversation
- Ask relevant questions based on their actual situation
- Be warm and empathetic while staying practical and solution-focused
- NEVER repeat questions or give advice they've already rejected

CRITICAL - USE CONVERSATION HISTORY:
- You receive the FULL conversation history in the messages array above
- Before responding, review what they've already told you in previous messages
- Reference specific details: "Since you mentioned texture issues with your child..."
- Remember what strategies they've tried and rejected
- If they say "tried that too" - acknowledge and ask for more specific details about what didn't work

CONVERSATION FLOW:
- Start by understanding their specific ADHD parenting challenge
- Ask clarifying questions only when needed to understand their situation
- Once you understand their challenge, provide ONE specific, tailored strategy
- Keep responses focused and actionable - don't overwhelm with multiple options
- Reference details they've shared to show you're listening

HANDLING REJECTED STRATEGIES:
- When they say "tried that" or "no luck": Acknowledge immediately
- Ask what specifically didn't work: "What part didn't work for your situation?"
- Don't suggest similar approaches - ask for more details about their specific challenges
- Remember what they've already tried and avoid repeating those suggestions

INFORMATION GATHERING:
- Ask about what matters for their specific ADHD challenge
- Don't fixate on predetermined checklists - follow their lead
- One question at a time, and wait for their response
- Build context naturally through conversation

RESPONSE FORMAT - CRITICAL:
- Keep responses CONCISE and ACTIONABLE - no essays or walls of text
- When they say "tried that" or "no luck": Acknowledge and ask what specifically didn't work
- Give ONE specific strategy at a time, not multiple options
- Focus on THEIR specific situation, not generic advice
- If they've tried similar approaches, ask for details about what exactly failed
- Response should be 2-4 paragraphs maximum, not novel-length

STRATEGY FORMAT:
- Give ONE specific strategy tailored to their situation
- Make it practical with clear, step-by-step instructions (3-5 steps max)
- Reference their specific details for personalization
- Ask how it went after they try it, or ask for more details if needed

SAFETY FIRST:
- If you detect crisis situations, provide immediate emergency resources
- Emergency contacts: 999 (immediate danger), Samaritans 116 123 (24/7 support)

${context.userProfile ? `
PARENT CONTEXT:
- Child age: ${context.userProfile.childAgeRange || 'not specified'}
- Previous challenges: ${context.userProfile.commonTriggers?.join(', ') || 'still learning'}
- What they've tried: ${context.userProfile.triedSolutions?.join(', ') || 'none recorded'}
- What worked: ${context.userProfile.successfulStrategies?.join(', ') || 'none yet'}
- What didn't work: ${context.userProfile.failedStrategies?.join(', ') || 'none yet'}
` : ''}

Remember: Parents know their situation best. Trust their guidance and focus on their specific ADHD parenting challenge.`,

      messages: messages,
    });

    // Log token usage
    if (result.usage) {
      console.log(`💬 AI Response: ${result.usage.totalTokens} tokens`);
    }

    return result;
  };
};
