# Database Migrations

This directory contains all database schema changes for the ADHD AI Coach application.

## 🗄️ Migration Files

Migrations are numbered sequentially and should be applied in order:

1. **`01-initial-schema.sql`** - Initial database setup
   - Creates core tables: `users`, `agent_sessions`, `agent_conversations`
   - Sets up RLS policies
   - Creates indexes and triggers
   - **Status:** ✅ Applied to production

2. **`02-performance-schema.sql`** - Performance monitoring
   - Creates performance tracking tables
   - Adds agent monitoring capabilities
   - **Status:** ✅ Applied to production

3. **`03-user-profiles-discovery.sql`** - Discovery phase implementation
   - Creates `user_profiles` table for learned context
   - Adds discovery phase tracking to `agent_sessions`
   - Enables personalized, context-aware coaching
   - **Status:** ✅ Applied to production

## 📋 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of the migration file
6. Paste into the SQL Editor
7. Click **Run** (or press `Cmd + Enter`)
8. Verify the migration succeeded

### Option 2: Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase

# Link your project
supabase link --project-ref your-project-ref

# Apply all pending migrations
supabase db push
```

### Option 3: Use the Helper Script

For the discovery phase migration specifically:

```bash
# From the adhd-support-agent directory
./scripts/apply-discovery-migration.sh
```

## ✅ Migration Verification

After applying a migration, verify it worked:

### Check Tables Created
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check Columns Added
```sql
-- Check agent_sessions columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agent_sessions';

-- Check user_profiles exists
SELECT COUNT(*) FROM user_profiles;
```

## 🔄 Migration History

| Date       | Migration | Description | Applied By |
|------------|-----------|-------------|------------|
| 2025-01-15 | 01 | Initial schema | Setup |
| 2025-01-20 | 02 | Performance monitoring | Paul |
| 2025-10-01 | 03 | Discovery phase & user profiles | Paul |

## 🚨 Important Notes

### Before Applying Migrations

- ✅ **Backup your database** (Supabase does this automatically, but double-check)
- ✅ **Test in development first** if possible
- ✅ **Read the migration file** to understand what changes will be made
- ✅ **Check for dependent code changes** - some migrations require code updates

### Migration Dependencies

- `02-performance-schema.sql` depends on `01-initial-schema.sql`
- `03-user-profiles-discovery.sql` depends on `01-initial-schema.sql`
- Apply migrations in numerical order!

### Rollback

If a migration fails or needs to be rolled back:

1. Check Supabase logs for the error
2. Fix any issues in the migration file
3. If tables were partially created, drop them manually:
   ```sql
   DROP TABLE IF EXISTS table_name CASCADE;
   ```
4. Reapply the corrected migration

## 🔒 Security Notes

- All tables have **Row Level Security (RLS)** enabled
- Users can only access their own data
- Service role is used for server-side operations
- Never expose service role key in client code

## 📝 Creating New Migrations

When adding new migrations:

1. **Name with next sequential number:**
   ```
   04-feature-name.sql
   ```

2. **Include header comment:**
   ```sql
   -- Migration: 04 - Feature Name
   -- Purpose: Brief description of what this migration does
   -- Dependencies: List any dependent migrations
   -- Date: YYYY-MM-DD
   ```

3. **Use safe patterns:**
   ```sql
   -- Create tables with IF NOT EXISTS
   CREATE TABLE IF NOT EXISTS new_table (...);
   
   -- Add columns with IF NOT EXISTS (PostgreSQL 9.6+)
   ALTER TABLE existing_table
   ADD COLUMN IF NOT EXISTS new_column TEXT;
   
   -- Create indexes idempotently
   CREATE INDEX IF NOT EXISTS idx_name ON table(column);
   ```

4. **Update this README:**
   - Add entry to migration list
   - Update migration history table
   - Document any special requirements

5. **Update code if needed:**
   - Check if TypeScript types need updating
   - Update API routes that query affected tables
   - Add tests for new functionality

## 🧪 Testing Migrations

Before applying to production:

```sql
-- Start a transaction (for testing)
BEGIN;

-- Copy/paste migration here
-- ...

-- Verify results
SELECT * FROM new_table LIMIT 1;

-- If everything looks good, commit
COMMIT;

-- If something went wrong, rollback
ROLLBACK;
```

## 📞 Support

If you encounter issues with migrations:

1. Check Supabase project logs
2. Verify you're connected to the correct project
3. Ensure you have the proper permissions
4. Review the migration file for syntax errors

## 🔗 Related Documentation

- [Database Schema](../docs/technical/comprehensive-data-model.md)
- [Technical Specification](../docs/technical/technical-specification.md)
- [Deployment Guide](../docs/deployment/deployment-guide.md)

---

**Last Updated:** October 1, 2025  
**Current Migration:** 03

