import { createServerClient } from '@/lib/supabase/server-client';
import { generateEmbedding } from './embeddings';

export interface SearchFilters {
  topic_tags?: string[];
  age_relevance?: string[];
  diagnosis_relevance?: string[];
  content_type?: string;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  filters?: SearchFilters;
}

export interface KnowledgeChunk {
  id: string;
  chunk_text: string;
  source_document_name: string;
  source_url: string;
  topic_tags: string[];
  age_relevance: string[];
  content_type: string;
  confidence_score: number;
  similarity: number;
}

/**
 * Search knowledge base with semantic similarity
 */
export async function searchKnowledgeBase(
  query: string,
  options: SearchOptions = {}
): Promise<KnowledgeChunk[]> {
  const {
    limit = 5,
    threshold = 0.75,
    filters = {}
  } = options;

  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search via RPC function
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_tags: filters.topic_tags || null,
      filter_age_relevance: filters.age_relevance || null
    });

    if (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Knowledge base search failed:', error);
    return [];
  }
}

/**
 * Extract topics from user message for better filtering
 */
export function extractTopics(message: string): string[] {
  const topicKeywords = {
    eating: ['eat', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'snack'],
    sleep: ['sleep', 'bedtime', 'tired', 'nap', 'wake', 'insomnia'],
    school: ['school', 'teacher', 'homework', 'class', 'grade'],
    medication: ['medication', 'meds', 'pill', 'dose', 'prescription'],
    behavior: ['behavior', 'tantrum', 'meltdown', 'aggression', 'defiance'],
    social: ['friend', 'social', 'peer', 'play', 'relationship']
  };

  const lowerMessage = message.toLowerCase();
  const detectedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
}
