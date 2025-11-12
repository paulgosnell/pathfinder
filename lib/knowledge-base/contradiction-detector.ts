import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const contradictionSchema = z.object({
  hasContradiction: z.boolean(),
  contradictions: z.array(z.object({
    topic: z.string(),
    newChunkAdvice: z.string(),
    existingChunkAdvice: z.string(),
    severity: z.enum(['minor', 'moderate', 'major']),
    explanation: z.string(),
    recommendation: z.string()
  }))
});

export type ContradictionResult = z.infer<typeof contradictionSchema>;

/**
 * Detect contradictions between new content and existing knowledge base
 */
export async function detectContradictions(
  newChunkText: string,
  similarExistingChunks: Array<{ text: string; source: string }>
): Promise<ContradictionResult> {
  if (similarExistingChunks.length === 0) {
    return {
      hasContradiction: false,
      contradictions: []
    };
  }

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: contradictionSchema,
    prompt: `You are a clinical expert reviewing ADHD guidance for contradictions.

# Task
Compare new content against existing knowledge base chunks to identify conflicting advice.

# New Content
${newChunkText}

# Existing Knowledge Base
${similarExistingChunks.map((chunk, i) => `
[Chunk ${i + 1}] Source: ${chunk.source}
${chunk.text}
`).join('\n\n')}

# Analysis Instructions
Look for contradictions in:
- Treatment approaches
- Strategy recommendations
- Clinical guidance
- Safety considerations

Severity levels:
- **Minor**: Different approaches that are both valid
- **Moderate**: Conflicting advice that could confuse parents
- **Major**: Contradictory guidance on safety or clinical issues

For each contradiction, recommend:
- Keep new (if it's more current/accurate)
- Keep existing (if new is outdated/incorrect)
- Flag for expert review (if both have merit)
- Synthesize both perspectives

Identify any contradictions and explain them clearly.`
  });

  return object;
}

/**
 * Find chunks in KB that might contradict new content
 * Uses semantic search to find topically similar content
 */
export async function findPotentialContradictions(
  supabase: any,
  newChunkEmbedding: number[],
  topicTags: string[]
): Promise<Array<{ id: string; text: string; source: string; similarity: number }>> {
  const { data, error } = await supabase.rpc('search_knowledge_base', {
    query_embedding: newChunkEmbedding,
    match_threshold: 0.7, // Lower threshold to catch potential contradictions
    match_count: 10,
    filter_tags: topicTags
  });

  if (error) {
    console.error('Error searching for contradictions:', error);
    return [];
  }

  return data || [];
}
