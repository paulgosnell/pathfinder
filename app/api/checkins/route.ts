import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';
import { saveCheckIn, getRecentCheckIns, calculateAverageScore } from '@/lib/database/checkins';
import { z } from 'zod';

// Validation schema for POST request
const checkInSchema = z.object({
  child_id: z.string().uuid('Invalid child_id format'),
  checkin_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  sleep_quality: z.number().int().min(1).max(10).nullable().optional(),
  attention_focus: z.number().int().min(1).max(10).nullable().optional(),
  emotional_regulation: z.number().int().min(1).max(10).nullable().optional(),
  behavior_quality: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').nullable().optional()
});

/**
 * GET /api/checkins?child_id=xxx&days=7
 * Fetch recent check-ins for a child
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('child_id');
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!childId) {
      return Response.json(
        { error: 'Missing required parameter: child_id' },
        { status: 400 }
      );
    }

    // Validate days parameter
    if (isNaN(days) || days < 1 || days > 365) {
      return Response.json(
        { error: 'Invalid days parameter. Must be between 1 and 365.' },
        { status: 400 }
      );
    }

    // Verify user owns this child
    const serviceClient = createServiceClient();
    const { data: childProfile, error: childError } = await serviceClient
      .from('child_profiles')
      .select('id, user_id')
      .eq('id', childId)
      .eq('user_id', user.id)
      .single();

    if (childError || !childProfile) {
      return Response.json(
        { error: 'Child not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch check-ins using service client
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    console.log('[GET /api/checkins] Fetching check-ins:', {
      childId,
      days,
      startDate: startDateStr,
      userId: user.id
    });

    const { data: checkIns, error: fetchError } = await serviceClient
      .from('daily_checkins')
      .select('*')
      .eq('child_id', childId)
      .gte('checkin_date', startDateStr)
      .order('checkin_date', { ascending: false });

    console.log('[GET /api/checkins] Query result:', {
      count: checkIns?.length || 0,
      error: fetchError,
      data: checkIns
    });

    if (fetchError) {
      console.error('Error fetching check-ins:', fetchError);
      return Response.json(
        { error: `Failed to fetch: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // Calculate basic stats
    const stats = calculateStats(checkIns || []);

    const response = {
      checkins: checkIns || [],
      stats,
      _debug: {
        childId,
        startDate: startDateStr,
        count: checkIns?.length || 0,
        hasData: !!(checkIns && checkIns.length > 0)
      }
    };

    console.log('[GET /api/checkins] Response:', JSON.stringify(response, null, 2));

    return Response.json(response);

  } catch (error) {
    console.error('GET /api/checkins error:', error);
    return Response.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/checkins
 * Create or update a check-in (upsert)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const parseResult = checkInSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        {
          error: 'Invalid request data',
          issues: parseResult.error.issues
        },
        { status: 400 }
      );
    }

    const { child_id, checkin_date, ...checkInFields } = parseResult.data;

    // Validate date is not in the future
    const today = new Date().toISOString().split('T')[0];
    if (checkin_date > today) {
      return Response.json(
        { error: 'Check-in date cannot be in the future' },
        { status: 400 }
      );
    }

    // Validate date is not more than 7 days in the past (as per spec)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    if (checkin_date < sevenDaysAgoStr) {
      return Response.json(
        { error: 'Check-in date cannot be more than 7 days in the past' },
        { status: 400 }
      );
    }

    // Ensure at least one dimension is filled
    const { sleep_quality, attention_focus, emotional_regulation, behavior_quality } = checkInFields;
    if (
      (sleep_quality === null || sleep_quality === undefined) &&
      (attention_focus === null || attention_focus === undefined) &&
      (emotional_regulation === null || emotional_regulation === undefined) &&
      (behavior_quality === null || behavior_quality === undefined)
    ) {
      return Response.json(
        { error: 'At least one dimension (sleep, attention, emotional, or behavior) must be filled' },
        { status: 400 }
      );
    }

    // Verify user owns this child
    const serviceClient = createServiceClient();
    const { data: childProfile, error: childError } = await serviceClient
      .from('child_profiles')
      .select('id, user_id')
      .eq('id', child_id)
      .eq('user_id', user.id)
      .single();

    if (childError || !childProfile) {
      return Response.json(
        { error: 'Child not found or access denied' },
        { status: 404 }
      );
    }

    // Save check-in (upsert) - use service client to bypass RLS
    const { data: savedCheckIn, error: saveError } = await serviceClient
      .from('daily_checkins')
      .upsert(
        {
          user_id: user.id,
          child_id,
          checkin_date,
          ...checkInFields,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'child_id,checkin_date'
        }
      )
      .select()
      .single();

    if (saveError) {
      console.error('Error saving check-in:', saveError);
      return Response.json(
        { error: `Failed to save: ${saveError.message}` },
        { status: 500 }
      );
    }

    return Response.json(
      {
        id: savedCheckIn.id,
        message: 'Check-in saved successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/checkins error:', error);
    return Response.json(
      { error: 'Failed to save check-in' },
      { status: 500 }
    );
  }
}

/**
 * Calculate basic statistics from check-ins
 */
