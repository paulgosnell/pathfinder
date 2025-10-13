import { createBrowserClient } from '@supabase/ssr';

// Create a client that shares the same storage as auth-context
function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('[isCurrentUserAdmin] User check:', {
      hasUser: !!user,
      userId: user?.id,
      userError
    });

    if (!user) {
      console.log('[isCurrentUserAdmin] No user found');
      return false;
    }

    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    console.log('[isCurrentUserAdmin] Admin check:', {
      hasData: !!data,
      error,
      userId: user.id
    });

    if (error) {
      console.error('[isCurrentUserAdmin] Query error:', error);
      return false;
    }

    if (!data) {
      console.log('[isCurrentUserAdmin] No admin record found');
      return false;
    }

    console.log('[isCurrentUserAdmin] User IS admin!', data);
    return true;
  } catch (error) {
    console.error('[isCurrentUserAdmin] Unexpected error:', error);
    return false;
  }
}

/**
 * Check if a specific user ID is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Log an admin action to the audit trail
 */
export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, any>
) {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Silently skip logging if user not authenticated
      // This can happen during initial page load
      return;
    }

    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_user_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details: details || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

/**
 * Get the admin audit log
 */
export async function getAdminAuditLog(limit = 100) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select(`
        *,
        admin_user:users!admin_audit_log_admin_user_id_fkey(id)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }
}
