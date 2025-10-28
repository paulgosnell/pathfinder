---
description: Load user testing context - collect and review feedback from database and conversations
---

You are working on Pathfinder, an ADHD parent coaching app currently in **active user testing phase (October 2025)**.

## Current Context

The user is collecting feedback from real ADHD parents. Your job is to:

1. **Pull feedback from Supabase** via MCP (`user_feedback` table)
2. **Record raw feedback** the user shares verbatim (don't action yet)
3. **Triage together** when user is ready (4-tier system)
4. **Only fix when explicitly asked** - default is "collect and organize"

## Two Workflows

### Workflow A: Review Database Feedback
```
User: "/uat check the database"
You: [Query user_feedback table via MCP]
You: [Show formatted summary of recent feedback]
You: "Ready to triage any of these?"
```

### Workflow B: Record Verbal/Written Feedback
```
User: "/uat Sarah said the voice mode was confusing"
You: [Record in docs/feedback/raw-notes.md]
You: "Logged. Keep dumping or ready to triage?"
```

## Triage Framework (When Requested)

**Tier 1 (Action Now)**: Critical bugs, safety issues, blocking UX, quick wins (<1 hour)
**Tier 2 (Backlog)**: Feature requests, UX improvements, performance, content gaps
**Tier 3 (Future)**: Nice to have, out of scope, research needed
**Tier 4 (Won't Fix)**: Philosophy conflicts, technical limitations, rare edge cases

## Database Access (Supabase MCP)

**SQL Query to Pull Feedback:**
```sql
SELECT
  id,
  rating,
  feedback_text,
  context,
  page_url,
  submitted_at,
  user_id,
  session_id
FROM user_feedback
ORDER BY submitted_at DESC;
```

**What to show user:**
- Rating (1-10)
- Feedback text (exact words)
- Page/context (chat, voice, etc.)
- Submitted date/time

## Raw Notes File

Use `docs/feedback/raw-notes.md` for quick dumps:
- Append to file, don't create new files each time
- Add timestamp headers
- Keep original formatting/typos
- Add source attribution (email, Slack, verbal, etc.)

## Testing Goals (Context)

- Validate coaching effectiveness (GROW/OARS approach)
- Identify UX friction points
- Voice vs Chat preference data
- Session length validation
- Crisis detection accuracy

## Key Documents

- [docs/USER-TESTING.md](docs/USER-TESTING.md) - Full testing process & triage details
- [docs/PROJECT-MASTER-DOC.md](docs/PROJECT-MASTER-DOC.md) - Complete technical context
- [docs/COACHING-METHODOLOGY.md](docs/COACHING-METHODOLOGY.md) - Coaching approach

## Default Mode: COLLECT, DON'T ACTION

- **Default**: Record feedback, don't fix yet
- **Only fix when user says**: "Let's fix this now" or "This is urgent"
- **Ask before triaging**: "Want to triage now or keep collecting?"

---

**Ready to collect feedback!** I can check the database or record what you share.
