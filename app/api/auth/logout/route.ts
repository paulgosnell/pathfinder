import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error', error);
      return Response.json({ message: 'Unable to logout right now.' }, { status: 500 });
    }

    return Response.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout unexpected error', error);
    return Response.json({ message: 'Unexpected error during logout.' }, { status: 500 });
  }
}

