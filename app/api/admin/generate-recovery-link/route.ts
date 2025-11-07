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
    // Verify environment variables are configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return Response.json({
        message: 'Server configuration error',
        error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set',
        hint: 'Add SUPABASE_SERVICE_ROLE_KEY to Netlify environment variables'
      }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not configured');
      return Response.json({
        message: 'Server configuration error',
        error: 'NEXT_PUBLIC_SUPABASE_URL environment variable is not set',
        hint: 'Add NEXT_PUBLIC_SUPABASE_URL to Netlify environment variables'
      }, { status: 500 });
    }

    const payload = await req.json();
    const { email } = recoverySchema.parse(payload);

    const supabase = createServiceClient();

    // Generate recovery link (does NOT send email)
    // HARDCODED to production URL - no more environment detection nonsense
    const siteUrl = 'https://pathfinder001.netlify.app';

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/update-password`
      }
    });

    if (error) {
      console.error('Generate recovery link error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        email: email,
        fullError: JSON.stringify(error, null, 2)
      });

      // Check if this is a 404 error (endpoint not available)
      if (error.message?.includes('404') || error.status === 404) {
        return Response.json({
          message: 'Recovery link generation not available.',
          error: 'The Supabase admin.generateLink API is not available on this instance. This feature requires Supabase GoTrue v2.99.0+. Current workaround: Use the standard password reset flow which sends email directly.',
          details: error.message
        }, { status: 501 }); // 501 Not Implemented
      }

      // Check if user doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('User not found')) {
        return Response.json({
          message: `No account found for ${email}.`,
          error: 'This email address is not registered in the system. Please check the email address or ask the user to sign up first.',
          suggestion: 'User needs to create an account at /auth/signup'
        }, { status: 404 });
      }

      // Return detailed error for debugging
      return Response.json({
        message: 'Unable to generate recovery link.',
        error: error.message,
        code: error.code,
        status: error.status,
        hint: 'Check Netlify logs for full error details'
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
