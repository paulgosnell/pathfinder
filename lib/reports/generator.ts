import { supabase, DailyCheckIn, AgentSession, ChildProfile } from '@/lib/supabase/client';

// ============================================================================
// TypeScript Interfaces for Report Types
// ============================================================================

export type ReportType =
  | 'monthly_progress'
  | 'strategy_effectiveness'
  | 'assessment_history'
  | 'comprehensive';

export interface GeneratedReport {
  id: string;
  user_id: string;
  child_id: string | null;
  report_type: ReportType;
  title: string;
  start_date: string;
  end_date: string;
  content: MonthlyProgressContent | StrategyEffectivenessContent | ComprehensiveContent;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  is_shared: boolean;
  share_token: string | null;
  shared_at: string | null;
  share_expires_at: string | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyProgressContent {
  report_type: 'monthly_progress';
  child: ChildSummary;
  date_range: DateRange;
  checkins?: CheckInSummary;
  sessions?: SessionSummary;
  strategies?: StrategySummary;
  next_steps?: string[];
}

export interface StrategyEffectivenessContent {
  report_type: 'strategy_effectiveness';
  child: ChildSummary;
  date_range: DateRange;
  strategies_analyzed: StrategyAnalysis[];
  summary: {
    total_strategies_tried: number;
    successful: number;
    unsuccessful: number;
    success_rate: string;
  };
  recommendations: string[];
}

export interface ComprehensiveContent {
  report_type: 'comprehensive';
  child: ChildSummary;
  date_range: DateRange;
  checkins?: CheckInSummary;
  sessions?: SessionSummary;
  strategies?: StrategySummary;
  child_profile?: ChildProfileSummary;
  next_steps?: string[];
}

export interface ChildSummary {
  name: string;
  age: number | null;
  diagnosis_status?: string;
}

export interface DateRange {
  start: string;
  end: string;
  month_label?: string;
}

export interface CheckInSummary {
  total_entries: number;
  completion_rate: string;
  averages: {
    sleep_quality: number;
    attention_focus: number;
    emotional_regulation: number;
    behavior_quality: number;
    overall: number;
  };
  trends: Record<string, { direction: 'improving' | 'declining' | 'stable'; change_percent: number }>;
  insights: string[];
  chart_data: Array<{ date: string; score: number }>;
}

export interface SessionSummary {
  total: number;
  summary: Array<{
    date: string;
    topic: string;
    goal: string;
    strategies_discussed: string[];
  }>;
}

export interface StrategySummary {
  successful: string[];
  unsuccessful: string[];
  in_progress: string[];
}

export interface StrategyAnalysis {
  strategy_name: string;
  category: string;
  implementation_date: string;
  status: 'successful' | 'unsuccessful' | 'in_progress';
  duration_days: number;
  parent_notes: string;
  checkin_correlation?: {
    before_avg: number;
    during_avg: number;
    change: number;
    conclusion: string;
  };
}

export interface ChildProfileSummary {
  name: string;
  age: number | null;
  diagnosis_status: string;
  diagnosis_details: string | null;
  main_challenges: string[];
  strengths: string[];
  interests: string[];
  school_info: {
    grade_level: string | null;
    has_iep: boolean;
    has_504_plan: boolean;
  };
  medication_status: string | null;
  therapy_status: string | null;
}

// ============================================================================
// Main Report Generation Function
// ============================================================================

export async function generateMonthlyProgressReport(
  userId: string,
  childId: string,
  startDate: string,
  endDate: string,
  includeSections: {
    include_checkins: boolean;
    include_sessions: boolean;
    include_strategies: boolean;
  }
): Promise<MonthlyProgressContent> {
  // 1. Fetch child profile
  const { data: child } = await supabase
    .from('child_profiles')
    .select('child_name, child_age, diagnosis_status')
    .eq('id', childId)
    .single();

  if (!child) {
    throw new Error('Child profile not found');
  }

  // 2. Fetch check-ins (if included)
  let checkins: CheckInSummary | undefined;
  if (includeSections.include_checkins) {
    const { data: checkinsData } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('child_id', childId)
      .gte('checkin_date', startDate)
      .lte('checkin_date', endDate)
      .order('checkin_date', { ascending: true });

    if (checkinsData && checkinsData.length > 0) {
      checkins = aggregateCheckIns(checkinsData as DailyCheckIn[]);
    }
  }

  // 3. Fetch sessions (if included)
  let sessions: SessionSummary | undefined;
  if (includeSections.include_sessions) {
    const { data: sessionsData } = await supabase
      .from('agent_sessions')
      .select('started_at, therapeutic_goal, strategies_discussed, current_challenge')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: true });

