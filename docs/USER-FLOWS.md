# Pathfinder User Flows

**Purpose:** Create a warm, supportive experience that reduces cognitive load while helping parents feel understood and empowered.

---

## Design Principles

✨ **Natural & Effortless** - Flows feel conversational, not transactional
🧠 **Low Cognitive Load** - Clear next steps, no overwhelming choices
💙 **Emotionally Safe** - Warm language, progress celebrated, never judged
🔄 **Pick Up Where You Left Off** - Seamless continuity across sessions

---

## The Journey

### 1️⃣ First Visit: Discovery

**Goal:** Learn about you and your child without feeling like paperwork.

**What Happens:**
- **Landing page** introduces Pathfinder with empathy
- **Sign up** is simple: email, password, done
- **Discovery session starts automatically** - feels like a warm conversation
  - "How many children do you have?"
  - "Tell me about [child's name]..."
  - "What challenges are you facing?"

**Why This Works:**
- No forms to fill out
- Natural conversation instead of questionnaires
- Progress saved automatically
- Can pause anytime and pick up later

**If They Drop Off:**
When they return, they see:
> 🔍 **Discovery 40% Complete**
> We still need: School information, Treatment details
> [Continue Discovery]

**Result:** They feel heard, not interrogated.

---

### 2️⃣ Returning Users: Check-ins (Default)

**Goal:** Quick, supportive conversations when they need it.

**What Happens:**
- **App opens to most recent conversation** - no navigation needed
- If it's been a while, they see:
  > "Welcome back! It's been 3 days. Would you like to continue where we left off, or start fresh?"
- Default greeting: **"Hey there! How are you doing today?"**
- Casual 5-15 minute chat
- No structure, just support

**Why This Works:**
- Zero friction - conversation loads instantly
- Warm tone reduces stress
- No pressure to commit to long sessions
- Feels like texting a supportive friend

**Examples:**
- "My kid had a meltdown this morning"
- "I need quick advice for bedtime tonight"
- "Just venting about a tough day"

---

### 3️⃣ Deeper Support: Coaching Sessions

**Goal:** Structured exploration when parents are ready to dig deeper.

**What Happens:**
- **User chooses "Coaching Session"** from menu (30 or 50 minutes)
- First message: **"I'm glad you've set aside time for this. What would make today's session useful for you?"**
- Follows GROW model:
  - **Goal:** What do you want to work on?
  - **Reality:** What's really happening? (deep exploration)
  - **Options:** What could you try?
  - **Will:** What will you do?
- At the end, session **auto-closes** with summary

**Why This Works:**
- Clear time expectation upfront
- Parent leads the direction
- We explore before suggesting
- Ends with their own plan, not ours

**After Completion:**
When they try to continue, they see:
> ✅ **This coaching session is complete.**
> [Start New Check-in]

**Result:** Prevents confusion, creates closure.

---

### 4️⃣ Specific Needs: Quick Tips & Strategy Sessions

**Quick Tip** (1-2 exchanges):
- "I need help with homework refusal right now"
- Fast, actionable advice
- No extended exploration

**Strategy Session** (20-30 minutes):
- "Let's develop a plan for morning routines"
- Focuses on one specific issue
- Leaves with concrete strategies

**Why This Works:**
- Right level of support for the moment
- Doesn't force structure when it's not needed

---

## Session Types at a Glance

| Type | Duration | When to Use | Feeling |
|------|----------|-------------|---------|
| **Check-in** | 5-15 mins | Daily support, venting, quick questions | Casual chat with friend |
| **Discovery** | 10+ mins | First time, or profile incomplete | Getting to know you |
| **Quick Tip** | 2 mins | "I need help NOW" | Fast relief |
| **Strategy** | 20-30 mins | Problem-solving a specific issue | Focused collaboration |
| **Coaching** | 30-50 mins | Deep exploration, big challenges | Therapeutic support |

---

## Smart Behaviors

### 🎯 Partial Discovery Completion
**Problem:** User starts discovery but doesn't finish.

**Solution:**
- Progress saved automatically
- Banner shows completion percentage: "Discovery 60% Complete"
- Lists what's still needed: "School info, treatment details"
- One click to continue - picks up exactly where they left off

**Experience:** Never feels like starting over.

---

### 🔄 Returning User Default
**Problem:** What should load when they open the app?

