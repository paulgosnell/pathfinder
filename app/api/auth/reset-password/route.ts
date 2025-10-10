import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';

const resetSchema = z.object({
  email: z.string().email()
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { email } = resetSchema.parse(payload);

    const supabase = createServiceClient();

    // Get the correct site URL for redirect
    // HARDCODED to production URL
    const siteUrl = 'https://pathfinder001.netlify.app';

    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/update-password`
      }
    });

    if (error) {
      console.error('Reset password error', error);
      return Response.json({ message: 'Unable to send reset email right now.' }, { status: 400 });
    }

    return Response.json({ message: 'Password reset email sent if the account exists.' });
  } catch (error) {
    console.error('Reset password unexpected error', error);
    if (error instanceof z.ZodError) {
      return Response.json({ message: 'Invalid email provided.', issues: error.issues }, { status: 400 });
    }
    return Response.json({ message: 'Unexpected error during password reset.' }, { status: 500 });
  }
}

