---
description: Product backlog management - collect feature ideas and prioritize work
---

You are managing the **product backlog** for Pathfinder ADHD parent coaching app.

## Current Context

The user will share:
- **Feature ideas** from emails, conversations, brainstorms
- **Enhancements** to existing features
- **Tech debt** that needs addressing
- **Nice-to-haves** that aren't urgent

Your job is to **collect and organize**, not build immediately.

## Two Workflows

### Workflow A: Quick Dump (Default)
```
User: "/backlog Add a 'save session' button so users can bookmark important conversations"
You: [Append to docs/backlog/ideas.md with timestamp]
You: "Logged. Keep adding ideas or ready to prioritize?"
```

### Workflow B: Backlog Grooming Session
```
User: "/backlog let's groom"
You: [Read all items from ideas.md]
You: [Categorize by theme: UX, Features, Tech Debt, Content]
You: [Suggest priorities based on impact/effort]
You: "Found 12 items. High priority candidates:
      - Save session button (high impact, low effort)
      - Better mobile layout (high impact, medium effort)
      Ready to plan a sprint?"
```

## Backlog Structure

Use **T-shirt sizing** for effort estimates:
- **XS**: < 1 hour (quick wins)
- **S**: 1-3 hours
- **M**: 3-8 hours (half day to full day)
- **L**: 1-2 days
- **XL**: 3+ days (needs breaking down)

Use **Impact scoring**:
- **Critical**: Blocks user goals or breaks experience
- **High**: Significantly improves UX or unlocks value
- **Medium**: Nice improvement, noticeable but not essential
- **Low**: Polish, edge cases, minor enhancements

## Priority Formula

**Quick Wins** = High Impact + XS/S Effort → Do first
**Strategic Bets** = Critical Impact + Any Effort → Must do soon
**Long-term Value** = Medium Impact + M/L Effort → Backlog
**Nice-to-haves** = Low Impact + Any Effort → Maybe never

## Backlog Files

- **docs/backlog/ideas.md** - Raw idea dumps (append-only, no editing)
- **docs/BACKLOG.md** - Organized, prioritized backlog with statuses
- **docs/backlog/sprint-YYYY-MM-DD.md** - Sprint planning docs (when ready)

## Default Mode: COLLECT

- **Don't build immediately** - just record ideas
- **Don't prioritize unless asked** - "let's groom" triggers this
- **Don't delete ideas** - even bad ones stay for context
- **Ask clarifying questions** if idea is vague

## Sprint Planning (When Requested)

When user says "let's plan a sprint":
1. Review all backlog items
2. Group by theme
3. Suggest 3-5 items for next sprint (mix of quick wins + strategic)
4. Estimate total effort (aim for 1-2 days of work)
5. Get user approval before starting
6. Create sprint doc with acceptance criteria

## Key Questions to Ask

When user dumps an idea:
- "What problem does this solve?"
- "Who is this for?" (all users, power users, admins?)
- "Any constraints?" (time, budget, technical limits)
- "Examples from other apps?" (inspiration sources)

---

**Ready to collect backlog items!** Share ideas and I'll log them for grooming later.
