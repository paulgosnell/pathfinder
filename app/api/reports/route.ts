import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';
import {
  generateMonthlyProgressReport,
  generateStrategyEffectivenessReport,
  generateComprehensiveReport,
  ReportType
} from '@/lib/reports/generator';

/**
 * GET /api/reports
 * Fetch all reports for current user
 */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: reports, error } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch reports:', error);
    return Response.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }

  return Response.json({ reports: reports || [] });
}

/**
 * POST /api/reports
 * Generate new report
 *
 * Request body:
 * - report_type: 'monthly_progress' | 'strategy_effectiveness' | 'comprehensive'
 * - child_id: string
 * - start_date: string (YYYY-MM-DD)
 * - end_date: string (YYYY-MM-DD)
 * - title?: string (optional)
 * - sections: { include_checkins, include_sessions, include_strategies }
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      report_type,
      child_id,
      start_date,
      end_date,
      title,
      sections
    } = body;

    // Validate required fields
    if (!report_type || !child_id || !start_date || !end_date) {
      return Response.json(
        { error: 'Missing required fields: report_type, child_id, start_date, end_date' },
        { status: 400 }
      );
    }

    // Validate report type
    const validReportTypes: ReportType[] = [
      'monthly_progress',
      'strategy_effectiveness',
      'comprehensive'
    ];
    if (!validReportTypes.includes(report_type)) {
      return Response.json(
        { error: `Invalid report_type. Must be one of: ${validReportTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return Response.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Verify child belongs to user
    const serviceClient = createServiceClient();
    const { data: childProfile, error: childError } = await serviceClient
      .from('child_profiles')
      .select('id, child_name')
      .eq('id', child_id)
      .eq('user_id', user.id)
      .single();

    if (childError || !childProfile) {
      return Response.json(
        { error: 'Child profile not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Generate report content based on type
    let reportContent;
    let defaultTitle;

    switch (report_type) {
      case 'monthly_progress':
        reportContent = await generateMonthlyProgressReport(
          user.id,
          child_id,
          start_date,
          end_date,
          sections || {
            include_checkins: true,
            include_sessions: true,
            include_strategies: true
          }
        );
        defaultTitle = `${reportContent.date_range.month_label} Progress - ${childProfile.child_name}`;
        break;

      case 'strategy_effectiveness':
        reportContent = await generateStrategyEffectivenessReport(
          user.id,
          child_id,
          start_date,
          end_date
        );
        defaultTitle = `Strategy Effectiveness Report - ${childProfile.child_name}`;
        break;

      case 'comprehensive':
        reportContent = await generateComprehensiveReport(
          user.id,
          child_id,
          start_date,
          end_date
        );
        defaultTitle = `Comprehensive Report - ${childProfile.child_name}`;
        break;

      default:
        return Response.json(
          { error: 'Unsupported report type' },
          { status: 400 }
        );
    }

    // Check if report has data
    if (report_type === 'monthly_progress' || report_type === 'comprehensive') {
      const hasData =
        ('checkins' in reportContent && reportContent.checkins?.total_entries) ||
        ('sessions' in reportContent && reportContent.sessions?.total) ||
        ('strategies' in reportContent && (reportContent.strategies?.successful?.length || reportContent.strategies?.unsuccessful?.length));

      if (!hasData) {
        return Response.json(
          { error: 'No data found for selected date range' },
          { status: 400 }
        );
      }
    }

    // Save report to database
    const { data: savedReport, error: saveError } = await serviceClient
      .from('generated_reports')
      .insert({
        user_id: user.id,
        child_id,
        report_type,
        title: title || defaultTitle,
        start_date,
        end_date,
        content: reportContent,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save report:', saveError);
      return Response.json(
        { error: 'Failed to save report' },
        { status: 500 }
      );
    }

    return Response.json({
      report_id: savedReport.id,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json(
      {
        error: 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
