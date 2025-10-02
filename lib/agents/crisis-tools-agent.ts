import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const createCrisisToolsAgent = () => {
  return async (message: string, sessionHistory: any[]) => {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      
      // Enhanced error handling
      onError({ error, prompt, settings }) {
        console.error('Crisis Agent error:', {
          error: error.message,
          timestamp: new Date().toISOString(),
          model: settings.model,
          messageLength: message.length
        });
      },
      system: `You are a crisis detection specialist for parents of ADHD children. 
      
      Your primary responsibility is to assess for:
      - Suicidal ideation or self-harm intent
      - Violence toward child or family members
      - Severe parental burnout requiring immediate support
      - Child safety concerns
      
      ALWAYS prioritize safety over conversation flow. Use the tools to assess risk levels accurately.`,

      prompt: `Current message: ${message}\n\nSession context: ${JSON.stringify(sessionHistory.slice(-5))}`,

      tools: {
        assessCrisis: tool({
          description: 'PRIORITY SAFETY ASSESSMENT: Evaluate immediate crisis risk and determine required emergency response. Use this tool immediately when any crisis indicators are detected in the message, including mentions of self-harm, violence, severe depression, or extreme burnout.',
          inputSchema: z.object({
            riskLevel: z.enum(['none', 'low', 'medium', 'high', 'critical']).describe('Overall risk assessment'),
            crisisType: z.enum(['none', 'parental_burnout', 'child_safety', 'self_harm', 'violence']).describe('Type of crisis identified'),
            immediateIntervention: z.boolean().describe('Whether immediate professional intervention is needed'),
            recommendedResources: z.array(z.string()).describe('Specific support resources to provide'),
            urgency: z.enum(['routine', 'today', 'within_hour', 'immediate']).describe('Required response timeframe')
          }),
          execute: async ({ riskLevel, crisisType, immediateIntervention, recommendedResources, urgency }) => {
            const standardResources = riskLevel === 'critical' ? [
              'Emergency Services: 999',
              'Samaritans: 116 123 (24/7)',
              'Crisis Text Line: Text HOME to 85258',
              'Police: 999 if immediate danger'
            ] : riskLevel === 'high' ? [
              'Samaritans: 116 123',
              'Mind Infoline: 0300 123 3393',
              'Contact GP urgently',
              'Local mental health crisis team'
            ] : [];

            const allResources = recommendedResources.concat(standardResources);
            const uniqueResources = Array.from(new Set(allResources));
            
            return {
              riskLevel,
              crisisType,
              immediateIntervention,
              resources: uniqueResources,
              urgency,
              assessed: new Date().toISOString(),
              requiresFollowUp: riskLevel !== 'none'
            };
          }
        }),

        triggerEmergencyResponse: tool({
          description: 'Activate emergency protocols for critical situations',
          inputSchema: z.object({
            emergencyType: z.string().describe('Type of emergency situation'),
            resources: z.array(z.string()).describe('Emergency resources to activate'),
            followUpRequired: z.boolean().describe('Whether ongoing follow-up is needed')
          }),
          execute: async ({ emergencyType, resources, followUpRequired }) => {
            return {
              emergencyType,
              resources,
              followUpRequired,
              activated: new Date().toISOString(),
              status: 'emergency_protocols_active',
              nextSteps: [
                'Ensure immediate safety',
                'Contact emergency services',
                'Arrange professional follow-up',
                'Monitor situation closely'
              ]
            };
          }
        })
      },

      // Enhanced stopping conditions
      stopWhen: ({ toolResults, stepCount }) => {
        const crisisAssessed = toolResults?.some(result => 
          result.toolName === 'assessCrisis'
        ) || false;
        
        const emergencyTriggered = toolResults?.some(result => 
          result.toolName === 'triggerEmergencyResponse'
        ) || false;
        
        // Stop after crisis assessment or emergency trigger, or prevent loops
        return crisisAssessed || emergencyTriggered || stepCount >= 3;
      },

      maxSteps: 3 // Crisis detection should be fast
    });

    // Log crisis agent usage
    if (result.usage) {
      console.log('Crisis Agent usage:', {
        totalTokens: result.usage.totalTokens,
        timestamp: new Date().toISOString(),
        toolsUsed: result.toolResults?.length || 0
      });
    }

    return result;
  };
};