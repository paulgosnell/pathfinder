import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { sessionManager } from '@/lib/session/manager';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { scheduledFor, timeBudgetMinutes } = body;

    // Validate required fields
    if (!scheduledFor || !timeBudgetMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields: scheduledFor and timeBudgetMinutes' },
        { status: 400 }
      );
    }

    // Validate time budget
    if (![30, 50].includes(timeBudgetMinutes)) {
      return NextResponse.json(
        { error: 'Time budget must be 30 or 50 minutes' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    const now = new Date();

    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Create scheduled session using sessionManager
    const session = await sessionManager.createSession(
      user.id,
      'coaching', // Always coaching mode for scheduled sessions
      timeBudgetMinutes,
      scheduledDate // This sets status to 'scheduled'
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      scheduledFor: session.scheduledFor,
      timeBudgetMinutes: session.timeBudgetMinutes,
      status: session.status
    });

  } catch (error) {
    console.error('Error creating scheduled session:', error);
    return NextResponse.json(
      { error: 'Failed to schedule session' },
      { status: 500 }
    );
  }
}
