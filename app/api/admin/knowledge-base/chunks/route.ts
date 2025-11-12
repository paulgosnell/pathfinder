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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'approved';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get knowledge base chunks
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('quality_status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch chunks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chunks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ chunks: data || [] });

  } catch (error: any) {
    console.error('Chunks endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chunks', details: error.message },
      { status: 500 }
    );
  }
}
