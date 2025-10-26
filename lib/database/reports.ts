import { supabase } from '@/lib/supabase/client';

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
  content: any; // JSON content varies by report type
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

/**
 * Fetch all reports for a user, ordered by most recent first
 */
export async function getUserReports(userId: string): Promise<GeneratedReport[]> {
  const { data, error } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single report by ID
 */
export async function getReportById(reportId: string, userId: string): Promise<GeneratedReport | null> {
  const { data, error } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching report:', error);
    return null;
  }

  return data;
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('generated_reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting report:', error);
    return false;
  }

  return true;
}

/**
 * Update report sharing status
 */
export async function updateReportSharing(
  reportId: string,
  userId: string,
  isShared: boolean,
  shareToken?: string,
  shareExpiresAt?: string
): Promise<boolean> {
  const updateData: any = {
    is_shared: isShared,
    shared_at: isShared ? new Date().toISOString() : null,
  };

  if (shareToken) {
    updateData.share_token = shareToken;
  }

  if (shareExpiresAt) {
    updateData.share_expires_at = shareExpiresAt;
  }

  const { error } = await supabase
    .from('generated_reports')
    .update(updateData)
    .eq('id', reportId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating report sharing:', error);
    return false;
  }

  return true;
}
