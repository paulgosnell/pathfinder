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

    // Fetch positive feedback (rating >= 8) for the testimonials wall
    const { data: testimonials, error } = await supabase
      .from('user_feedback')
      .select('id, rating, feedback_text, context, page_url, submitted_at')
      .gte('rating', 8)
      .order('rating', { ascending: false })
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[Admin] Error fetching testimonials:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch testimonials',
          details: error.message || 'Unknown error',
          testimonials: []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      testimonials: testimonials || []
    });
  } catch (error: any) {
    console.error('[Admin] Error in testimonials API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch testimonials',
        details: error?.message || String(error),
        testimonials: []
      },
      { status: 500 }
    );
  }
}
