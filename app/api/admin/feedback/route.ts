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

    // Fetch all feedback with user info and session info
    const { data: feedback, error } = await supabase
      .from('user_feedback')
      .select(`
        *,
        user:users(id, created_at),
        session:agent_sessions(id, mode, session_type, started_at)
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[Admin] Error fetching feedback:', error);
      throw error;
    }

    // Calculate aggregate stats
    const totalFeedback = feedback?.length || 0;
    const avgRating = totalFeedback > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
      : '0.0';

    // Rating distribution
    const ratingDistribution = {
      low: feedback?.filter(f => f.rating >= 1 && f.rating <= 3).length || 0,
      medium: feedback?.filter(f => f.rating >= 4 && f.rating <= 6).length || 0,
      high: feedback?.filter(f => f.rating >= 7 && f.rating <= 8).length || 0,
      excellent: feedback?.filter(f => f.rating >= 9 && f.rating <= 10).length || 0,
    };

    // Latest feedback timestamp
    const latestFeedback = feedback?.[0]?.submitted_at || null;

    // Get total sessions for response rate calculation
    const { data: sessions } = await supabase
      .from('agent_sessions')
      .select('id');

    const totalSessions = sessions?.length || 0;
    const responseRate = totalSessions > 0
      ? Math.round((totalFeedback / totalSessions) * 100)
      : 0;

    return NextResponse.json({
      feedback: feedback || [],
      stats: {
        totalFeedback,
        avgRating: parseFloat(avgRating),
        ratingDistribution,
        latestFeedback,
        responseRate,
        totalSessions
      }
    });
  } catch (error) {
    console.error('[Admin] Error in feedback API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback data' },
      { status: 500 }
    );
  }
}
