import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service-client';
import { createServerClient } from '@/lib/supabase/server-client';
import { z } from 'zod';

const profileSchema = z.object({
  parent_name: z.string().max(255).nullable().optional(),
  relationship_to_child: z.string().max(255).nullable().optional(),
  parent_age_range: z.string().max(255).nullable().optional(),
  support_system_strength: z.string().max(255).nullable().optional()
});

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('parent_name, relationship_to_child, parent_age_range, support_system_strength')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Profile fetch error', error);
    return new Response('Failed to load profile', { status: 500 });
  }

  return Response.json(data || {});
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerClient();
  const body = await req.json();
  const parseResult = profileSchema.safeParse(body);

  if (!parseResult.success) {
    return Response.json({ message: 'Invalid profile data', issues: parseResult.error.issues }, { status: 400 });
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = {
    user_id: user.id,
    ...parseResult.data,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('user_profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('Profile update error', error);
    return Response.json({ message: 'Unable to save profile' }, { status: 500 });
  }

  return Response.json({ ok: true });
}