function calculateStats(checkIns: any[]) {
  if (checkIns.length === 0) {
    return {
      averageScore: 0,
      trend: 'stable',
      dimensionAverages: {
        sleep: 0,
        attention: 0,
        emotional: 0,
        behavior: 0
      }
    };
  }

  // Calculate dimension averages
  const dimensionTotals = {
    sleep: { sum: 0, count: 0 },
    attention: { sum: 0, count: 0 },
    emotional: { sum: 0, count: 0 },
    behavior: { sum: 0, count: 0 }
  };

  let totalScore = 0;
  let totalCount = 0;

  checkIns.forEach(checkIn => {
    if (checkIn.sleep_quality !== null) {
      dimensionTotals.sleep.sum += checkIn.sleep_quality;
      dimensionTotals.sleep.count++;
      totalScore += checkIn.sleep_quality;
      totalCount++;
    }
    if (checkIn.attention_focus !== null) {
      dimensionTotals.attention.sum += checkIn.attention_focus;
      dimensionTotals.attention.count++;
      totalScore += checkIn.attention_focus;
      totalCount++;
    }
    if (checkIn.emotional_regulation !== null) {
      dimensionTotals.emotional.sum += checkIn.emotional_regulation;
      dimensionTotals.emotional.count++;
      totalScore += checkIn.emotional_regulation;
      totalCount++;
    }
    if (checkIn.behavior_quality !== null) {
      dimensionTotals.behavior.sum += checkIn.behavior_quality;
      dimensionTotals.behavior.count++;
      totalScore += checkIn.behavior_quality;
      totalCount++;
    }
  });

  const averageScore = totalCount > 0 ? Math.round((totalScore / totalCount) * 10) / 10 : 0;

  // Calculate trend (compare first half vs second half)
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (checkIns.length >= 4) {
    const midpoint = Math.floor(checkIns.length / 2);
    const recentCheckIns = checkIns.slice(0, midpoint);
    const olderCheckIns = checkIns.slice(midpoint);

    const recentAvg = recentCheckIns.reduce((sum, c) => sum + calculateAverageScore(c), 0) / recentCheckIns.length;
    const olderAvg = olderCheckIns.reduce((sum, c) => sum + calculateAverageScore(c), 0) / olderCheckIns.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) trend = 'improving';
    else if (change < -10) trend = 'declining';
  }

  return {
    averageScore,
    trend,
    dimensionAverages: {
      sleep: dimensionTotals.sleep.count > 0
        ? Math.round((dimensionTotals.sleep.sum / dimensionTotals.sleep.count) * 10) / 10
        : 0,
      attention: dimensionTotals.attention.count > 0
        ? Math.round((dimensionTotals.attention.sum / dimensionTotals.attention.count) * 10) / 10
        : 0,
      emotional: dimensionTotals.emotional.count > 0
        ? Math.round((dimensionTotals.emotional.sum / dimensionTotals.emotional.count) * 10) / 10
        : 0,
      behavior: dimensionTotals.behavior.count > 0
        ? Math.round((dimensionTotals.behavior.sum / dimensionTotals.behavior.count) * 10) / 10
        : 0
    }
  };
}
