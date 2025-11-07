import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service-client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({
        message: 'Server configuration error'
      }, { status: 500 });
    }

    const payload = await req.json();
    const { token, password } = resetSchema.parse(payload);

    // Verify JWT token
    let tokenData: any;
    try {
      tokenData = jwt.verify(token, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        algorithms: ['HS256']
      });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return Response.json({
          message: 'This recovery link has expired. Please request a new one.'
        }, { status: 400 });
      }
      return Response.json({
        message: 'Invalid recovery link'
      }, { status: 400 });
    }

    // Verify token type
    if (tokenData.type !== 'password_recovery') {
      return Response.json({
        message: 'Invalid token type'
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Update user password using admin API
    const { error } = await supabase.auth.admin.updateUserById(
      tokenData.userId,
      { password }
    );

    if (error) {
      console.error('Password update error:', error);
      return Response.json({
        message: 'Failed to update password',
        error: error.message
      }, { status: 400 });
    }

    return Response.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset with token error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({
        message: 'Invalid request',
        issues: error.issues
      }, { status: 400 });
    }
    return Response.json({
      message: 'Failed to reset password'
    }, { status: 500 });
  }
}