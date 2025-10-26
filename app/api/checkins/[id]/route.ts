import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';
import { deleteCheckIn } from '@/lib/database/checkins';

/**
 * GET /api/checkins/[id]
 * Fetch a single check-in by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch check-in and verify ownership
    const serviceClient = createServiceClient();
    const { data: checkIn, error: fetchError } = await serviceClient
      .from('daily_checkins')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !checkIn) {
      return Response.json(
        { error: 'Check-in not found or access denied' },
        { status: 404 }
      );
    }

    return Response.json(checkIn);

  } catch (error) {
    console.error('GET /api/checkins/[id] error:', error);
    return Response.json(
      { error: 'Failed to fetch check-in' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/checkins/[id]
 * Delete a check-in by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify check-in belongs to user before deleting
    const serviceClient = createServiceClient();
    const { data: checkIn, error: fetchError } = await serviceClient
      .from('daily_checkins')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !checkIn) {
      return Response.json(
        { error: 'Check-in not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the check-in
    await deleteCheckIn(id);

    return Response.json({
      success: true,
      message: 'Check-in deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/checkins/[id] error:', error);
    return Response.json(
      { error: 'Failed to delete check-in' },
      { status: 500 }
    );
  }
}
