# Database Cleanup - October 2025

## Overview

Audit completed on 2025-10-08 to identify and remove unused database tables and dead code.

**Result**: Removed 5 empty tables (0 rows each) that were created for monitoring/analytics features but never fully implemented.

---

## Audit Findings

### Tables Before Cleanup: 11
### Tables After Cleanup: 6

### Removed Tables (Dead Code)

| Table | Purpose | Why Removed |
|-------|---------|-------------|
| `agent_decisions` | Log AI decision-making for analysis | Code exists in `lib/monitoring/agent-monitor.ts` but never called |
| `strategy_usage` | Track which ADHD strategies parents try | No insert/update logic exists |
| `agent_errors` | Log AI agent errors for debugging | `logError()` method exists but never called in try/catch blocks |
| `agent_tool_usage` | Track which AI tools are used | `saveToolUsage()` method exists but never called by agent tools |
| `agent_daily_stats` | Aggregate daily usage metrics | Had broken upsert logic, never successfully populated |

### Remaining Active Tables (Kept)

| Table | Rows | Purpose |
|-------|------|---------|
| `users` | 5 | Auth users + GDPR consent tracking |
| `agent_sessions` | 10 | Coaching session metadata (GROW model state) |
| `agent_conversations` | 162 | Chat/voice conversation transcripts |
| `agent_performance` | 75 | Token usage and cost tracking per session |
| `user_profiles` | 3 | Learned context about users (child age, triggers, etc.) |
| `waitlist_signups` | 0 | Landing page email signups (new feature, expected empty) |

---

## Code Changes

### Files Deleted
- `lib/monitoring/agent-monitor.ts` - AgentMonitor class with `logAgentDecision()` method (never called)

### Files Modified

**lib/database/performance.ts**
- Removed interfaces: `AgentErrorData`, `ToolUsageData`, `AuthEventData`
- Removed methods:
  - `logError()` - agent_errors table dropped
  - `saveToolUsage()` - agent_tool_usage table dropped
  - `updateDailyStats()` - agent_daily_stats table dropped
  - `getDailyStats()` - agent_daily_stats table dropped
  - `getUsageReport()` - agent_daily_stats table dropped
  - `getToolUsageStats()` - agent_tool_usage table dropped
  - `getErrorReport()` - agent_errors table dropped
  - `recordAuthEvent()` - auth_event_logs table never existed

**Remaining functionality:**
- `savePerformanceMetrics()` - Still works, saves to `agent_performance` table

---

## Schema Cleanup

### Duplicate Column Resolution

**Problem**: Migration `03-user-profiles-discovery.sql` added columns to both `users` table AND created `user_profiles` table with overlapping fields.

**Solution**: Dropped duplicate columns from `users` table, kept `user_profiles` as single source of truth.

**Columns removed from `users` table:**
- `child_age_range`
- `child_triggers`
- `child_patterns`
- `parent_stress_patterns`
- `home_environment`
- `tried_solutions`
- `successful_strategies`
- `parent_preferences`

**Impact**: None - code already uses `user_profiles` table exclusively (see `app/api/chat/route.ts:186`)

### Old Discovery Phase Cleanup

**Columns removed from `agent_sessions` table:**
- `discovery_phase_complete` - Old 3-4 question system
- `questions_asked` - Old 3-4 question system
- `context_gathered` - Old 3-4 question system

**Kept columns:**
- `current_challenge` - Still used in GROW model
- `parent_stress_level` - Still used in GROW model

---

## Migration Instructions

### Step 1: Review Migration File
```bash
cat adhd-support-agent/migrations/cleanup-dead-tables.sql
```

### Step 2: Apply Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `migrations/cleanup-dead-tables.sql`
4. Run migration

### Step 3: Verify Cleanup
```sql
-- Should show 6 tables (down from 11)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show 3+ rows
SELECT COUNT(*) FROM user_profiles;

-- Should NOT include duplicate columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public';
```

---

## Why This Happened

1. **Ambitious monitoring scope**: Migration `02-performance-schema.sql` created 5 analytics tables but only 1 was fully wired up
2. **Incomplete implementation**: Code interfaces created but no callsites added to production code
3. **Schema drift**: Migration `03-user-profiles-discovery.sql` added columns to `users`, then ALSO created `user_profiles` with same data model
4. **No cleanup**: Old features were planned but never completed, tables left empty

---

## Future Recommendations

### Before Creating New Tables
1. **Check if really needed**: Don't create tables for "nice to have" features
2. **Implement fully or don't implement**: Partial implementations create dead code
3. **Use MCP to verify**: Always check actual schema before writing migrations (see CLAUDE.md)

### Monitoring Strategy
If you need monitoring in the future:
- Start with simple logging to `agent_performance` table (already works)
- Add new tables only when you have specific queries you need to answer
- Wire up code at the same time as creating tables (not later)

---

## Related Files

- [migrations/cleanup-dead-tables.sql](migrations/cleanup-dead-tables.sql) - SQL migration
- [CLAUDE.md](../CLAUDE.md#recent-major-updates) - Updated with cleanup notes
- [lib/database/performance.ts](lib/database/performance.ts) - Simplified after cleanup
