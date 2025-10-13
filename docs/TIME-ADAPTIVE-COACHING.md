# Time-Adaptive Coaching Feature

**Status**: Implementation Complete (Pending Testing)
**Created**: October 13, 2025
**Last Updated**: October 13, 2025

## Overview

The time-adaptive coaching feature allows parents to select their available time before starting a coaching session (5, 15, 30, or 50 minutes). The AI coach adapts its depth, pacing, and GROW model progression based on the selected time budget.

## Problem Solved

Previously, all coaching sessions targeted ~50 minutes of deep exploration, which wasn't practical for parents with only 5-15 minutes available. This feature makes the coaching accessible for quick check-ins while maintaining the full coaching experience for longer sessions.

## Implementation Architecture

### 1. Time Selection UI

**Component**: [`components/TimeSelectionCard.tsx`](../components/TimeSelectionCard.tsx)

A card-based UI component that presents 4 time options:
- **5 minutes**: Quick check-in
- **15 minutes**: Short session
- **30 minutes**: Standard session
- **50 minutes**: Deep dive (original full session)

The component uses the design system's layout components (Card, Button) for consistency.

### 2. Database Schema

**Migration**: [`migrations/add-time-tracking.sql`](../migrations/add-time-tracking.sql)

Added to `agent_sessions` table:
```sql
time_budget_minutes INTEGER DEFAULT 50
time_elapsed_minutes INTEGER DEFAULT 0
can_extend_time BOOLEAN DEFAULT true
time_extension_offered BOOLEAN DEFAULT false
```

### 3. TypeScript Interfaces

