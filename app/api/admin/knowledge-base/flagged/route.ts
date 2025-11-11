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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Get all flagged chunks that need review
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('quality_status', 'flagged')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch flagged chunks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch flagged chunks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ flagged: data || [] });

  } catch (error: any) {
    console.error('Flagged endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flagged chunks', details: error.message },
      { status: 500 }
    );
  }
}