    if (sessionsData && sessionsData.length > 0) {
      sessions = aggregateSessions(sessionsData as AgentSession[]);
    }
  }

  // 4. Fetch strategies (if included)
  let strategies: StrategySummary | undefined;
  if (includeSections.include_strategies) {
    const { data: childProfile } = await supabase
      .from('child_profiles')
      .select('successful_strategies, failed_strategies, tried_solutions')
      .eq('id', childId)
      .single();

    if (childProfile) {
      strategies = {
        successful: childProfile.successful_strategies || [],
        unsuccessful: childProfile.failed_strategies || [],
        in_progress: []
      };
    }
  }

  // 5. Compile report content
  return {
    report_type: 'monthly_progress',
    child: {
      name: child.child_name || '',
      age: child.child_age || null,
      diagnosis_status: child.diagnosis_status || undefined
    },
    date_range: {
      start: startDate,
      end: endDate,
      month_label: formatMonthLabel(startDate)
    },
    checkins,
    sessions,
    strategies,
    next_steps: generateNextSteps(checkins, sessions, strategies)
  };
}

// ============================================================================
// Data Aggregation Functions
// ============================================================================

/**
 * Aggregate check-in data: calculate averages, trends, and insights
 */
export function aggregateCheckIns(checkins: DailyCheckIn[]): CheckInSummary {
  const totalEntries = checkins.length;

  if (totalEntries === 0) {
    return {
      total_entries: 0,
      completion_rate: '0%',
      averages: {
        sleep_quality: 0,
        attention_focus: 0,
        emotional_regulation: 0,
        behavior_quality: 0,
        overall: 0
      },
      trends: {},
      insights: ['No check-in data available for this period'],
      chart_data: []
    };
  }

  // Calculate averages
  const sumScores = checkins.reduce(
    (acc, c) => ({
      sleep: acc.sleep + (c.sleep_quality || 0),
      attention: acc.attention + (c.attention_focus || 0),
      emotional: acc.emotional + (c.emotional_regulation || 0),
      behavior: acc.behavior + (c.behavior_quality || 0)
    }),
    { sleep: 0, attention: 0, emotional: 0, behavior: 0 }
  );

  const averages = {
    sleep_quality: round(sumScores.sleep / totalEntries, 1),
    attention_focus: round(sumScores.attention / totalEntries, 1),
    emotional_regulation: round(sumScores.emotional / totalEntries, 1),
    behavior_quality: round(sumScores.behavior / totalEntries, 1),
    overall: round(
      (sumScores.sleep + sumScores.attention + sumScores.emotional + sumScores.behavior) /
        (totalEntries * 4),
      1
    )
  };

  // Calculate trends (first half vs second half)
  const midpoint = Math.floor(totalEntries / 2);
  const firstHalf = checkins.slice(0, midpoint);
  const secondHalf = checkins.slice(midpoint);

  const trends = calculateTrends(firstHalf, secondHalf);

  // Generate insights
  const insights = generateInsights(checkins, averages, trends);

  // Chart data
  const chart_data = checkins.map((c) => ({
    date: c.checkin_date,
    score: calculateAverageScore(c)
  }));

  // Calculate completion rate (assume 30 days in a month)
  const daysInPeriod = Math.max(
    1,
    Math.ceil(
      (new Date(checkins[checkins.length - 1].checkin_date).getTime() -
        new Date(checkins[0].checkin_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return {
    total_entries: totalEntries,
    completion_rate: `${Math.round((totalEntries / daysInPeriod) * 100)}%`,
    averages,
    trends,
    insights,
    chart_data
  };
}

/**
 * Aggregate session data for report
 */
export function aggregateSessions(sessions: AgentSession[]): SessionSummary {
  const summary = sessions.map((session) => ({
    date: session.started_at || '',
    topic: session.current_challenge || session.therapeutic_goal || 'General session',
    goal: session.therapeutic_goal || 'Support and guidance',
    strategies_discussed: session.strategies_discussed || []
  }));

  return {
    total: sessions.length,
    summary
  };
}

/**
 * Calculate trends by comparing first half vs second half of period
 */
export function calculateTrends(
  firstHalf: DailyCheckIn[],
  secondHalf: DailyCheckIn[]
): Record<string, { direction: 'improving' | 'declining' | 'stable'; change_percent: number }> {
  if (firstHalf.length === 0 || secondHalf.length === 0) {
    return {};
  }

  const firstAvg = {
    sleep: avg(firstHalf.map((c) => c.sleep_quality || 0)),
    attention: avg(firstHalf.map((c) => c.attention_focus || 0)),
    emotional: avg(firstHalf.map((c) => c.emotional_regulation || 0)),
    behavior: avg(firstHalf.map((c) => c.behavior_quality || 0))
  };

  const secondAvg = {
    sleep: avg(secondHalf.map((c) => c.sleep_quality || 0)),
    attention: avg(secondHalf.map((c) => c.attention_focus || 0)),
    emotional: avg(secondHalf.map((c) => c.emotional_regulation || 0)),
    behavior: avg(secondHalf.map((c) => c.behavior_quality || 0))
  };

  const calculateChange = (first: number, second: number) => {
    if (first === 0) return 0;
    return round(((second - first) / first) * 100, 0);
  };

  const getDirection = (change: number): 'improving' | 'declining' | 'stable' => {
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  };

  return {
    sleep: {
      direction: getDirection(calculateChange(firstAvg.sleep, secondAvg.sleep)),
      change_percent: calculateChange(firstAvg.sleep, secondAvg.sleep)
    },
    attention: {
      direction: getDirection(calculateChange(firstAvg.attention, secondAvg.attention)),
      change_percent: calculateChange(firstAvg.attention, secondAvg.attention)
    },
    emotional: {
      direction: getDirection(calculateChange(firstAvg.emotional, secondAvg.emotional)),
      change_percent: calculateChange(firstAvg.emotional, secondAvg.emotional)
    },
    behavior: {
      direction: getDirection(calculateChange(firstAvg.behavior, secondAvg.behavior)),
      change_percent: calculateChange(firstAvg.behavior, secondAvg.behavior)
    }
  };
}

/**
 * Generate insights from check-in data
 */
function generateInsights(
  checkins: DailyCheckIn[],
  averages: CheckInSummary['averages'],
  trends: Record<string, { direction: string; change_percent: number }>
): string[] {
  const insights: string[] = [];

  // Trend insights
  Object.entries(trends).forEach(([dimension, trend]) => {
    if (trend.direction === 'improving' && trend.change_percent > 10) {
      insights.push(
        `${capitalize(dimension)} improving over the month (+${trend.change_percent}%)`
      );
    } else if (trend.direction === 'declining' && trend.change_percent < -10) {
      insights.push(
        `${capitalize(dimension)} declining over the month (${trend.change_percent}%)`
      );
    }
  });

  // Day-of-week analysis
  const dayScores: Record<string, number[]> = {};
  checkins.forEach((c) => {
    const dayOfWeek = new Date(c.checkin_date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!dayScores[dayOfWeek]) dayScores[dayOfWeek] = [];
    dayScores[dayOfWeek].push(calculateAverageScore(c));
  });

  const dayAverages = Object.entries(dayScores).map(([day, scores]) => ({
    day,
    avg: avg(scores)
  }));

  if (dayAverages.length > 0) {
    const bestDay = dayAverages.reduce((max, curr) => (curr.avg > max.avg ? curr : max));
    const worstDay = dayAverages.reduce((min, curr) => (curr.avg < min.avg ? curr : min));

    if (bestDay.avg - worstDay.avg > 2) {
      insights.push(`Best days: ${bestDay.day}s (avg ${round(bestDay.avg, 1)}/10)`);
      insights.push(
        `Challenges on ${worstDay.day}s (avg ${round(worstDay.avg, 1)}/10)`
      );
    }
  }

  // Overall assessment
  if (averages.overall >= 8) {
    insights.push('Overall strong performance across all dimensions');
  } else if (averages.overall < 6) {
    insights.push('Consider additional support strategies');
  }

  return insights.length > 0 ? insights : ['Data collected, continue monitoring for trends'];
}

/**
 * Generate next steps recommendations
 */
export function generateNextSteps(
  checkins?: CheckInSummary,
  sessions?: SessionSummary,
  strategies?: StrategySummary
): string[] {
  const steps: string[] = [];

  // Based on check-ins
  if (checkins) {
    Object.entries(checkins.trends).forEach(([dimension, trend]) => {
      if (trend.direction === 'declining' && trend.change_percent < -10) {
        steps.push(
          `Address declining ${dimension} (down ${Math.abs(trend.change_percent)}%)`
        );
      }
    });
  }

  // Based on strategies
  if (strategies && strategies.successful.length > 0) {
    const topStrategies = strategies.successful.slice(0, 2).join(', ');
    steps.push(`Continue successful strategies: ${topStrategies}`);
  }

  if (strategies && strategies.unsuccessful.length > 2) {
    steps.push('Review unsuccessful strategies and consider alternative approaches');
  }

  // Based on sessions
  if (sessions && sessions.total === 0) {
    steps.push('Schedule coaching session to discuss current challenges');
  }

  // Default next step
  if (steps.length === 0) {
    steps.push('Continue tracking daily check-ins to identify patterns');
    steps.push('Consider scheduling a coaching session for personalized guidance');
  }

  return steps;
}

// ============================================================================
// Helper Functions
// ============================================================================

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateAverageScore(checkin: DailyCheckIn): number {
  const scores = [
    checkin.sleep_quality || 0,
    checkin.attention_focus || 0,
    checkin.emotional_regulation || 0,
    checkin.behavior_quality || 0
  ];
  return avg(scores);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatMonthLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ============================================================================
// Strategy Effectiveness Report Generation
// ============================================================================

export async function generateStrategyEffectivenessReport(
  userId: string,
  childId: string,
  startDate: string,
  endDate: string
): Promise<StrategyEffectivenessContent> {
  // 1. Fetch child profile
  const { data: child } = await supabase
    .from('child_profiles')
    .select('child_name, child_age, successful_strategies, failed_strategies, tried_solutions, strategy_notes')
    .eq('id', childId)
    .single();

  if (!child) {
    throw new Error('Child profile not found');
  }

  // 2. Fetch check-ins for correlation analysis
  const { data: checkinsData } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('child_id', childId)
    .gte('checkin_date', startDate)
    .lte('checkin_date', endDate)
    .order('checkin_date', { ascending: true });

  // 3. Analyze strategies
  const strategies_analyzed: StrategyAnalysis[] = [];
  const allStrategies = [
    ...(child.successful_strategies || []).map((s: string) => ({ name: s, status: 'successful' as const })),
    ...(child.failed_strategies || []).map((s: string) => ({ name: s, status: 'unsuccessful' as const })),
  ];

  allStrategies.forEach(({ name, status }) => {
    strategies_analyzed.push({
      strategy_name: name,
      category: 'Behavior management', // Could be enhanced with category mapping
      implementation_date: startDate, // Could be enhanced with actual dates
      status,
      duration_days: Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
      parent_notes: child.strategy_notes?.[name] || 'No notes recorded',
      // TODO: Add check-in correlation if needed
    });
  });

  // 4. Calculate summary
  const summary = {
    total_strategies_tried: allStrategies.length,
    successful: (child.successful_strategies || []).length,
    unsuccessful: (child.failed_strategies || []).length,
    success_rate: allStrategies.length > 0
      ? `${Math.round(((child.successful_strategies || []).length / allStrategies.length) * 100)}%`
      : '0%'
  };

  // 5. Generate recommendations
  const recommendations: string[] = [];
  if ((child.successful_strategies || []).length > 0) {
    recommendations.push(`Continue successful strategies: ${(child.successful_strategies || []).slice(0, 3).join(', ')}`);
  }
  if ((child.failed_strategies || []).length > 2) {
    recommendations.push('Consider consulting with therapist about alternative approaches');
  }
  if (allStrategies.length === 0) {
    recommendations.push('Start implementing evidence-based ADHD strategies');
  }

  return {
    report_type: 'strategy_effectiveness',
    child: {
      name: child.child_name || '',
      age: child.child_age || null,
    },
    date_range: {
      start: startDate,
      end: endDate,
    },
    strategies_analyzed,
    summary,
    recommendations
  };
}

// ============================================================================
// Comprehensive Report Generation
// ============================================================================

export async function generateComprehensiveReport(
  userId: string,
  childId: string,
  startDate: string,
  endDate: string
): Promise<ComprehensiveContent> {
  // Get monthly progress data
  const progressData = await generateMonthlyProgressReport(userId, childId, startDate, endDate, {
    include_checkins: true,
    include_sessions: true,
    include_strategies: true,
  });

  // Get full child profile
  const { data: childProfile } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', childId)
    .single();

  const child_profile_summary: ChildProfileSummary | undefined = childProfile
    ? {
        name: childProfile.child_name || '',
        age: childProfile.child_age || null,
        diagnosis_status: childProfile.diagnosis_status || 'unknown',
        diagnosis_details: childProfile.diagnosis_details || null,
        main_challenges: childProfile.main_challenges || [],
        strengths: childProfile.strengths || [],
        interests: childProfile.interests || [],
        school_info: {
          grade_level: childProfile.grade_level || null,
          has_iep: childProfile.has_iep || false,
          has_504_plan: childProfile.has_504_plan || false,
        },
        medication_status: childProfile.medication_status || null,
        therapy_status: childProfile.therapy_status || null,
      }
    : undefined;

  return {
    report_type: 'comprehensive',
    child: progressData.child,
    date_range: progressData.date_range,
    checkins: progressData.checkins,
    sessions: progressData.sessions,
    strategies: progressData.strategies,
    child_profile: child_profile_summary,
    next_steps: progressData.next_steps,
  };
}
