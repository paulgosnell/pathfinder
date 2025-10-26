import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

/**
 * POST /api/reports/[id]/pdf
 * Generate PDF for report
 *
 * Currently returns 501 Not Implemented as placeholder.
 * Future implementation will use jsPDF or similar library.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  // Verify report belongs to user
  const { data: report, error } = await supabase
    .from('generated_reports')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !report) {
    return Response.json({ error: 'Report not found' }, { status: 404 });
  }

  // TODO: Implement PDF generation
  // See docs/specs/REPORTS-SPEC.md for PDF export implementation details
  // Will use jsPDF library to generate PDF from report content
  // Store PDF in Supabase Storage and return public URL

  return Response.json(
    {
      error: 'PDF generation not yet implemented',
      message: 'This feature is coming soon. Please use the web preview for now.'
    },
    { status: 501 }
  );
}
