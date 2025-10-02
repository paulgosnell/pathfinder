import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';
import { recordAuthEvent } from '@/lib/database/performance';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  consentGiven: z.boolean().default(false)
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { email, password, consentGiven } = registerSchema.parse(payload);

    const supabase = createServiceClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: process.env.NODE_ENV !== 'production'
    });

    if (authError || !authData.user) {
      console.error('Supabase auth user creation failed', authError);
      return Response.json({ message: 'Unable to register user right now.' }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create user record in public.users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        consent_given: consentGiven,
        consent_timestamp: consentGiven ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (userError) {
      console.error('Failed to create user record:', userError);
      return Response.json({ message: 'Unable to complete registration.' }, { status: 500 });
    }

    try {
      await recordAuthEvent({
        userId,
        type: 'register',
        metadata: { consentGiven }
      });
    } catch (authEventError) {
      console.warn('Failed to record auth event (non-critical):', authEventError);
    }

    return Response.json({ message: 'Registration successful. Please verify your email.' });
  } catch (error) {
    console.error('Registration error', error);
    if (error instanceof z.ZodError) {
      return Response.json({ message: 'Invalid registration data', issues: error.issues }, { status: 400 });
    }

    return Response.json({ message: 'Unexpected error during registration.' }, { status: 500 });
  }
}

