# Session Flow Implementation Summary

This document summarizes the implementation of improved session flows for Pathfinder, including:
1. Partial discovery completion tracking
2. Auto-closing coaching/discovery sessions
3. Default session type changes
4. Read-only completed sessions
5. Enhanced discovery progress banner

## Changes Implemented

### 1. Profile Completeness Tracking ✅

**New File:** `lib/profile/completeness.ts`

**Purpose:** Calculate how complete a user's discovery profile is based on data in `user_profiles` and `child_profiles` tables.

**Key Functions:**
- `calculateProfileCompleteness(userId)` - Returns completeness object with percentage and missing fields
- `isDiscoveryComplete(userId)` - Simple boolean check if 100% complete
- `getProgressMessage(completeness)` - Human-readable progress message

**Completeness Categories (5 total):**
1. **hasParentInfo**: `parent_name`, `family_context` populated
2. **hasChildren**: At least 1 child in `child_profiles`
3. **hasChildDetails**: Child has age, challenges, strengths
4. **hasSchoolInfo**: Child has school type, grade level
5. **hasTreatmentInfo**: Child has medication or therapy status

**Calculation:** `completionPercentage = (completedCategories / 5) * 100`

---

### 2. Database Migration ✅

**New File:** `migrations/04-discovery-progress-tracking.sql`

**Changes to `user_profiles` table:**
```sql
ADD COLUMN discovery_progress INTEGER DEFAULT 0 CHECK (0-100)
ADD COLUMN discovery_session_id UUID REFERENCES agent_sessions(id)
```

**Purpose:**
- Track partial completion percentage (0-100%)
- Link to most recent discovery session for resumption
- Backfill existing completed discoveries to 100%

**To Apply:**
1. Open Supabase SQL Editor
2. Run `migrations/04-discovery-progress-tracking.sql`
3. Verify with:
   ```sql
   SELECT user_id, discovery_completed, discovery_progress, discovery_session_id
   FROM user_profiles;
   ```

---

### 3. Session Manager Updates ✅

**Modified File:** `lib/session/manager.ts`

**New Methods:**

```typescript
async closeSession(sessionId: string): Promise<void>
```
- Marks session as `status = 'complete'` and sets `ended_at`
- Used for coaching and discovery sessions

```typescript
shouldAutoCloseCoachingSession(session, lastMessageRole): boolean
```
- Returns true if:
  - Session type is 'coaching'
  - Current phase is 'closing'
  - Last message from assistant (bot delivered summary)

```typescript
shouldAutoCloseDiscoverySession(session, discoveryProgressPercent): boolean
```
- Returns true if:
  - Session type is 'discovery'
  - Discovery progress is 100%

**Usage:** These methods should be called in the chat API after each message exchange.

---

### 4. Default Session Type Change ✅

**Modified File:** `app/(protected)/chat/page.tsx`

**Changes:**
- Default session type changed from `'quick-tip'` to `'check-in'`
- Line 65: `const initialSessionType = ... || 'check-in'`
- Added warmer first message: `"Hey there! How are you doing today?"`

**Impact:**
- All new sessions without explicit `?sessionType=` param will be check-in
- More aligned with coaching-first philosophy

---

### 5. Conversation API Updates ✅

**Modified File:** `app/api/conversation/route.ts`

**POST Endpoint Changes:**
- New request body parameter: `excludeCompletedCoaching: boolean`
- When true, filters out completed coaching/discovery sessions
- Returns first active non-coaching/discovery session instead
- Used by chat page on app launch to avoid loading completed sessions

**Logic:**
```typescript
if (excludeCompletedCoaching) {
  // Find first session that is NOT (coaching/discovery AND complete)
  session = sessions.find(s => {
    const isCoachingOrDiscovery = s.session_type === 'coaching' || s.session_type === 'discovery';
    const isComplete = s.status === 'complete';
    return !(isCoachingOrDiscovery && isComplete);
  });
}
```

**Response Changes:**
- Now includes `status` field in session object
- Used by front-end to detect completed sessions

---

### 6. Read-Only Completed Sessions ✅

**Modified File:** `app/(protected)/chat/page.tsx`

**New State Variables:**
```typescript
const [sessionStatus, setSessionStatus] = useState<'active' | 'complete' | 'scheduled'>('active');
const [isSessionCompleted, setIsSessionCompleted] = useState(false);
```

**Detection Logic:**
```typescript
const isCompleted = data.session.status === 'complete' &&
  (data.session.sessionType === 'coaching' || data.session.sessionType === 'discovery');
setIsSessionCompleted(isCompleted);
```

**UI Changes:**
- Input textarea hidden when `isSessionCompleted = true`
- Replaced with completion banner showing:
  - "This {sessionType} session is complete."
  - "Start New Check-in" button → redirects to `/chat?new=true&sessionType=check-in`

**Visual Design:**
- Background: `#E3EADD` (soft green)
- Gradient button with hover effect
- Centered text with clear messaging

---

### 7. Enhanced Discovery Banner ✅

**Modified File:** `components/DiscoveryBanner.tsx`

**New Features:**

**State 1: Not Started (0% complete)**
```
💡 First time here?
[Message explaining discovery]
[Start Discovery Session]
```

**State 2: Partially Complete (1-99% complete)**
```
🔍 Discovery 45% Complete
[Progress bar]
[Message with completion percentage]
Still needed: Parent information, School information
[Continue Discovery]
```

**State 3: Complete (100%)**
```
[Banner hidden]
```

