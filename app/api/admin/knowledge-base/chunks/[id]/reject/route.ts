import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  context: any
) {
  const { params } = context as { params: { id: string } };
  try {
    const supabase = getSupabaseAdmin();
    const chunkId = params.id;
    const { reason } = await request.json();

    // Update chunk status to rejected
    const { error: updateError } = await supabase
      .from('knowledge_base')
      .update({
        quality_status: 'rejected',
        review_notes: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', chunkId);

    if (updateError) {
      console.error('Failed to reject chunk:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject chunk' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Reject endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to reject chunk', details: error.message },
      { status: 500 }
    );
  }
}
