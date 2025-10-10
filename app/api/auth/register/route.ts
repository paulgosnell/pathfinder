import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';

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
      email_confirm: true // Auto-confirm users (change to false to require email verification)
    });

    if (authError || !authData.user) {
      console.error('Supabase auth user creation failed', authError);

      // Handle specific error cases
      if (authError?.message?.includes('already been registered') || authError?.code === 'email_exists') {
        return Response.json({
          message: 'This email is already registered. Please sign in instead.'
        }, { status: 422 });
      }

      return Response.json({
        message: 'Unable to register user right now. Please try again.'
      }, { status: 400 });
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

    return Response.json({ message: 'Registration successful. You can now sign in.' });
  } catch (error) {
    console.error('Registration error', error);
    if (error instanceof z.ZodError) {
      return Response.json({ message: 'Invalid registration data', issues: error.issues }, { status: 400 });
    }

    return Response.json({ message: 'Unexpected error during registration.' }, { status: 500 });
  }
}

