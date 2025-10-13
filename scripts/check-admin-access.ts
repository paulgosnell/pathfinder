/**
 * Check Admin Access Script
 *
 * This script helps debug admin access issues by:
 * 1. Checking if you're logged in
 * 2. Showing your current user ID
 * 3. Checking if you're in the admins table
 *
 * Run with: npx tsx scripts/check-admin-access.ts
 */

import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkAdminAccess() {
  console.log('\n🔍 Checking Admin Access...\n');

  // Check if logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error('❌ Auth error:', authError.message);
    return;
  }

  if (!user) {
    console.log('❌ Not logged in');
    console.log('\n💡 To log in, visit: http://localhost:3000/auth/login');
    console.log('   Use email: p.gosnell@icloud.com\n');
    return;
  }

  console.log('✅ Logged in as:');
  console.log(`   Email: ${user.email}`);
  console.log(`   User ID: ${user.id}\n`);

  // Check admin table
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (adminError) {
    if (adminError.code === 'PGRST116') {
      console.log('❌ Not an admin');
      console.log(`\n💡 Your user ID (${user.id}) is not in the admins table.`);
      console.log('   Expected admin user ID: 12311a6c-a1f0-4330-82fc-d19117bb55a6');
      console.log('   Expected admin email: p.gosnell@icloud.com\n');

      if (user.id !== '12311a6c-a1f0-4330-82fc-d19117bb55a6') {
        console.log('⚠️  You are logged in with a different account!');
        console.log('   Please log out and log back in with: p.gosnell@icloud.com\n');
      }
    } else {
      console.error('❌ Error checking admin status:', adminError.message);
    }
    return;
  }

  if (adminData) {
    console.log('✅ You ARE an admin!');
    console.log(`   Admin ID: ${adminData.id}`);
    console.log(`   Granted at: ${adminData.granted_at}\n`);
    console.log('🎉 Admin dashboard should work at: http://localhost:3000/admin\n');
  }
}

checkAdminAccess().catch(console.error);
