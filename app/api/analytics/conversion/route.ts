import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { conversionType, sessionId, visitorId } = await request.json();

    // Update analytics session with conversion
    const conversionFields: Record<string, Record<string, boolean>> = {
      signup: { signed_up: true },
      chat_start: { started_chat: true },
      voice_start: { started_voice: true },
    };

    const updateData = conversionFields[conversionType];

    if (!updateData) {
      return NextResponse.json({ error: 'Invalid conversion type' }, { status: 400 });
    }

    // Update the session
    const { error } = await supabase
      .from('analytics_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating conversion:', error);
      return NextResponse.json({ error: 'Failed to track conversion' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    return NextResponse.json({ error: 'Failed to track conversion' }, { status: 500 });
  }
}
