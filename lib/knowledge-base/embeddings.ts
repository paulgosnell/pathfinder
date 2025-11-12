import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const EMBEDDING_MODEL = 'text-embedding-3-small'; // 1536 dimensions
const BATCH_SIZE = 100; // OpenAI supports up to 2048, but we'll be conservative

/**
 * Generate embedding for a single text chunk
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: text
  });

  return embedding;
}

/**
 * Generate embeddings for multiple chunks in batches
 * More efficient than one-at-a-time
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  // Process in batches to respect rate limits
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const { embeddings } = await embedMany({
      model: openai.embedding(EMBEDDING_MODEL),
      values: batch
    });

    allEmbeddings.push(...embeddings);

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allEmbeddings;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar chunks to a query (useful for testing)
 */
export async function findSimilarChunks(
  queryText: string,
  candidateTexts: string[],
  topK: number = 5
): Promise<Array<{ text: string; similarity: number; index: number }>> {
  const queryEmbedding = await generateEmbedding(queryText);
  const candidateEmbeddings = await generateBatchEmbeddings(candidateTexts);

  const similarities = candidateEmbeddings.map((embedding, index) => ({
    text: candidateTexts[index],
    similarity: cosineSimilarity(queryEmbedding, embedding),
    index
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
