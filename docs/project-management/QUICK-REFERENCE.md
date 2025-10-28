# Quick Reference - Project Management Cheat Sheet

**One-page guide to UAT and Backlog workflows.** Bookmark this!

---

## 🎯 Which Workflow?

| If you have... | Use... |
|----------------|--------|
| **Bug report** | `/uat` |
| **UX complaint** | `/uat` |
| **User feedback from app** | `/uat check the database` |
| **Feature idea** | `/backlog` |
| **Enhancement request** | `/backlog` |
| **Tech debt item** | `/backlog` |

---

## 💬 UAT Workflow Commands

```bash
/uat                           # Load UAT context
/uat check the database        # Pull feedback from Supabase
/uat [paste feedback]          # Log verbal/written feedback
/uat let's triage              # Batch review and categorize
```

### UAT Triage Tiers

| Tier | What | Action |
|------|------|--------|
| **1** | Critical bugs, blocking UX, quick wins | Fix immediately |
| **2** | Feature requests, UX improvements | Next sprint |
| **3** | Nice-to-haves, research needed | Future |
| **4** | Won't fix (conflicts, edge cases) | Reject with reason |

### UAT Files

- `docs/feedback/raw-notes.md` - Quick dumps
- `docs/feedback/YYYY-MM-DD-session.md` - Session logs
- `docs/USER-TESTING.md` - Triage framework
- Supabase `user_feedback` table - In-app submissions

---

## 🚀 Backlog Workflow Commands

```bash
/backlog [idea]                # Quick dump feature idea
/backlog let's groom           # Categorize and prioritize all ideas
/backlog let's plan a sprint   # Select items and create sprint plan
```

### Backlog Priority Matrix

| Impact ↓ / Effort → | XS/S | M | L/XL |
|---------------------|------|---|------|
| **Critical** | Do First | Do Soon | Break Down |
| **High** | Quick Win ⭐ | Plan Sprint | Long-term |
| **Medium** | Quick Win ⭐ | Backlog | Nice-to-have |
| **Low** | Maybe | Probably Not | Never |

⭐ = **Quick Wins** - Prioritize these!

### T-Shirt Sizing

- **XS**: <1 hour
- **S**: 1-3 hours
- **M**: 3-8 hours (half to full day)
- **L**: 1-2 days
- **XL**: 3+ days (break down into smaller items)

### Backlog Files

- `docs/backlog/ideas.md` - Raw idea dumps
- `docs/backlog/sprint-YYYY-MM-DD.md` - Sprint docs
- `docs/BACKLOG.md` - Organized, prioritized backlog

---

## 📋 Typical Workflows

### Collect User Feedback
```
1. User submits in-app feedback
2. /uat check the database
3. Review feedback
4. "Keep collecting" or "Let's triage"
```

### Dump Feature Ideas
```
1. Get email with 5 ideas
2. /backlog [paste all 5 ideas]
3. Agent logs to ideas.md
4. Continue work, groom later
```

### Weekly Triage Session
```
1. /uat check the database
2. Review all new feedback
3. /uat let's triage
4. Fix Tier 1 items
5. Move Tier 2+ to backlog
```

### Bi-Weekly Backlog Grooming
```
1. /backlog let's groom
2. Agent categorizes all ideas
3. Estimates effort + impact
4. Updates BACKLOG.md
5. Identifies quick wins
```

### Sprint Planning
```
1. /backlog let's plan a sprint
2. Agent suggests 3-5 items (1-2 days work)
3. Review acceptance criteria
4. Approve sprint
5. Agent creates sprint doc and builds
```

---

## 📁 File Locations

### Feedback
```
docs/
├── feedback/
│   ├── raw-notes.md          # Append here for quick dumps
│   └── YYYY-MM-DD-*.md       # Session logs
└── USER-TESTING.md           # Triage process docs
```

### Backlog
```
docs/
├── backlog/
│   ├── ideas.md              # Append here for quick dumps
│   └── sprint-*.md           # Sprint planning docs
└── BACKLOG.md                # Organized backlog
```

### Project Management
```
docs/project-management/
├── README.md                 # Navigation hub
├── WORKFLOW-GUIDE.md         # Complete guide (detailed)
└── QUICK-REFERENCE.md        # This file (one-page)
```

---

## 🔍 Default Behaviors

### UAT
- ✅ **Collect feedback** - Don't fix immediately
- ✅ **Batch triage** - Review 5-10 items at once
- ✅ **Fix Tier 1 only** - Rest goes to backlog
- ❌ **Don't action Tier 2-4** during triage

### Backlog
- ✅ **Dump ideas** - No immediate building
- ✅ **Batch grooming** - Categorize many at once
- ✅ **Sprint planning approval** - Get OK before building
- ❌ **Don't build without grooming** - Prioritize first

---

## 🆘 Common Issues

**"Agent is trying to fix things immediately"**
→ Say: "Don't fix yet, just log it"
→ Re-run `/uat` or `/backlog` to reload context

**"Can't remember which file to use"**
→ See table above
→ When in doubt: raw-notes.md (UAT) or ideas.md (Backlog)

**"Backlog is huge and overwhelming"**
→ Run `/backlog let's groom`
→ Archive/reject items >3 months old

**"Lost track of what we're building"**
→ Check latest `sprint-*.md` file
→ Check BACKLOG.md "In Progress" section

---

## 🎓 For New Claude Sessions

Load context instantly:
```bash
/uat       # If working on user feedback
/backlog   # If working on features
```

Check current phase:
```bash
# Read CLAUDE.md "Current Phase" section
```

---

## 📊 Success Metrics

**UAT:**
- Time to fix Tier 1 bugs: <7 days
- User satisfaction trend: Rating averages over time

**Backlog:**
- Sprint velocity: Effort completed per sprint
- Quick win ratio: 30%+ XS/S items in backlog

---

## 💡 Pro Tips

1. **Morning routine**: `/uat check the database` to see overnight feedback
2. **End of week**: `/uat let's triage` + `/backlog let's groom`
3. **Before coding**: Always groom backlog first to ensure priorities
4. **Keep raw-notes clean**: One line per feedback item, timestamp each
5. **Sprint size**: Aim for 1-2 days, not full week (allows flexibility)

---

**Last Updated**: 2025-10-28
**Bookmark this page**: `docs/project-management/QUICK-REFERENCE.md`
