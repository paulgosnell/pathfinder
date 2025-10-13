/**
 * Script to grant admin access to a user
 *
 * Usage:
 *   npx tsx scripts/grant-admin.ts <user_id> <email>
 *
 * Example:
 *   npx tsx scripts/grant-admin.ts "12311a6c-a1f0-4330-82fc-d19117bb55a6" "admin@example.com"
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantAdminAccess(userId: string, email: string) {
  try {
    console.log('🔐 Granting admin access...');
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${email}`);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('❌ User not found in users table');
      console.error('   Make sure the user has signed up and accepted GDPR consent');
      process.exit(1);
    }

    // Check if already admin
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingAdmin) {
      console.log('ℹ️  User is already an admin');
      process.exit(0);
    }

    // Grant admin access
    const { data, error } = await supabase
      .from('admins')
      .insert({
        user_id: userId,
        email: email,
        granted_by: null, // First admin, no granter
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to grant admin access:', error);
      process.exit(1);
    }

    console.log('✅ Admin access granted successfully!');
    console.log('   Admin ID:', data.id);
    console.log('   User can now access /admin dashboard');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const userId = process.argv[2];
const email = process.argv[3];

if (!userId || !email) {
  console.error('Usage: npx tsx scripts/grant-admin.ts <user_id> <email>');
  console.error('');
  console.error('Example:');
  console.error('  npx tsx scripts/grant-admin.ts "12311a6c-a1f0-4330-82fc-d19117bb55a6" "admin@example.com"');
  process.exit(1);
}

grantAdminAccess(userId, email);
