import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create server-side client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Verify admin auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const { url, adminUserId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!adminUserId) {
      return NextResponse.json({ error: 'Admin user ID required' }, { status: 400 });
    }

    // Determine file type based on URL
    const fileType = url.includes('youtube.com') || url.includes('youtu.be')
      ? 'youtube'
      : 'url';

    // Extract title from URL
    const urlObj = new URL(url);
    const title = fileType === 'youtube'
      ? `YouTube: ${urlObj.hostname}${urlObj.pathname}`
      : urlObj.hostname + urlObj.pathname;

    // Create source_documents record
    const { data: docData, error: dbError } = await supabase
      .from('source_documents')
      .insert({
        title,
        file_name: url,
        file_type: fileType,
        file_url: url,
        processing_status: 'pending',
        uploaded_by: adminUserId
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create document record', details: dbError.message },
        { status: 500 }
      );
    }

    // Trigger background processing
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/knowledge-base/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docData.id })
    }).catch(err => console.error('Failed to trigger processing:', err));

    return NextResponse.json({
      success: true,
      document: docData
    });

  } catch (error: any) {
    console.error('URL upload error:', error);
    return NextResponse.json(
      { error: 'URL upload failed', details: error.message },
      { status: 500 }
    );
  }
}
