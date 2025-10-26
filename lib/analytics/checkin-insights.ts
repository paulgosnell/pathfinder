import { DailyCheckIn } from '@/lib/supabase/client';

/**
 * Insight type generated from check-in pattern analysis
 */
export interface Insight {
  type: 'trend' | 'correlation' | 'day-of-week' | 'dimension';
  message: string;
  severity: 'positive' | 'neutral' | 'negative';
}

/**
 * Day of week averages map
 */
interface DayOfWeekAverages {
  [key: string]: number;
}

/**
 * Dimension trends map (percentage change)
 */
interface DimensionTrends {
  sleep: number;
  attention: number;
  emotional: number;
  behavior: number;
}

/**
 * Calculate overall average score for a set of check-ins
 * @param checkIns Array of check-ins to analyze
 * @returns Average score across all dimensions (0 if no valid scores)
 */
function calculateAverage(checkIns: DailyCheckIn[]): number {
  if (checkIns.length === 0) return 0;

  let totalScore = 0;
  let totalCount = 0;

  checkIns.forEach((checkIn) => {
    const scores = [
      checkIn.sleep_quality,
      checkIn.attention_focus,
      checkIn.emotional_regulation,
      checkIn.behavior_quality,
    ].filter((score): score is number => score !== null);

    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      totalScore += avgScore;
      totalCount += 1;
    }
  });

  return totalCount > 0 ? totalScore / totalCount : 0;
}

/**
 * Calculate average scores by day of week
 * @param checkIns Array of check-ins to analyze
 * @returns Map of day names to average scores
 */
function calculateDayOfWeekAverages(checkIns: DailyCheckIn[]): DayOfWeekAverages {
  const dayScores: { [key: string]: number[] } = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  checkIns.forEach((checkIn) => {
    const date = new Date(checkIn.checkin_date);
    const dayName = dayNames[date.getDay()];

    const scores = [
      checkIn.sleep_quality,
      checkIn.attention_focus,
      checkIn.emotional_regulation,
      checkIn.behavior_quality,
    ].filter((score): score is number => score !== null);

    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (!dayScores[dayName]) {
        dayScores[dayName] = [];
      }
      dayScores[dayName].push(avgScore);
    }
  });

  const dayAverages: DayOfWeekAverages = {};
  Object.entries(dayScores).forEach(([day, scores]) => {
    if (scores.length > 0) {
      dayAverages[day] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  });

  return dayAverages;
}

/**
 * Calculate percentage change for each dimension (first 3 days vs last 3 days)
 * @param checkIns Array of check-ins sorted by date (descending)
 * @returns Object with percentage change for each dimension
 */
function calculateDimensionTrends(checkIns: DailyCheckIn[]): DimensionTrends {
  if (checkIns.length < 6) {
    return { sleep: 0, attention: 0, emotional: 0, behavior: 0 };
  }

  // Recent = last 3 check-ins (most recent)
  const recentCheckIns = checkIns.slice(0, 3);
  // Older = 3 check-ins from earlier in the period
  const olderCheckIns = checkIns.slice(-3);

  const dimensions = [
    'sleep_quality',
    'attention_focus',
    'emotional_regulation',
    'behavior_quality',
  ] as const;

  const dimensionNames = ['sleep', 'attention', 'emotional', 'behavior'] as const;

  const trends: DimensionTrends = {
    sleep: 0,
    attention: 0,
    emotional: 0,
    behavior: 0,
  };

  dimensions.forEach((dimension, index) => {
    const dimensionName = dimensionNames[index];

    // Calculate recent average
    const recentScores = recentCheckIns
      .map((c) => c[dimension])
      .filter((score): score is number => score !== null);
    const recentAvg = recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 0;

    // Calculate older average
    const olderScores = olderCheckIns
      .map((c) => c[dimension])
      .filter((score): score is number => score !== null);
    const olderAvg = olderScores.length > 0
      ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length
      : 0;

    // Calculate percentage change
    if (olderAvg > 0) {
      trends[dimensionName] = ((recentAvg - olderAvg) / olderAvg) * 100;
    }
  });

  return trends;
}

/**
 * Generate insights from check-in history
 * Requires minimum 7 check-ins to generate meaningful patterns
 * Returns max 4 insights to avoid overwhelming the parent
 *
 * @param checkIns Array of check-ins sorted by date (most recent first)
 * @returns Array of insights (max 4)
 */
export function generateInsights(checkIns: DailyCheckIn[]): Insight[] {
  // Require minimum 7 check-ins for pattern detection
  if (checkIns.length < 7) {
    return [];
  }

  const insights: Insight[] = [];

  try {
    // 1. Overall Trend Analysis (first 3 days vs last 3 days)
    const recentAvg = calculateAverage(checkIns.slice(0, 3));
    const olderAvg = calculateAverage(checkIns.slice(-3));

    if (olderAvg > 0) {
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;

      // Only report significant changes (>10%)
      if (Math.abs(change) > 10) {
        insights.push({
          type: 'trend',
          message: `Overall ${change > 0 ? 'improving' : 'declining'} over last week (${Math.abs(Math.round(change))}%)`,
          severity: change > 0 ? 'positive' : 'negative',
        });
      }
    }

    // 2. Day of Week Patterns
    const dayAverages = calculateDayOfWeekAverages(checkIns);
    const dayEntries = Object.entries(dayAverages);

    if (dayEntries.length >= 3) {
      // Find best and worst days
      const sortedByScore = [...dayEntries].sort((a, b) => b[1] - a[1]);
      const bestDay = sortedByScore[0];
      const worstDay = sortedByScore[sortedByScore.length - 1];

      // Only report if there's a significant difference (>2 points)
      if (bestDay[1] - worstDay[1] > 2) {
        insights.push({
          type: 'day-of-week',
          message: `Best days: ${bestDay[0]} (avg ${bestDay[1].toFixed(1)}/10)`,
          severity: 'positive',
        });
        insights.push({
          type: 'day-of-week',
          message: `Challenges on ${worstDay[0]} (avg ${worstDay[1].toFixed(1)}/10)`,
          severity: 'negative',
        });
      }
    }

    // 3. Dimension-Specific Insights
    const dimensionTrends = calculateDimensionTrends(checkIns);
    const dimensionLabels: { [key in keyof DimensionTrends]: string } = {
      sleep: 'Sleep',
      attention: 'Attention',
      emotional: 'Emotional regulation',
      behavior: 'Behavior',
    };

    Object.entries(dimensionTrends).forEach(([dimension, trend]) => {
      const dimensionKey = dimension as keyof DimensionTrends;
      const label = dimensionLabels[dimensionKey];

      // Only report significant changes (>15%)
      if (Math.abs(trend) > 15) {
        insights.push({
          type: 'dimension',
          message: `${label} ${trend > 0 ? 'improving' : 'declining'} (${Math.abs(Math.round(trend))}%)`,
          severity: trend > 0 ? 'positive' : 'negative',
        });
      }
    });
  } catch (error) {
    console.error('[generateInsights] Error generating insights:', error);
    // Return empty array on error rather than throwing
    return [];
  }

  // Return max 4 insights to avoid overwhelming the parent
  // Prioritize: dimension-specific > day-of-week > overall trend
  const prioritized = [
    ...insights.filter((i) => i.type === 'dimension'),
    ...insights.filter((i) => i.type === 'day-of-week'),
    ...insights.filter((i) => i.type === 'trend'),
  ];

  return prioritized.slice(0, 4);
}