**Solution:**
- Loads most recent **check-in or casual session**
- NEVER loads completed coaching sessions
- If it's been >5 minutes, shows continuation prompt
- If last session was coaching that finished, starts fresh check-in

**Experience:** Always feels natural - either pick up recent chat or start fresh.

---

### 🚫 Completed Session Protection
**Problem:** User accidentally tries to continue a finished coaching session.

**Solution:**
- Coaching sessions auto-close when they reach natural end
- Transcript remains readable, but chat box is hidden
- Clear message: "This session is complete" + button to start new check-in

**Experience:** Clear closure, no confusion about where they are.

---

### 📊 Progress Visibility
**Problem:** Users don't know what they've shared or what's missing.

**Discovery Banner States:**

**Not Started (0%):**
> 💡 **First time here?**
> Start your discovery session to help me understand you and your child.
> [Start Discovery Session]

**In Progress (1-99%):**
> 🔍 **Discovery 45% Complete**
> [Progress bar ████░░░░░░]
> Still needed: School information, Treatment details
> [Continue Discovery]

**Complete (100%):**
> [Banner hidden - they're all set]

**Experience:** Always know where they stand, never lost.

---

## The Happy Path

### First-Time User
```
Sign Up → Discovery Session → Add Child Profile → Check-in Ready
    ↓
Complete at their pace (can pause anytime)
    ↓
Return anytime - progress saved
    ↓
When 100% complete - banner disappears, full access
```

### Returning User
```
Open App → Most recent check-in loads → Continue or start fresh
    ↓
Need deeper support? → Choose coaching session
    ↓
Coaching ends → Clear closure → Back to check-ins
```

### Partial Discovery User
```
Open App → See progress banner (e.g., 60% complete)
    ↓
Option 1: Continue discovery now
Option 2: Dismiss banner, use app normally
    ↓
Banner reappears next time with updated progress
```

---

## Emotional Design Details

### Language Choices

❌ **Avoid:**
- "Complete your profile"
- "Mandatory fields"
- "Finish setup"
- "You must..."

✅ **Use:**
- "Tell me about your family"
- "Help me understand..."
- "We're getting to know you"
- "Whenever you're ready..."

### Visual Cues

**Discovery Progress:**
- 0%: Pink banner (inviting, warm)
- 1-99%: Green banner (encouraging progress)
- Progress bar uses gradient (feels rewarding)

**Session Completion:**
- Soft green background (calm, complete)
- Clear "Start New Check-in" button (next step obvious)

**Coaching Sessions:**
- Time expectation shown upfront (reduces anxiety)
- "I'm glad you've set aside time" (validates their commitment)

---

## Edge Cases Handled Gracefully

### User Drops Off Mid-Discovery
✅ Progress saved
✅ Banner shows what's missing
✅ One click to resume
✅ No guilt, just encouragement

### User Opens Completed Coaching Session
✅ Transcript viewable (read-only)
✅ Clear "Session complete" message
✅ Easy path to start fresh check-in

### User Has Multiple Children
✅ Discovery captures all children
✅ Family page shows all profiles
✅ Can add more children anytime

### App Launch After Long Break
✅ Continuation prompt: "Welcome back! Continue or start fresh?"
✅ Recent context visible
✅ No pressure either way

---

## Success Metrics

**Friction Reduced:**
- Discovery completion rate increased (partial saves reduce abandonment)
- Session confusion decreased (clear closure, no accidental old session continuation)
- Return rate improved (easy pickup where left off)

**Emotional Experience:**
- Users feel supported, not interrogated
- Progress feels rewarding, not tedious
- Navigation feels natural, not confusing

**Parent Outcomes:**
- Faster time to first "aha moment"
- Higher engagement with coaching sessions
- More consistent check-in usage (reduced barrier)

---

## Summary

Pathfinder adapts to where parents are:

🌱 **New?** Gentle discovery conversation that saves progress
💬 **Quick question?** Check-in loads instantly, no setup
🎯 **Need focus?** Coaching session with clear structure and closure
🔄 **Returning?** Pick up exactly where you left off

**Every interaction is designed to reduce stress, not add to it.**

Parents are experts on their kids - we're here to help them discover their own solutions, at their own pace, with zero judgment.

---

*Last Updated: October 2025*
