import { supabase, DailyCheckIn } from '@/lib/supabase/client';

/**
 * Get today's check-in for a child (if exists)
 *
 * @param childId - UUID of the child
 * @returns DailyCheckIn object or null if no check-in exists for today
 * @throws Error if database query fails
 */
export async function getTodayCheckIn(
  childId: string
): Promise<DailyCheckIn | null> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('child_id', childId)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Save check-in (upsert - creates new or updates existing)
 *
 * Uses Postgres UPSERT on (child_id, checkin_date) unique constraint.
 * If a check-in already exists for this child and date, it will be updated.
 *
 * @param checkInData - Partial DailyCheckIn data (must include child_id, user_id, checkin_date)
 * @returns Created or updated DailyCheckIn object
 * @throws Error if database operation fails
 */
export async function saveCheckIn(
  checkInData: Partial<DailyCheckIn> & {
    user_id: string;
    child_id: string;
    checkin_date: string;
  }
): Promise<DailyCheckIn> {
  console.log('[saveCheckIn] Attempting to save:', checkInData);

  // Let RLS handle auth - it checks auth.uid() = user_id
  const { data, error } = await supabase
    .from('daily_checkins')
    .upsert(
      {
        ...checkInData,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'child_id,checkin_date'
      }
    )
    .select()
    .single();

  if (error) {
    console.error('[saveCheckIn] Supabase error:', error);
    console.error('[saveCheckIn] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to save check-in: ${error.message || JSON.stringify(error)}`);
  }

  if (!data) {
    throw new Error('No data returned from check-in save operation');
  }

  console.log('[saveCheckIn] Successfully saved:', data);
  return data;
}

/**
 * Get last N days of check-ins for a child
 *
 * @param childId - UUID of the child
 * @param days - Number of days to fetch (default: 7)
 * @returns Array of DailyCheckIn objects, sorted by date descending (newest first)
 * @throws Error if database query fails
 */
export async function getRecentCheckIns(
  childId: string,
  days: number = 7
): Promise<DailyCheckIn[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('child_id', childId)
    .gte('checkin_date', startDate.toISOString().split('T')[0])
    .order('checkin_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get check-ins for a specific date range
 *
 * Useful for generating reports and charts over custom time periods.
 *
 * @param childId - UUID of the child
 * @param startDate - Start date (YYYY-MM-DD format)
 * @param endDate - End date (YYYY-MM-DD format)
 * @returns Array of DailyCheckIn objects within the date range, sorted by date descending
 * @throws Error if database query fails
 */
export async function getCheckInsForDateRange(
  childId: string,
  startDate: string,
  endDate: string
): Promise<DailyCheckIn[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('child_id', childId)
    .gte('checkin_date', startDate)
    .lte('checkin_date', endDate)
    .order('checkin_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Calculate average score for a check-in
 *
 * Averages the 4 dimensions: sleep_quality, attention_focus,
 * emotional_regulation, behavior_quality. Only includes non-null values.
 *
 * @param checkIn - DailyCheckIn object
 * @returns Average score (0-10), rounded to 1 decimal place. Returns 0 if no scores filled.
 */
export function calculateAverageScore(checkIn: DailyCheckIn): number {
  const scores = [
    checkIn.sleep_quality,
    checkIn.attention_focus,
    checkIn.emotional_regulation,
    checkIn.behavior_quality
  ].filter((score): score is number => score !== null);

  if (scores.length === 0) return 0;

  const sum = scores.reduce((a, b) => a + b, 0);
  const average = sum / scores.length;

  // Round to 1 decimal place
  return Math.round(average * 10) / 10;
}

/**
 * Delete a check-in by ID
 *
 * @param checkInId - UUID of the check-in to delete
 * @throws Error if database operation fails
 */
export async function deleteCheckIn(checkInId: string): Promise<void> {
  const { error } = await supabase
    .from('daily_checkins')
    .delete()
    .eq('id', checkInId);

  if (error) throw error;
}

/**
 * Get check-in count for a child
 *
 * Useful for determining if insights should be shown (requires 7+ check-ins).
 *
 * @param childId - UUID of the child
 * @returns Total number of check-ins for this child
 * @throws Error if database query fails
 */
export async function getCheckInCount(childId: string): Promise<number> {
  const { count, error } = await supabase
    .from('daily_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childId);

  if (error) throw error;
  return count || 0;
}
