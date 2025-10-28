# Complete Workflow Guide - Pathfinder Project Management

This guide explains the complete project management system for Pathfinder, including user testing, backlog management, and sprint planning.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [UAT Workflow (User Testing)](#uat-workflow-user-testing)
3. [Backlog Workflow (Features)](#backlog-workflow-features)
4. [Sprint Planning Process](#sprint-planning-process)
5. [Triage Frameworks](#triage-frameworks)
6. [File Organization](#file-organization)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

### Philosophy

**Collect First, Action Later** - Don't immediately fix bugs or build features. Batch review for efficiency and strategic thinking.

### Two Parallel Systems

| Aspect | UAT Workflow (`/uat`) | Backlog Workflow (`/backlog`) |
|--------|----------------------|-------------------------------|
| **Purpose** | Bugs, UX issues, user complaints | Features, enhancements, ideas |
| **Source** | Real user feedback (in-app, email) | Product owner ideas, user requests |
| **Storage** | `docs/feedback/` | `docs/backlog/` |
| **Database** | Supabase `user_feedback` table | File-based only |
| **Urgency** | Some items need immediate fix (Tier 1) | All items can wait for grooming |
| **Cadence** | Weekly triage | Bi-weekly grooming, ad-hoc sprints |

---

## UAT Workflow (User Testing)

### Step 1: Collection

**Three Collection Methods:**

1. **In-App Feedback Form** (Automatic)
   - Users rate 1-10 + write feedback
   - Stored in Supabase `user_feedback` table
   - Retrieved via: `/uat check the database`

2. **Direct Communication** (Manual)
   - Email, WhatsApp, Slack, verbal
   - Command: `/uat [paste exact user words]`
   - Logged in: `docs/feedback/raw-notes.md`

3. **Session Observation** (Structured)
   - Watching user sessions
   - Use template: `docs/feedback/TEMPLATE.md`
   - Save as: `docs/feedback/YYYY-MM-DD-session.md`

**Example - Quick Dump:**
```
You: "/uat Sarah emailed: The voice button is hard to find on mobile"
Agent: "Logged in raw-notes.md. Keep dumping or ready to triage?"
You: "Keep going. Also John said the chat loads slowly..."
Agent: "Logged. Anything else?"
```

**Example - Database Check:**
```
You: "/uat check the database"
Agent: "Found 3 new submissions since last check:
        1. Rating 4/10 - Discovery loop bug
        2. Rating 9/10 - Love the coaching approach
        3. Rating 3/10 - Voice mode crashes on iPhone

        Want to triage now or keep collecting?"
```

### Step 2: Triage (When Ready)

**Command:** `/uat let's triage`

**Agent will:**
1. Read all items from raw-notes.md + database
2. Categorize using 4-tier system (see Triage Frameworks below)
3. Flag Tier 1 items (critical/blocking/quick wins)
4. Ask: "Fix Tier 1 now or add all to backlog?"

**Example:**
```
You: "/uat let's triage"
Agent: "Found 8 items to triage:

        TIER 1 (Action Now):
        #1 - Discovery loop bug (blocking UX)
        #3 - Voice crashes on iPhone (critical bug)
        #7 - Missing back button (quick win, <30 min)

        TIER 2 (Backlog):
        #2 - Better mobile layout
        #5 - Export conversation to PDF

        TIER 3 (Future):
        #4 - Dark mode support

        TIER 4 (Won't Fix):
        #6 - Make sessions 10 minutes instead of 50 (conflicts with coaching philosophy)

        Fix Tier 1 now (3 items, ~2 hours)?"
```

### Step 3: Action

**Tier 1 Only:**
- Fix immediately
- Deploy to production
- Notify user if possible
- Mark complete in feedback log

**Tier 2-3:**
- Move to `docs/USER-TESTING.md` backlog section
- No immediate action
- Review in weekly backlog grooming

**Tier 4:**
- Document why rejected
- Move to "Rejected Ideas" in USER-TESTING.md
- Close feedback item

---

## Backlog Workflow (Features)

### Step 1: Collection

**Quick Dump (Default):**
```
You: "/backlog Add session bookmarking so users can save important conversations"
Agent: "Logged in ideas.md with timestamp. Keep adding?"

You: "/backlog Also need better mobile layout for voice mode"
Agent: "Logged. Anything else?"

You: "/backlog Export conversation history to PDF for sharing with doctors"
Agent: "Logged. 3 ideas collected. Groom now or later?"
```

**Batch Paste:**
```
You: "/backlog Here's 10 ideas from user emails: [paste all 10]"
Agent: [Logs all 10 separately with timestamps]
Agent: "10 ideas logged. Ready to groom or keep collecting?"
```

### Step 2: Grooming

**Command:** `/backlog let's groom`

**Agent will:**
1. Read all items from `docs/backlog/ideas.md`
2. Categorize by type (Features, Enhancements, Tech Debt, Content, UX)
3. Estimate effort using T-shirt sizing (XS/S/M/L/XL)
4. Score impact (Critical/High/Medium/Low)
5. Suggest priorities (Quick Wins, Strategic Bets, Long-term Value)
6. Move items to `docs/BACKLOG.md` in prioritized sections

**Example:**
```
You: "/backlog let's groom"
Agent: "Found 12 items to groom:

        FEATURES (5 items):
        - Session bookmarking [High impact, S effort] → Quick Win
        - PDF export [Medium impact, M effort] → Long-term
        - Medication tracking [High impact, XL effort] → Break down?
        - Parent dashboard [Medium impact, L effort] → Long-term
        - Multi-child support [Critical impact, L effort] → Strategic Bet

        UX/UI (4 items):
        - Better mobile layout [High impact, S effort] → Quick Win
        - Dark mode [Low impact, M effort] → Nice-to-have
        - Voice button placement [High impact, XS effort] → Quick Win
        - Loading states [Medium impact, XS effort] → Quick Win

        TECH DEBT (3 items):
        - Database query optimization [Medium impact, M effort]
        - TypeScript strict mode [Low impact, L effort]
        - Component refactoring [Low impact, M effort]

        QUICK WINS IDENTIFIED (4 items, ~1 day total):
        1. Voice button placement (XS)
        2. Loading states (XS)
        3. Session bookmarking (S)
        4. Mobile layout (S)

        STRATEGIC BETS (2 items):
        1. Multi-child support (L) - Unlocks parent with 2+ kids use case
        2. Medication tracking (XL) - High user request

        Updated BACKLOG.md with all items.
        Ready to plan a sprint or keep collecting?"
```

### Step 3: Sprint Planning

**Command:** `/backlog let's plan a sprint`

**Agent will:**
1. Review prioritized items in BACKLOG.md
2. Suggest 3-5 items balancing quick wins + strategic work
3. Estimate total sprint effort (aim: 1-2 days)
4. Create acceptance criteria for each item
5. Create sprint doc: `docs/backlog/sprint-YYYY-MM-DD.md`
6. Get approval before starting

**Example:**
```
You: "/backlog let's plan a sprint"
Agent: "Reviewing backlog... Recommending Sprint 1:

        PROPOSED SPRINT (1.5 days estimated):

        1. Voice button placement (XS - 1 hour)
           - Move voice button to top-right header
           - Make it visible on all pages
           - Add tooltip 'Try voice mode'

        2. Loading states (XS - 1 hour)
           - Add spinner when bot is thinking
           - Disable input during processing
           - Show 'Typing...' indicator

        3. Session bookmarking (S - 3 hours)
           - Add star icon to session list
           - Filter to show favorites only
           - Persist to database

        4. Better mobile layout (S - 4 hours)
           - Responsive voice mode UI
           - Fix chat bubble wrapping
           - Touch-friendly button sizing

        Total: ~9 hours (1.5 days)
        Mix: 50% Quick Wins, 50% UX Improvements

        Create sprint doc and start building?"
```

### Step 4: Execution

**Agent will:**
1. Create `docs/backlog/sprint-YYYY-MM-DD.md`
2. Mark items as "In Progress" in BACKLOG.md
3. Build each item with tests
4. Update sprint doc with progress
5. Mark complete as shipped
6. Update BACKLOG.md "Completed" section

---

## Sprint Planning Process

### Sprint Structure

**Sprint Length:** Flexible (1-3 days typically)
**Sprint Goals:** Mix of quick wins (30%) + strategic work (70%)
**Sprint Review:** End of sprint, demo new features, gather feedback

### Sprint Doc Template

Created at: `docs/backlog/sprint-YYYY-MM-DD.md`

```markdown
# Sprint - [Date]

**Duration**: X days
**Goal**: [Brief sprint goal]

## Items

### 1. [Item Name] (Effort: XS)
**Status**: In Progress / Done
**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

**Implementation Notes**:
- What was built
- Decisions made
- Issues encountered

**Shipped**: YYYY-MM-DD
**Commit**: [hash]

---

## Sprint Retrospective

**What went well**:
-

**What didn't**:
-

**Learnings**:
-

**Next sprint ideas**:
-
```

---

## Triage Frameworks

### UAT Triage (4-Tier System)

**Tier 1: Action Immediately**
- **Critical bugs**: App crashes, data loss, broken core flows
- **Safety issues**: Crisis detection failures, harmful responses
- **Blocking UX**: Users can't complete primary tasks
- **Quick wins**: <1 hour fixes with high user impact

**Tier 2: Backlog (Next Sprint)**
- **Feature requests**: Valuable but not blocking
- **UX improvements**: Non-blocking friction points
- **Performance issues**: Slow but functional
- **Content gaps**: Missing strategies or help text

**Tier 3: Future Enhancements**
- **Nice to have**: Low priority improvements
- **Out of scope**: Doesn't align with core mission
- **Research needed**: Unclear problem or solution

**Tier 4: Won't Fix**
- **Philosophy conflicts**: User wants advice-giving, not coaching
- **Technical limitations**: Can't be solved with current stack
- **Edge cases**: Extremely rare, minimal impact

### Backlog Prioritization

**Priority Matrix:**

| Impact | Effort XS/S | Effort M | Effort L/XL |
|--------|-------------|----------|-------------|
| **Critical** | Do First | Do Soon | Break Down or Strategic Bet |
| **High** | Quick Win | Plan Sprint | Long-term Value |
| **Medium** | Quick Win | Backlog | Nice-to-have |
| **Low** | Maybe | Probably Not | Never |

**Quick Wins**: High/Medium Impact + XS/S Effort → Prioritize
**Strategic Bets**: Critical Impact + Any Effort → Must do eventually
**Long-term Value**: Medium Impact + M/L Effort → Backlog for later
**Nice-to-haves**: Low Impact + Any Effort → Icebox

---

## File Organization

### Feedback Files

```
docs/feedback/
├── raw-notes.md              # Quick dumps (append-only)
├── TEMPLATE.md               # Template for structured sessions
└── 2025-10-28-sarah.md       # Dated session logs
```

**When to use which:**
- **raw-notes.md**: Quick verbal feedback, emails, Slack messages
- **TEMPLATE.md**: Copy for structured usability testing sessions
- **Dated files**: Full session observations with multiple users

### Backlog Files

```
docs/backlog/
├── ideas.md                  # Raw idea dumps (append-only)
└── sprint-2025-10-28.md      # Sprint planning docs
```

**Lifecycle:**
1. Ideas start in `ideas.md` (raw, unformatted)
2. After grooming, move to `../BACKLOG.md` (organized, prioritized)
3. When sprint planned, create `sprint-YYYY-MM-DD.md`
4. When shipped, update `BACKLOG.md` Completed section

---

## Troubleshooting

### "I forgot which workflow to use"

**Is it a problem users are experiencing right now?** → `/uat`
**Is it an idea for something new?** → `/backlog`

### "Agent is trying to fix things immediately"

**Say:** "Don't fix yet, just log it"
**Check:** CLAUDE.md should say "Default mode: COLLECT"
**Fix:** Re-run `/uat` or `/backlog` to reload context

### "I can't find old feedback/ideas"

**Feedback:** Check `docs/feedback/raw-notes.md` + Supabase database
**Ideas:** Check `docs/backlog/ideas.md` + `docs/BACKLOG.md` Icebox section

### "Backlog is getting too big"

**Run:** `/backlog let's groom`
**Action:** Archive or reject items >3 months old
**Move:** Old ideas to `BACKLOG.md` "Rejected Ideas" section with reasons

### "Sprint took longer than estimated"

**Update:** Sprint velocity tracking in BACKLOG.md
**Adjust:** Future estimates based on actual time taken
**Review:** What caused delays? Break down L/XL items more?

---

## Best Practices

### Collection Phase
✅ **Do**: Dump everything raw, typos and all
✅ **Do**: Add timestamps and source attribution
✅ **Do**: Capture exact user words
❌ **Don't**: Edit or rewrite user feedback
❌ **Don't**: Prioritize during collection
❌ **Don't**: Start building immediately

### Grooming Phase
✅ **Do**: Batch review 5-10+ items at once
✅ **Do**: Estimate effort honestly (include testing, docs)
✅ **Do**: Consider impact on real users
✅ **Do**: Ask clarifying questions if vague
❌ **Don't**: Overthink estimates (t-shirt sizing is approximate)
❌ **Don't**: Commit to building everything
❌ **Don't**: Let backlog grow >50 items (prune regularly)

### Sprint Planning Phase
✅ **Do**: Balance quick wins + strategic work
✅ **Do**: Create clear acceptance criteria
✅ **Do**: Aim for 1-2 days total effort
✅ **Do**: Get explicit approval before starting
❌ **Don't**: Pack too much into one sprint
❌ **Don't**: Skip acceptance criteria
❌ **Don't**: Start without reviewing current backlog

---

**Last Updated**: 2025-10-28
**Version**: 1.0
