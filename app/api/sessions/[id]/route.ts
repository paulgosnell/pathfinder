import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

// PATCH - Update session (favorite, archive)
export async function PATCH(
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
  const body = await req.json();

  // Validate request body
  const allowedFields = ['is_favorite', 'is_archived', 'custom_title'];
  const updates: Record<string, boolean | string | null> = {};

  for (const field of allowedFields) {
    if (field === 'custom_title') {
      // Allow string or null for custom_title
      if (field in body && (typeof body[field] === 'string' || body[field] === null)) {
        updates[field] = body[field];
      }
    } else if (field in body && typeof body[field] === 'boolean') {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json(
      { message: 'No valid fields to update' },
      { status: 400 }
    );
  }

  // Verify session belongs to user before updating
  const { data: session, error: fetchError } = await supabase
    .from('agent_sessions')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !session) {
    return Response.json({ message: 'Session not found' }, { status: 404 });
  }

  // Update the session
  const { data, error: updateError } = await supabase
    .from('agent_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Session update error:', updateError);
    return Response.json(
      { message: 'Failed to update session' },
      { status: 500 }
    );
  }

  return Response.json({ success: true, session: data });
}

// DELETE - Soft delete session
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

  // Verify session belongs to user before deleting
  const { data: session, error: fetchError } = await supabase
    .from('agent_sessions')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !session) {
    return Response.json({ message: 'Session not found' }, { status: 404 });
  }

  // Soft delete by setting deleted_at timestamp
  const { error: deleteError } = await supabase
    .from('agent_sessions')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (deleteError) {
    console.error('Session delete error:', deleteError);
    return Response.json(
      { message: 'Failed to delete session' },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
