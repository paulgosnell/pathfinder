#!/bin/bash

# Discovery Phase Migration Deployment Script
# This script applies the database migration for discovery-phase implementation

set -e  # Exit on error

echo "🚀 Starting Discovery Phase Migration Deployment"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "migrations/03-user-profiles-discovery.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "   Please run this script from the adhd-support-agent directory"
    exit 1
fi

echo "✅ Migration file found"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. You have two options:"
    echo ""
    echo "Option 1: Install Supabase CLI and run migration"
    echo "  brew install supabase/tap/supabase"
    echo "  supabase db push"
    echo ""
    echo "Option 2: Apply manually via Supabase Dashboard"
    echo "  1. Go to https://app.supabase.com"
    echo "  2. Select your project"
    echo "  3. Go to SQL Editor"
    echo "  4. Copy/paste: migrations/03-user-profiles-discovery.sql"
    echo "  5. Run the migration"
    echo ""
    read -p "Would you like to see the migration SQL now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat migrations/03-user-profiles-discovery.sql
    fi
    exit 0
fi

echo "✅ Supabase CLI found"
echo ""

# Check if Supabase project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Supabase project not linked"
    echo "   Run: supabase link --project-ref your-project-ref"
    exit 1
fi

echo "✅ Supabase project linked"
echo ""

# Ask for confirmation
echo "🔍 Migration Preview:"
echo "   - Creates user_profiles table"
echo "   - Adds discovery phase columns to agent_sessions"
echo "   - Adds profile columns to users table"
echo "   - Sets up proper indexes and RLS policies"
echo ""

read -p "Ready to apply migration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Applying migration..."
echo ""

# Apply the migration
supabase db push

echo ""
echo "✅ Migration applied successfully!"
echo ""

# Verify migration
echo "🔍 Verifying migration..."
echo ""

# Check if user_profiles table exists
if supabase db execute "SELECT COUNT(*) FROM user_profiles;" &> /dev/null; then
    echo "✅ user_profiles table created"
else
    echo "❌ user_profiles table not found"
fi

# Check if new columns exist in agent_sessions
if supabase db execute "SELECT discovery_phase_complete FROM agent_sessions LIMIT 1;" &> /dev/null; then
    echo "✅ agent_sessions columns added"
else
    echo "❌ agent_sessions columns not found"
fi

echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo ""
echo "Next Steps:"
echo "1. Deploy code changes: git push origin main"
echo "2. Verify deployment in production logs"
echo "3. Test with scenarios (see DISCOVERY-PHASE-IMPLEMENTATION.md)"
echo ""
echo "📚 Full documentation: DISCOVERY-PHASE-IMPLEMENTATION.md"
echo "================================================"

