# User Testing Phase - Pathfinder ADHD Parent Coach

**Status**: Active User Testing (October 2025)
**Phase**: Alpha Testing - Small Group of ADHD Parents
**Goal**: Validate coaching approach, identify UX friction, gather feature requests

---

## 🎯 Current Testing Goals

### Primary Objectives
1. **Validate Coaching Effectiveness**: Does the GROW/OARS approach feel supportive vs prescriptive?
2. **Identify UX Friction**: Where do users get stuck, confused, or frustrated?
3. **Voice vs Chat Preference**: Which mode do users prefer and why?
4. **Session Length**: Are 50-minute sessions too long? Do users complete them?
5. **Crisis Detection**: Test edge cases without triggering false positives

### Secondary Objectives
- Feature requests and "nice to have" improvements
- Content gaps in strategy database
- Mobile experience feedback
- Performance issues (slow responses, errors)

---

## 📝 How Feedback is Collected

### Three Collection Methods

1. **In-App Feedback Form** → Stored in Supabase `user_feedback` table
   - Users rate experience 1-10 + write feedback
   - Linked to session ID for context
   - Retrieved via MCP: `/uat check the database`

2. **Direct Communication** → Recorded in `docs/feedback/raw-notes.md`
   - Email, WhatsApp, Slack, verbal feedback
   - Paste raw user words verbatim
   - `/uat [paste feedback]` to log quickly

3. **Session Observations** → Logged in dated session notes
   - Watching user sessions
   - Usability testing observations
   - Use template in `docs/feedback/TEMPLATE.md`

### What We're Looking For
- **Specific moments**: "When I asked X, the bot said Y and I felt Z"
- **Friction points**: "I couldn't figure out how to..."
- **Emotional reactions**: "This made me feel..."
- **Feature ideas**: "I wish I could..."
- **Bugs/errors**: Screenshots or error messages

---

## 🔍 Feedback Triage Process

**DEFAULT MODE: COLLECT FIRST, TRIAGE LATER**

Don't action feedback immediately. Instead:
1. **Collect all feedback** in raw-notes.md or pull from database
2. **Batch review** when you have 5-10 pieces of feedback
3. **Triage together** using 4-tier system below
4. **Only fix Tier 1** items in that session

### When Triaging, Use This Framework:

### Tier 1: Action Immediately (This Sprint)
- **Critical bugs**: App crashes, data loss, broken core flows
- **Safety issues**: Crisis detection failures, harmful responses
- **Blocking UX issues**: Users can't complete primary tasks
- **Quick wins**: <1 hour fixes with high user impact

### Tier 2: Backlog for Next Sprint
- **Feature requests**: Require design/planning but high value
- **UX improvements**: Non-blocking but impact user satisfaction
- **Performance**: Slow but not broken
- **Content gaps**: Missing strategies for common scenarios

### Tier 3: Future Enhancements
- **Nice to have**: Low priority, low impact
- **Out of scope**: Doesn't align with core coaching mission
- **Research needed**: Unclear problem or solution

### Tier 4: Won't Fix
- **Coaching philosophy conflicts**: User wants advice-giving, not coaching
- **Technical limitations**: Can't be solved with current stack
- **Edge cases**: Extremely rare, low impact

---

## 🐛 Known Issues Being Tracked

### In Progress
- None currently

### Backlog
- None currently

---

## 📊 Feedback Log Structure

Each testing session gets logged in `docs/feedback/YYYY-MM-DD-session-notes.md` with:

```markdown
# Feedback Session - [Date]
**User**: [Anonymous ID or initials]
**Session Type**: Chat / Voice / Both
**Duration**: [Time spent]

## Raw Feedback
[Paste user's exact words/screenshots]

## Triage
- **Tier 1**: [Critical items]
- **Tier 2**: [Backlog items]
- **Tier 3**: [Future items]
- **Tier 4**: [Won't fix items]

## Actions Taken
- [ ] [Action item 1]
- [ ] [Action item 2]

## Notes
[Context, patterns observed, hypotheses]
```

---

## 🚀 Quick Wins vs Deep Work

### Quick Wins (< 1 hour)
- Copy/UI text changes
- Button placement/spacing
- Error message improvements
- Add missing links/navigation

### Deep Work (1+ hours)
- New features (reports, child profiles, etc.)
- Coaching prompt refinements
- Database schema changes
- Integration work (ElevenLabs, Supabase)

Prioritize quick wins during testing phase to show responsiveness to feedback.

---

## 📈 Success Metrics

We're tracking:
- **Session completion rate**: % of users who finish a full coaching session
- **Return rate**: % of users who come back for a 2nd session
- **Mode preference**: Chat vs Voice usage
- **Feedback sentiment**: Positive vs negative themes
- **Crisis detection accuracy**: False positives vs true positives

---

## 🔄 Weekly Feedback Review Process

Every Monday:
1. Review all feedback from past week
2. Triage into 4 tiers
3. Plan sprint: 80% Tier 1, 20% Tier 2
4. Update this doc with known issues
5. Communicate fixes/updates to testers

---

## 📞 Escalation Process

If user reports:
- **Suicidal ideation not detected**: Immediate review of crisis agent
- **Data breach/privacy concern**: Immediate GDPR audit
- **Harmful advice given**: Immediate prompt review and session log audit

Contact Paul immediately for escalations.

---

## 🎓 For Claude Agents Working This Project

When starting a new session and user says "I have feedback from testing":

1. Ask: "Is this Tier 1 (critical/quick win) or can it wait for backlog?"
2. Log feedback in `docs/feedback/YYYY-MM-DD-session-notes.md`
3. If Tier 1: Fix immediately
4. If Tier 2+: Add to backlog section in this doc
5. Update user on action taken

Use `/uat` slash command to load this context instantly.
