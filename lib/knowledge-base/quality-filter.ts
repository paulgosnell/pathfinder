import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const qualityCheckSchema = z.object({
  shouldInclude: z.boolean(),
  confidenceScore: z.number().min(0).max(1),
  reasoning: z.string(),
  qualityIssues: z.array(z.string()),
  valuableInsights: z.array(z.string()),
  contradictions: z.array(z.object({
    topic: z.string(),
    conflictsWith: z.string()
  })),
  recommendedTags: z.array(z.string()),
  ageRelevance: z.array(z.enum(['toddler', 'primary', 'secondary', 'teen', 'all'])),
  diagnosisRelevance: z.array(z.enum(['ADHD', 'ASD', 'both', 'general'])),
  contentType: z.enum(['research', 'clinical_guidance', 'practical_tips', 'case_study', 'general'])
});

export type QualityCheckResult = z.infer<typeof qualityCheckSchema>;

/**
 * CRITICAL: AI evaluates content quality before adding to knowledge base
 *
 * This prevents dilution of high-quality guidance with generic advice
 */
export async function evaluateContentQuality(
  text: string,
  sourceContext?: string
): Promise<QualityCheckResult> {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: qualityCheckSchema,
    prompt: `You are a clinical expert evaluating content for an ADHD parent coaching system.

# Your Mission
Determine if this content should be included in a knowledge base used to guide parents of children with ADHD.

# Evaluation Criteria

## INCLUDE content that:
✅ Provides specific, actionable strategies
✅ Is backed by research or expert clinical experience
✅ Addresses real ADHD-specific challenges (not generic parenting)
✅ Offers empowering, strength-based perspectives
✅ Acknowledges ADHD as a neurological difference (not a character flaw)
✅ Provides practical implementation steps
✅ Considers different ages and developmental stages

## EXCLUDE content that:
❌ Gives generic "try harder" or "just be consistent" advice without ADHD-specific adaptations
❌ Contradicts established ADHD research
❌ Promotes harmful practices (withholding food, excessive punishment, etc.)
❌ Blames parents or children for ADHD behaviors
❌ Is vague or unhelpful ("communicate better", "be patient")
❌ Would dilute high-quality guidance
❌ Lacks specificity or actionable steps

# Confidence Scoring
- **0.9-1.0**: Excellent research-backed, specific guidance
- **0.7-0.89**: Good practical advice, some ADHD specificity
- **0.5-0.69**: Acceptable but generic, flag for review
- **0.3-0.49**: Questionable quality, likely exclude
- **0.0-0.29**: Poor quality, definitely exclude

# Content to Evaluate
${sourceContext ? `Source: ${sourceContext}\n\n` : ''}${text}

Provide structured assessment with reasoning.`
  });

  return object;
}

/**
 * Batch evaluate multiple chunks efficiently
 */
export async function batchEvaluateQuality(
  chunks: Array<{ text: string; index: number }>,
  sourceContext?: string
): Promise<Array<QualityCheckResult & { chunkIndex: number }>> {
  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  const results: Array<QualityCheckResult & { chunkIndex: number }> = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async chunk => {
        const result = await evaluateContentQuality(chunk.text, sourceContext);
        return { ...result, chunkIndex: chunk.index };
      })
    );
    results.push(...batchResults);
  }

  return results;
}