Updated interfaces in:
- [`lib/supabase/client.ts`](../lib/supabase/client.ts#L56-L60) - `AgentSession` interface
- [`lib/session/manager.ts`](../lib/session/manager.ts#L21-L25) - `SessionState` interface
- [`lib/agents/proper-tools-agent.ts`](../lib/agents/proper-tools-agent.ts#L23-L25) - `AgentContext` interface

### 4. Session Management

**Updated Files**:
- [`lib/session/manager.ts`](../lib/session/manager.ts)
  - `createSession()` now accepts `timeBudgetMinutes` parameter
  - `updateSession()` can update time tracking fields
  - `getSession()` returns time tracking data

- [`lib/database/chats.ts`](../lib/database/chats.ts)
  - `createSession()` now stores time budget in database

### 5. Agent Adaptation

**File**: [`lib/agents/proper-tools-agent.ts`](../lib/agents/proper-tools-agent.ts)

The agent system prompt now includes:
- Time budget awareness
- Adaptive pacing rules per time budget
- Time remaining calculations
- Warnings when approaching time limit

**Adaptive GROW Model Rules**:
```
5 mins:  Goal → 1-2 Reality questions → Quick next step
15 mins: Goal → 5-7 Reality exchanges → Options (if ready)
30 mins: Goal → 8-12 Reality exchanges → Options → Will
50 mins: Full GROW with 10-15+ Reality exchanges (original behavior)
```

### 6. API Integration

**File**: [`app/api/chat/route.ts`](../app/api/chat/route.ts)

Changes:
- Accepts `timeBudgetMinutes` from request context
- Creates sessions with specified time budget
- Tracks time elapsed (estimates ~2 mins per exchange)
- Passes time tracking to agent in session state

### 7. UI Integration

**Chat Page**: [`app/(protected)/chat/page.tsx`](../app/(protected)/chat/page.tsx)
- Shows TimeSelectionCard before chat interface
- Stores selected time in state
- Passes time budget to API on first message

**Voice Page**: [`app/(protected)/voice/page.tsx`](../app/(protected)/voice/page.tsx)
- Shows TimeSelectionCard before voice interface
- Stores selected time in state
- Passes time budget to ElevenLabsVoiceAssistant component

## User Flow

### Chat Mode
1. User navigates to `/chat`
2. TimeSelectionCard displays with 4 time options
3. User selects time (e.g., "15 mins")
4. Chat interface appears with greeting message
5. User sends first message → session created with 15-minute budget
6. Agent adapts coaching depth to 15-minute format
7. Time elapsed updates after each exchange (~2 mins per exchange)
8. Agent can request time extension if parent seems engaged

### Voice Mode
1. User navigates to `/voice`
2. TimeSelectionCard displays with 4 time options
3. User selects time (e.g., "30 mins")
4. Voice interface appears
5. User starts voice session → time budget passed to backend
6. Agent adapts coaching depth to 30-minute format

## Time Tracking Logic

### Time Elapsed Estimation
**Location**: [`app/api/chat/route.ts:272-276`](../app/api/chat/route.ts#L272-L276)

```typescript
const estimatedTimeElapsed = Math.min(
  session.timeBudgetMinutes,
  Math.floor((newRealityDepth * 2) + 1) // ~2 mins per exchange
);
```

**Rationale**:
- Each back-and-forth exchange takes approximately 2 minutes
- +1 minute for initial setup/greeting
- Capped at time budget maximum

### Agent Prompting
**Location**: [`lib/agents/proper-tools-agent.ts:237-250`](../lib/agents/proper-tools-agent.ts#L237-L250)

The agent receives real-time time tracking in every message:
```
TIME TRACKING (CRITICAL - ADAPT YOUR COACHING DEPTH):
- Time budget: 15 minutes (parent's available time)
- Time elapsed: 8 minutes
- Time remaining: ~7 minutes
- Extension offered: Not yet

PACING GUIDANCE FOR 15-MINUTE SESSION:
- Brief session: 5-7 Reality exchanges, focused Options if ready
```

## Future Enhancements

### 1. Time Extension Tool (Pending)
**Status**: Not yet implemented

Create an agent tool that allows the coach to request more time:
```typescript
{
  name: 'requestTimeExtension',
  description: 'Ask parent if they can extend the session by 10-15 minutes',
  parameters: {
    reason: 'Why extension would be valuable'
  }
}
```

Implementation plan:
- Add tool to [`lib/agents/proper-tools-agent.ts`](../lib/agents/proper-tools-agent.ts)
- Update `timeExtensionOffered` flag in session state
- Show UI prompt in chat/voice interface
- Allow parent to accept/decline extension

### 2. Visual Time Indicator
Show parent how much time remains in the session:
- Progress bar or clock icon
- Color changes (green → yellow → red)
- Optional: Gentle notifications at 5 mins remaining

### 3. Analytics
Track session completion rates by time budget:
- Do 5-min sessions complete successfully?
- Do parents accept time extensions?
- Which time budgets lead to best outcomes?

### 4. Smart Time Budget Suggestion
After 2-3 sessions, suggest optimal time budget based on:
- Parent's average session length
- Complexity of issues discussed
- Historical completion rates

## Testing Checklist

- [ ] Test 5-minute session: Coach gives quick advice, minimal exploration
- [ ] Test 15-minute session: Coach explores 5-7 exchanges before Options
- [ ] Test 30-minute session: Coach explores 8-12 exchanges, full GROW cycle
- [ ] Test 50-minute session: Full original coaching experience (10-15+ exchanges)
- [ ] Verify time elapsed updates correctly in database
- [ ] Test session state persists across page refreshes
- [ ] Test time budget displays correctly in agent prompts
- [ ] Test voice mode receives time budget correctly
- [ ] Verify backward compatibility: Old sessions default to 50 minutes
- [ ] Test edge case: What happens if user reaches time limit mid-conversation?

## Migration Instructions

### 1. Apply Database Migration

Run in Supabase SQL Editor:
```bash
# File: migrations/add-time-tracking.sql
```

This adds the time tracking columns to `agent_sessions` table and updates existing sessions to 50-minute default.

### 2. Deploy Code Changes

All code changes are backward compatible. Existing sessions will default to 50-minute budgets.

### 3. Verify Deployment

1. Navigate to `/chat` or `/voice`
2. Confirm TimeSelectionCard appears
3. Select a time budget
4. Send a message
5. Check database: `agent_sessions.time_budget_minutes` should match selection
6. Check agent logs: Time tracking should appear in system prompt

## Design Decisions

### Why Pre-Session Time Selection?

**Considered Options**:
1. **Pre-session UI selection** (Chosen)
2. Natural conversation detection ("How much time do you have?")

**Rationale**:
- Explicit choice sets clear expectations
- Agent can structure entire session appropriately from start
- No wasted time asking about time availability
- Better GROW model adaptation (knows depth target upfront)

### Why 2-Minute Exchange Estimate?

Based on typical coaching conversations:
- Parent types/speaks: ~30-45 seconds
- Agent processes + responds: ~10-20 seconds
- Parent reads/listens + thinks: ~30-45 seconds
- **Total**: ~90-120 seconds = ~2 minutes per exchange

This is a rough estimate. Future enhancements could track actual elapsed time using timestamps.

### Why These Time Buckets? (5, 15, 30, 50)

**5 minutes**: Minimum viable coaching interaction
- Quick check-in or crisis assessment
- Simple question + quick strategy

**15 minutes**: Typical "stolen moment"
- Parents grabbing time between activities
- Brief but meaningful coaching

**30 minutes**: Standard therapy session length
- Half of typical 50-minute session
- Balanced depth and efficiency

**50 minutes**: Professional coaching standard
- Full GROW model exploration
- Deep Reality phase work

## Known Limitations

1. **Time estimation is approximate** - Based on exchange count, not actual elapsed time
2. **No automatic session ending** - Agent won't forcibly end session at time limit
3. **Time extension not yet implemented** - Agent can't ask for more time mid-session
4. **No visual time indicator** - Parent doesn't see remaining time during session
5. **Voice mode time tracking** - ElevenLabs agent doesn't automatically track time (needs custom implementation)

## Related Documentation

- [COACHING-METHODOLOGY.md](./COACHING-METHODOLOGY.md) - Full GROW/OARS coaching approach
- [components/layouts/README.md](../components/layouts/README.md) - Layout system used for TimeSelectionCard
- [CLAUDE.md](../CLAUDE.md) - Overall project documentation

## Questions?

If you have questions about this feature or need to modify the time budgets, consult:
- This document for implementation details
- [`lib/agents/proper-tools-agent.ts`](../lib/agents/proper-tools-agent.ts) for agent adaptation logic
- [`components/TimeSelectionCard.tsx`](../components/TimeSelectionCard.tsx) for UI modifications
