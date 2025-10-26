import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';
import { randomUUID } from 'crypto';

/**
 * POST /api/reports/[id]/share
 * Create shareable link with expiration
 *
 * Request body:
 * - expires_in_days: number (e.g., 7, 30, 90)
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

  try {
    const body = await req.json();
    const { expires_in_days } = body;

    // Validate expires_in_days
    if (!expires_in_days || typeof expires_in_days !== 'number') {
      return Response.json(
        { error: 'Missing or invalid expires_in_days' },
        { status: 400 }
      );
    }

    // Limit expiration to max 90 days for security
    if (expires_in_days < 1 || expires_in_days > 90) {
      return Response.json(
        { error: 'expires_in_days must be between 1 and 90' },
        { status: 400 }
      );
    }

    // Verify report belongs to user
    const serviceClient = createServiceClient();
    const { data: report, error: fetchError } = await serviceClient
      .from('generated_reports')
      .select('id, user_id, is_shared, share_token')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate share token if doesn't exist
    const shareToken = report.share_token || randomUUID();

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Update report with sharing info
    const { error: updateError } = await serviceClient
      .from('generated_reports')
      .update({
        is_shared: true,
        share_token: shareToken,
        shared_at: new Date().toISOString(),
        share_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update report sharing info:', updateError);
      return Response.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }

    // Construct share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/reports/share/${shareToken}`;

    return Response.json({
      share_url: shareUrl,
      expires_at: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Share link creation error:', error);
    return Response.json(
      {
        error: 'Failed to create share link',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]/share
 * Revoke share link
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

  // Verify report belongs to user
  const serviceClient = createServiceClient();
  const { data: report, error: fetchError } = await serviceClient
    .from('generated_reports')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !report) {
    return Response.json({ error: 'Report not found' }, { status: 404 });
  }

  // Revoke sharing by clearing share fields
  const { error: updateError } = await serviceClient
    .from('generated_reports')
    .update({
      is_shared: false,
      share_token: null,
      shared_at: null,
      share_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to revoke share link:', updateError);
    return Response.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
