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

    // 1. Verify admin auth from header or session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Get admin user ID from the request
    // For now, we'll need to pass this from the client
    // In production, extract from session
    const adminUserId = formData.get('adminUserId') as string;
    if (!adminUserId) {
      return NextResponse.json({ error: 'Admin user ID required' }, { status: 400 });
    }

    // 3. Process each file
    const uploadedDocuments = [];

    for (const file of files) {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();

      const { data: storageData, error: storageError } = await supabase.storage
        .from('knowledge-base-uploads')
        .upload(fileName, fileBuffer, {
          contentType: file.type
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('knowledge-base-uploads')
        .getPublicUrl(fileName);

      // Create source_documents record
      const { data: docData, error: dbError } = await supabase
        .from('source_documents')
        .insert({
          title: file.name,
          file_name: fileName,
          file_type: getFileType(file.name),
          file_size_bytes: file.size,
          file_url: urlData.publicUrl,
          processing_status: 'pending',
          uploaded_by: adminUserId
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        continue;
      }

      uploadedDocuments.push(docData);

      // 4. Trigger background processing
      // We'll call the process endpoint asynchronously
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/knowledge-base/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.id })
      }).catch(err => console.error('Failed to trigger processing:', err));
    }

    return NextResponse.json({
      success: true,
      documents: uploadedDocuments
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'pdf';
    case 'md': return 'md';
    case 'txt': return 'txt';
    default: return 'unknown';
  }
}
