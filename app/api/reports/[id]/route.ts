import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';

/**
 * GET /api/reports/[id]
 * Fetch single report by ID
 */
export async function GET(
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

  // Fetch report and verify it belongs to user
  const { data: report, error } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !report) {
    return Response.json({ error: 'Report not found' }, { status: 404 });
  }

  return Response.json({ report });
}

/**
 * DELETE /api/reports/[id]
 * Delete report
 */
export async function DELETE(
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

  // Verify report belongs to user before deleting
  const { data: report, error: fetchError } = await supabase
    .from('generated_reports')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !report) {
    return Response.json({ error: 'Report not found' }, { status: 404 });
  }

  // Delete the report (hard delete)
  const { error: deleteError } = await supabase
    .from('generated_reports')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Report delete error:', deleteError);
    return Response.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
