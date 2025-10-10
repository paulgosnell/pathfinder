import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server-client';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { email, password } = loginSchema.parse(payload);

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      console.warn('Login failed', error);
      return Response.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // Ensure user exists in public.users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: data.session.user.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id',
        ignoreDuplicates: true
      });

    if (userError) {
      console.error('Failed to upsert user:', userError);
    }

    return Response.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error', error);
    if (error instanceof z.ZodError) {
      return Response.json({ message: 'Invalid login data', issues: error.issues }, { status: 400 });
    }

    return Response.json({ message: 'Unexpected error during login.' }, { status: 500 });
  }
}

