import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';
import jwt from 'jsonwebtoken';

const recoverySchema = z.object({
  email: z.string().email()
});

/**
 * Admin endpoint to generate recovery links manually
 * Creates a JWT-based recovery link that can be shared directly
 */
export async function POST(req: NextRequest) {
  try {
    // Verify environment variables are configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return Response.json({
        message: 'Server configuration error',
        error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set',
        hint: 'Add SUPABASE_SERVICE_ROLE_KEY to Netlify environment variables'
      }, { status: 500 });
    }

    const payload = await req.json();
    const { email } = recoverySchema.parse(payload);

    const supabase = createServiceClient();

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Error checking user:', userError);
      return Response.json({
        message: 'Unable to verify user.',
        error: userError.message
      }, { status: 400 });
    }

    const user = userData?.users?.find(u => u.email === email);
    if (!user) {
      return Response.json({
        message: `No account found for ${email}.`,
        error: 'This email address is not registered in the system.',
        suggestion: 'User needs to create an account first'
      }, { status: 404 });
    }

    // Create a recovery token (expires in 1 hour)
    const token = jwt.sign(
      {
        email,
        userId: user.id,
        type: 'password_recovery',
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      },
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { algorithm: 'HS256' }
    );

    // Build recovery link
    const recoveryLink = `https://pathfinder001.netlify.app/auth/reset-token?token=${token}`;

    return Response.json({
      message: 'Recovery link generated successfully.',
      recoveryLink,
      email,
      expiresIn: '1 hour',
      instructions: 'Share this link with the user via SMS, WhatsApp, or other secure channel.'
    });

  } catch (error) {
    console.error('Generate recovery link unexpected error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({
        message: 'Invalid email provided.',
        issues: error.issues
      }, { status: 400 });
    }
    return Response.json({
      message: 'Unexpected error generating recovery link.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}