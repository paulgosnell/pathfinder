import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';

const recoverySchema = z.object({
  email: z.string().email()
});

/**
 * Admin endpoint to generate recovery links when email delivery fails
 * Use this to manually share password reset links with users
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { email } = recoverySchema.parse(payload);

    const supabase = createServiceClient();

    // Generate recovery link (does NOT send email)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`
      }
    });

    if (error) {
      console.error('Generate recovery link error:', error);
      return Response.json({
        message: 'Unable to generate recovery link.',
        error: error.message
      }, { status: 400 });
    }

    if (!data?.properties?.action_link) {
      return Response.json({
        message: 'No recovery link generated.'
      }, { status: 400 });
    }

    // Return the link to display on-screen
    return Response.json({
      message: 'Recovery link generated successfully.',
      recoveryLink: data.properties.action_link,
      email: email
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
      message: 'Unexpected error generating recovery link.'
    }, { status: 500 });
  }
}
