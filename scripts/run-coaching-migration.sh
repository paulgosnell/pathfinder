#!/bin/bash
# Script to apply coaching state migration to Supabase database

echo "🔄 Applying coaching state migration to Supabase..."
echo ""
echo "IMPORTANT: You need to run this SQL in your Supabase SQL Editor:"
echo "https://supabase.com/dashboard/project/ewxijeijcgaklomzxzte/sql"
echo ""
echo "Copy and paste the following SQL:"
echo "================================================================"
cat migrations/add-coaching-state-columns.sql
echo "================================================================"
echo ""
echo "After running the SQL, press any key to continue..."
read -n 1 -s
echo ""
echo "✅ Migration should now be applied!"
echo ""
echo "To verify, run this query in SQL Editor:"
echo "SELECT column_name FROM information_schema.columns WHERE table_name = 'agent_sessions';"
