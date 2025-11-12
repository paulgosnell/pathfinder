import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/knowledge-base/embeddings';

// Create server-side client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      filters = {},
      limit = 5,
      threshold = 0.75
    } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search knowledge base
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: threshold,
      match_count: limit,
      filter_tags: filters.topic_tags || null,
      filter_age_relevance: filters.age_relevance || null
    });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({
      results: data || [],
      query,
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('Search endpoint error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}
