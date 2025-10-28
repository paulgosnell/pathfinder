# Project Management System - Pathfinder

**Purpose**: This folder contains all project management workflows, processes, and documentation for managing Pathfinder's development.

---

## 📚 Documentation Index

### Core Guides
- **[WORKFLOW-GUIDE.md](WORKFLOW-GUIDE.md)** - Complete guide to UAT, backlog, and sprint workflows ⭐ START HERE
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - One-page cheat sheet for slash commands and processes

### Process Documentation
- **[../USER-TESTING.md](../USER-TESTING.md)** - User testing process and feedback triage
- **[../BACKLOG.md](../BACKLOG.md)** - Product backlog with prioritized features

### Working Files
- **[../feedback/](../feedback/)** - User feedback collection and session notes
- **[../backlog/](../backlog/)** - Feature ideas and sprint planning docs

---

## 🚀 Quick Start

### For Paul (Product Owner)
**When you get user feedback:**
```bash
/uat check the database    # Pull from Supabase
/uat [paste feedback]      # Record verbal feedback
```

**When you have a feature idea:**
```bash
/backlog [idea description]
```

**When ready to prioritize work:**
```bash
/backlog let's groom
/backlog let's plan a sprint
```

### For Claude Agents (New Session)
**Load context with slash commands:**
- `/uat` - User testing context
- `/backlog` - Product backlog context

**Check CLAUDE.md first** for current project phase and priorities.

---

## 🗂️ Folder Structure

```
docs/
├── project-management/
│   ├── README.md                    # This file - navigation hub
│   ├── WORKFLOW-GUIDE.md            # Complete workflow documentation
│   └── QUICK-REFERENCE.md           # One-page cheat sheet
│
├── USER-TESTING.md                  # UAT process and triage framework
├── BACKLOG.md                       # Organized, prioritized backlog
│
├── feedback/
│   ├── raw-notes.md                 # Quick feedback dumps
│   ├── TEMPLATE.md                  # Session notes template
│   └── YYYY-MM-DD-session.md        # Dated session logs
│
└── backlog/
    ├── ideas.md                     # Raw feature idea dumps
    └── sprint-YYYY-MM-DD.md         # Sprint planning docs
```

---

## 🎯 System Overview

### Two Parallel Workflows

**1. User Testing & Feedback** (`/uat`)
- **Purpose**: Collect and triage bugs, UX issues, user pain points
- **Source**: In-app feedback form, emails, conversations
- **Storage**: `docs/feedback/`
- **Database**: Supabase `user_feedback` table
- **Cadence**: Continuous collection, weekly triage

**2. Product Backlog** (`/backlog`)
- **Purpose**: Collect and prioritize feature ideas, enhancements
- **Source**: Brainstorms, emails, strategic ideas
- **Storage**: `docs/backlog/`
- **Database**: None (file-based)
- **Cadence**: Continuous collection, bi-weekly grooming, sprint planning as needed

### Key Principles

✅ **Collect first, action later** - Don't fix/build immediately
✅ **Batch processing** - Review 5-10 items at once for efficiency
✅ **Clear separation** - Bugs (UAT) vs Features (Backlog)
✅ **Evidence-based** - Track impact, effort, and user sentiment
✅ **Session continuity** - Slash commands load full context instantly

---

## 📊 Workflow Stages

### Stage 1: Collection (Continuous)
- Dump feedback/ideas as they come in
- No prioritization, no immediate action
- Use raw-notes files for quick captures

### Stage 2: Grooming (Weekly/Bi-weekly)
- Categorize collected items
- Estimate effort (T-shirt sizing)
- Score impact (Critical/High/Medium/Low)
- Move to prioritized lists

### Stage 3: Sprint Planning (As Needed)
- Select 3-5 items from prioritized backlog
- Create acceptance criteria
- Estimate total sprint effort (1-2 days ideal)
- Get approval before starting

### Stage 4: Execution (Sprint Duration)
- Build selected items
- Track progress in sprint doc
- Mark items complete as shipped

### Stage 5: Review (End of Sprint)
- Demo completed work
- Gather feedback on new features
- Update backlog with learnings

---

## 🔄 Integration Points

### CLAUDE.md
- **Current Phase** section points to this system
- New agents learn workflows via slash commands
- Links to key documentation

### Supabase Database
- `user_feedback` table stores in-app submissions
- Retrieved via MCP in `/uat` workflow
- Pre-formatted for easy review

### Git Commits
- Sprint docs track what was shipped
- Feedback logs show what drove decisions
- Backlog shows what's coming next

---

## 📈 Success Metrics

Track these to improve the system:

**UAT Workflow:**
- Time from feedback → triage → fix (aim: <7 days for Tier 1)
- Feedback volume per week
- Bug recurrence rate
- User satisfaction trends (rating averages)

**Backlog Workflow:**
- Backlog age (flag items >3 months old)
- Sprint velocity (effort completed per sprint)
- Quick win ratio (30%+ XS/S items)
- Feature adoption (usage of new features shipped)

---

## 🆘 Common Scenarios

**Scenario: "I forgot how the UAT workflow works"**
→ Read [QUICK-REFERENCE.md](QUICK-REFERENCE.md) (1-page cheat sheet)

**Scenario: "I have 20 feature ideas from an email"**
→ `/backlog` + paste all 20 ideas at once
→ Agent will log them for grooming later

**Scenario: "User reported a critical bug"**
→ `/uat [bug description]`
→ Add "This is urgent" → Agent will triage as Tier 1 and fix immediately

**Scenario: "What should we build next?"**
→ `/backlog let's groom` → `/backlog let's plan a sprint`

**Scenario: "New agent doesn't know context"**
→ Agent reads CLAUDE.md → sees Current Phase → uses `/uat` or `/backlog` to load full context

---

## 🔧 Maintenance

**Weekly:**
- Run `/uat check the database` to review new in-app feedback
- Update raw-notes.md with any email/verbal feedback received

**Bi-weekly:**
- Run `/backlog let's groom` to categorize and prioritize new ideas
- Archive or reject ideas >3 months old in icebox

**Monthly:**
- Review completed items and update success metrics
- Clean up old session logs (archive anything >6 months)
- Update this documentation if workflows have evolved

---

## 📞 Questions?

If this system isn't working or needs adjustment:
1. Document what's broken in `docs/project-management/IMPROVEMENTS.md`
2. Discuss in next sprint planning session
3. Update workflows and documentation
4. Communicate changes via CLAUDE.md

---

**Last Updated**: 2025-10-28
**System Version**: 1.0
**Status**: Active
