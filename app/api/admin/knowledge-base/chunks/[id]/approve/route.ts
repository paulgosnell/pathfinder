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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const chunkId = params.id;

    // Get the chunk
    const { data: chunk, error: fetchError } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', chunkId)
      .single();

    if (fetchError || !chunk) {
      return NextResponse.json({ error: 'Chunk not found' }, { status: 404 });
    }

    // Generate embedding if it doesn't exist
    let embedding = chunk.embedding;
    if (!embedding) {
      const embeddingArray = await generateEmbedding(chunk.chunk_text);
      embedding = `[${embeddingArray.join(',')}]`;
    }

    // Update chunk status to approved
    const { error: updateError } = await supabase
      .from('knowledge_base')
      .update({
        quality_status: 'approved',
        embedding: embedding,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', chunkId);

    if (updateError) {
      console.error('Failed to approve chunk:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve chunk' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Approve endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to approve chunk', details: error.message },
      { status: 500 }
    );
  }
}