**Visual Updates:**
- Progress bar with gradient fill (#D7CDEC → #B7D3D8)
- Color changes: Pink (not started) → Green (in progress)
- Shows up to 3 missing fields
- Button text changes: "Start" vs "Continue"

**Integration:**
- Uses `calculateProfileCompleteness()` from `lib/profile/completeness.ts`
- Updates `contextMessage` prop to optional (uses smart default)
- Auto-hides when 100% complete

---

## Implementation Status

| Task | Status | File(s) |
|------|--------|---------|
| Profile completeness helper | ✅ Complete | `lib/profile/completeness.ts` |
| Database migration | ✅ Complete | `migrations/04-discovery-progress-tracking.sql` |
| Session manager auto-close | ✅ Complete | `lib/session/manager.ts` |
| Default session type change | ✅ Complete | `app/(protected)/chat/page.tsx` |
| API exclude completed sessions | ✅ Complete | `app/api/conversation/route.ts` |
| Read-only completed sessions UI | ✅ Complete | `app/(protected)/chat/page.tsx` |
| Discovery banner progress | ✅ Complete | `components/DiscoveryBanner.tsx` |

---

## Deployment Checklist

### Before Deployment

- [ ] Run database migration: `migrations/04-discovery-progress-tracking.sql` in Supabase SQL Editor
- [ ] Verify migration: Check that `user_profiles` table has `discovery_progress` and `discovery_session_id` columns
- [ ] Test profile completeness calculation with sample user data
- [ ] Verify discovery banner shows correct progress for partial completion

### After Deployment

- [ ] Monitor auto-close behavior for coaching sessions
- [ ] Check that default session type is `check-in` (not `quick-tip`)
- [ ] Verify completed sessions show read-only view
- [ ] Test discovery resumption for users with partial data
- [ ] Check that discovery banner updates as profile data is added

### Testing Scenarios

**Scenario 1: New User**
1. Register new account
2. Open `/chat` → Should see "First time here?" banner
3. Click "Start Discovery Session"
4. Share partial info (e.g., only child name)
5. Leave app and return
6. Should see "Discovery 20% Complete" banner
7. Click "Continue Discovery" → Resume same session

**Scenario 2: Coaching Session Completion**
1. Start coaching session with `?sessionType=coaching&time=50`
2. Complete GROW model through closing phase
3. Bot delivers final summary
4. Session should auto-close (status = 'complete', ended_at set)
5. User sees "This coaching session is complete" banner
6. Cannot send messages, only "Start New Check-in" button

**Scenario 3: App Launch with Completed Coaching**
1. User has completed coaching session as most recent
2. Open `/chat` (no params)
3. Should NOT load coaching session
4. Should load most recent check-in/quick-tip/update instead
5. Or start fresh check-in if no other sessions exist

---

## Integration Points

### Chat API (`app/api/chat/route.ts`)

**TODO:** Add auto-close logic after agent response

```typescript
// After agent generates response and updates session state:

// Check if coaching session should be closed
if (sessionManager.shouldAutoCloseCoachingSession(session, 'assistant')) {
  await sessionManager.closeSession(session.id);
}

// Check if discovery session should be closed
const completeness = await calculateProfileCompleteness(userId);
if (sessionManager.shouldAutoCloseDiscoverySession(session, completeness.completionPercentage)) {
  await sessionManager.closeSession(session.id);
  // Also update user_profiles
  await supabase
    .from('user_profiles')
    .update({
      discovery_completed: true,
      discovery_completed_at: new Date(),
      discovery_progress: 100
    })
    .eq('user_id', userId);
}
```

### Discovery Agent (`lib/agents/discovery-agent.ts`)

**TODO:** Extract and save profile data during discovery

```typescript
// After each exchange in discovery session:
// 1. Parse conversation content for profile data
// 2. Update user_profiles and child_profiles tables
// 3. Recalculate completeness percentage
// 4. Update discovery_progress field

const completeness = await calculateProfileCompleteness(userId);
await supabase
  .from('user_profiles')
  .update({ discovery_progress: completeness.completionPercentage })
  .eq('user_id', userId);
```

---

## Breaking Changes

### None (Backward Compatible)

All changes are additive and backward compatible:
- New database columns have defaults
- Old sessions without `status` field default to 'active'
- Discovery banner gracefully handles missing data
- Session loading falls back to first session if filtering fails

---

## Future Enhancements

### 1. Discovery Data Extraction
- **Current:** Banner tracks progress based on existing data
- **Future:** Discovery agent automatically extracts and saves data during conversation
- **Implementation:** NLP extraction in `lib/agents/discovery-agent.ts`

### 2. Session Scheduling
- **Current:** `scheduledFor` field exists but unused
- **Future:** Calendar UI to schedule coaching sessions
- **Implementation:** Booking page + reminder system

### 3. Session Analytics
- **Current:** Basic session tracking
- **Future:** Dashboard showing completion rates, average session length, etc.
- **Implementation:** Analytics page pulling from `agent_sessions` and `agent_performance`

### 4. Multi-Child Session Context
- **Current:** Sessions don't reference specific child
- **Future:** Child selector before starting session
- **Implementation:** Add child_id to session creation flow

---

## Support

For questions or issues with this implementation, reference:
- [PROJECT-MASTER-DOC.md](adhd-support-agent/docs/PROJECT-MASTER-DOC.md) - Full technical documentation
- [COACHING-METHODOLOGY.md](adhd-support-agent/docs/COACHING-METHODOLOGY.md) - GROW model details
- This file for implementation specifics

---

**Implementation Date:** October 2025
**Contributors:** Claude Code
**Status:** Ready for Testing
