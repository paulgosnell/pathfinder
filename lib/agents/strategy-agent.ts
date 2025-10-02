import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const strategySchema = z.object({
  title: z.string(),
  description: z.string(),
  implementation: z.array(z.string()),
  timeframe: z.string(),
  ageAppropriate: z.boolean(),
  difficultyLevel: z.enum(['easy', 'moderate', 'challenging']),
  evidenceLevel: z.enum(['research-backed', 'clinical-practice', 'parent-tested'])
});

export const createStrategyAgent = () => {
  return async (challenge: string, childContext: any) => {
    const result = await generateObject({
      model: openai('gpt-4'),
      system: `You are an ADHD strategy specialist. Provide evidence-based, practical interventions for specific parenting challenges.
      
      Focus on:
      - Strategies proven effective for ADHD
      - Age-appropriate implementations  
      - Clear, actionable steps
      - Realistic expectations for overwhelmed parents`,

      messages: [
        {
          role: 'user', 
          content: `Challenge: ${challenge}\nChild context: ${JSON.stringify(childContext)}`
        }
      ],

      schema: z.object({
        primaryStrategies: z.array(strategySchema),
        backupOptions: z.array(strategySchema),
        warningFlags: z.array(z.string()).describe('When to seek professional help'),
        implementationTips: z.array(z.string()),
        successIndicators: z.array(z.string())
      })
    });

    return result.object;
  };
};