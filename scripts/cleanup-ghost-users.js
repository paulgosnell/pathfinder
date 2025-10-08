#!/usr/bin/env node

/**
 * Cleanup script for ghost users created by voice mode bug
 *
 * This script identifies and removes user records that were created
 * without corresponding Supabase Auth accounts (ghost users).
 *
 * SAFETY: Only deletes users table records. Due to CASCADE constraints,
 * this will also clean up associated sessions, profiles, and conversations.
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupGhostUsers() {
  console.log('🔍 Starting ghost user cleanup...\n');

  try {
    // Get all users from auth system
    console.log('1. Fetching authenticated users from Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Failed to fetch auth users: ${authError.message}`);
    }

    const validUserIds = new Set(authData.users.map(u => u.id));
    console.log(`   ✓ Found ${validUserIds.size} authenticated users\n`);

    // Get all users from users table
    console.log('2. Fetching user records from database...');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, created_at');

    if (dbError) {
      throw new Error(`Failed to fetch database users: ${dbError.message}`);
    }

    console.log(`   ✓ Found ${dbUsers.length} user records in database\n`);

    // Identify ghost users (in DB but not in auth)
    const ghostUsers = dbUsers.filter(user => !validUserIds.has(user.id));

    console.log('3. Analysis:');
    console.log(`   Valid users: ${dbUsers.length - ghostUsers.length}`);
    console.log(`   Ghost users: ${ghostUsers.length}`);

    if (ghostUsers.length === 0) {
      console.log('\n✅ No ghost users found! Database is clean.');
      return;
    }

    console.log('\n4. Ghost user sample (first 5):');
    ghostUsers.slice(0, 5).forEach((user, i) => {
      console.log(`   ${i + 1}. ID: ${user.id.substring(0, 8)}... (created: ${user.created_at})`);
    });

    // Confirm deletion
    console.log(`\n⚠️  WARNING: About to delete ${ghostUsers.length} ghost users and all associated data.`);
    console.log('   This includes:');
    console.log('   - User records');
    console.log('   - User profiles');
    console.log('   - Agent sessions');
    console.log('   - Conversation history');
    console.log('   - Strategy usage records');

    // In a real scenario, you'd want confirmation here
    // For now, we'll add a dry-run mode
    const isDryRun = process.argv.includes('--dry-run');

    if (isDryRun) {
      console.log('\n🔍 DRY RUN MODE: No changes will be made.');
      console.log(`   Would delete ${ghostUsers.length} ghost users.`);
      return;
    }

    // Delete ghost users (CASCADE will clean up related records)
    console.log('\n5. Deleting ghost users...');
    const ghostUserIds = ghostUsers.map(u => u.id);

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .in('id', ghostUserIds);

    if (deleteError) {
      throw new Error(`Failed to delete ghost users: ${deleteError.message}`);
    }

    console.log(`   ✓ Successfully deleted ${ghostUsers.length} ghost users\n`);
    console.log('✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run cleanup
if (require.main === module) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nMake sure .env.local is loaded or set these variables.');
    process.exit(1);
  }

  cleanupGhostUsers();
}

module.exports = { cleanupGhostUsers };
