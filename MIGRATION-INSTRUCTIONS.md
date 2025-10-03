# Database Migration Instructions - Coaching Transformation

## What This Migration Does

Transforms the chatbot from a **discovery-first** (3-4 questions) approach to a **coaching-first** (50-minute GROW model) approach.

### Changes:
- ❌ Removes: `discovery_phase_complete`, `questions_asked`, `context_gathered`
- ✅ Adds: GROW model coaching state columns
  - `current_phase` (goal, reality, options, will, closing)
  - `reality_exploration_depth` (tracks conversation depth)
  - `emotions_reflected` (has coach validated feelings?)
  - `exceptions_explored` (has coach asked about when it works?)
  - `strengths_identified` (what's working well)
  - `parent_generated_ideas` (their ideas, not bot's)
  - `ready_for_options` (only true after 10+ exchanges)

---

## How to Apply the Migration

### Option 1: Supabase SQL Editor (Recommended)

1. **Open your Supabase SQL Editor:**
   https://supabase.com/dashboard/project/ewxijeijcgaklomzxzte/sql

2. **Copy the entire SQL from:**
   `migrations/add-coaching-state-columns.sql`

3. **Paste and run it** in the SQL Editor

4. **Verify it worked:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'agent_sessions'
   ORDER BY ordinal_position;
   ```

   You should see the new columns listed.

---

### Option 2: Supabase CLI (If installed)

```bash
# From project root
cd adhd-support-agent

# Login to Supabase (if not already)
supabase login

# Link to your project
supabase link --project-ref ewxijeijcgaklomzxzte

# Run the migration
supabase db push --include-all migrations/add-coaching-state-columns.sql
```

---

## Verification Steps

After running the migration:

### 1. Check Columns Exist
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'agent_sessions'
AND column_name IN (
  'current_phase',
  'reality_exploration_depth',
  'emotions_reflected',
  'exceptions_explored',
  'ready_for_options'
);
```

Should return 5 rows.

### 2. Check Old Columns Removed
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'agent_sessions'
AND column_name IN (
  'discovery_phase_complete',
  'questions_asked',
  'context_gathered'
);
```

Should return 0 rows.

### 3. Check Existing Sessions Updated
```sql
SELECT id, current_phase, reality_exploration_depth, ready_for_options
FROM agent_sessions
LIMIT 5;
```

All sessions should have:
- `current_phase = 'goal'`
- `reality_exploration_depth = 0`
- `ready_for_options = false`

---

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Restore old columns
ALTER TABLE agent_sessions
  ADD COLUMN IF NOT EXISTS discovery_phase_complete BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS questions_asked INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS context_gathered JSONB DEFAULT '{}';

-- Remove new columns
ALTER TABLE agent_sessions
  DROP COLUMN IF EXISTS current_phase,
  DROP COLUMN IF EXISTS reality_exploration_depth,
  DROP COLUMN IF EXISTS emotions_reflected,
  DROP COLUMN IF EXISTS exceptions_explored,
  DROP COLUMN IF EXISTS strengths_identified,
  DROP COLUMN IF EXISTS parent_generated_ideas,
  DROP COLUMN IF EXISTS ready_for_options;

-- Drop constraint
ALTER TABLE agent_sessions
  DROP CONSTRAINT IF EXISTS valid_phase;
```

---

## Migration Status

- [ ] Migration SQL run in Supabase
- [ ] Columns verified
- [ ] Old columns removed
- [ ] Existing sessions updated
- [ ] Application tested with new schema

---

## Support

If you encounter errors:

1. **Check Supabase logs** in Dashboard → Database → Logs
2. **Verify table exists:**
   ```sql
   SELECT * FROM agent_sessions LIMIT 1;
   ```
3. **Check for active connections** that might lock the table

---

**Created:** 2025-10-03
**Migration File:** `migrations/add-coaching-state-columns.sql`
