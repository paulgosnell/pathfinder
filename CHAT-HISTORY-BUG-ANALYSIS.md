# Discovery Session Chat History Bug - Deep Dive Analysis

**Status:** P0 CRITICAL  
**Bug ID:** CHAT-HISTORY-DISAPPEAR  
**First Reported:** Multiple times (stubborn bug)  
**Latest User Report:** Nov 10, 2025 (Rating: 1/10)

---

## 🐛 BUG DESCRIPTION

**Symptoms:**
1. During discovery session, chat history **disappears mid-conversation**
2. User can only see "initial prompt and latest question"
3. Session appears to restart/loop: asks "Let's start with your oldest. What's their name?" again
4. Previous messages and answers are lost from frontend display

**User Impact:**
- Complete loss of conversation context
- Feels like talking to someone with amnesia
- Forces restart of data collection
- Breaks trust in the system

---

## 🔍 ROOT CAUSE ANALYSIS

After analyzing the codebase, I've identified **THREE separate but related issues**:

### Issue #1: Frontend Session Reloading (PRIMARY SUSPECT)

**Location:** `/app/(protected)/chat/page.tsx:142-296`

**The Problem:**
The `useEffect` hook that loads sessions **runs every time the component re-renders**. During a discovery session:

1. User sends message → trigger re-render
2. useEffect detects `!isNewSession && !specificSessionId`
3. Calls `/api/conversation` to load "most recent session"
4. API returns messages from database
5. **Frontend REPLACES current `messages` state with database response**
6. Any messages in the current session that haven't been saved yet are LOST

**Why Discovery Is Especially Affected:**
Discovery sessions have complex multi-turn flows where the agent might:
- Ask multiple follow-up questions in one response
- Handle corrections (e.g., "It's my youngest, not oldest")
- Process multi-child scenarios

If the database save happens AFTER the frontend re-fetches, you get:
```
Frontend State: [msg1, msg2, msg3, msg4]  ← Current conversation
                     ↓ (re-render triggers useEffect)
API Call: GET /api/conversation
                     ↓
API Returns: [msg1, msg2]  ← Only what's in database so far
                     ↓
Frontend State: [msg1, msg2]  ← HISTORY LOST!
```

**Code Evidence:**
```typescript
// Line 142-296: useEffect loads session on EVERY render where user exists
useEffect(() => {
  const loadSession = async () => {
    if (!user) return;

    try {
      // ... session loading logic ...
      
      // Line 214-256: Loads most recent session
      const response = await fetch('/api/conversation', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludeCompletedCoaching: true })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session && data.messages && data.messages.length > 0) {
          // CRITICAL BUG: Replaces current messages with DB messages
          setMessages(data.messages);  // ← OVERWRITES CURRENT CONVERSATION
        }
      }
    }
  };
  
  if (user) {
    loadSession();
  }
}, [user, isNewSession, specificSessionId]);  
// ↑ Dependency array is missing critical deps!
```

**Dependency Array Issues:**
The useEffect depends on `[user, isNewSession, specificSessionId]`, but:
- `messages` is NOT in the dependency array
- `sessionId` is NOT in the dependency array
- This means the effect can run at unexpected times when these values change

---

### Issue #2: Race Condition in Message Saving

**Location:** `/app/api/chat/route.ts:536-554`

**The Problem:**
Messages are saved to database **after** the agent response is generated, creating a window where:

1. User sends message A
2. Agent generates response B
3. **Frontend gets response B and renders it**
4. **Frontend re-renders → triggers useEffect**
5. useEffect fetches conversation from DB (doesn't have B yet)
6. Messages A+B are saved to DB (too late!)
7. Frontend replaces current state with outdated DB response

**Code Evidence:**
```typescript
// Line 536-554: Messages saved AFTER agent completes
const { error: saveError } = await serviceClient.from('agent_conversations').insert([
  {
    session_id: session.id,
    role: 'user',
    content: message
  },
  {
    session_id: session.id,
    role: 'assistant',
    content: agentResult.text
  }
]);
```

This happens at the END of the `/api/chat` route, after:
- Crisis detection
- Agent processing
- Session state updates
- Response streaming

**Timing Diagram:**
```
Frontend:  Send message → Receive response → Re-render → useEffect fires
                                                            ↓
                                                     Fetch /api/conversation
                                                            ↓
Backend:   Process → Agent → [SAVE HERE] ← Too late! Frontend already fetched old data
```

---

### Issue #3: Session State Synchronization

**Location:** Multiple files

**The Problem:**
There's no single source of truth for "current conversation state":
- Frontend has `messages` array in React state
- Database has `agent_conversations` table
- No Optimistic Updates (frontend doesn't assume save will succeed)
- No realtime sync (no WebSocket/SSE to push updates)

**Consequences:**
- Frontend and database can drift out of sync
- User sees different conversations depending on when they refresh
- Multi-tab scenarios would show completely different histories

---

## 🎯 PROPOSED SOLUTIONS

### Solution A: Fix useEffect Dependency Array (QUICK FIX - 5 minutes)

**Change:** Add conditional check to prevent re-loading active session

```typescript
// app/(protected)/chat/page.tsx
useEffect(() => {
  const loadSession = async () => {
    if (!user) return;
    
    // ✅ NEW: Don't reload if we already have an active session
    if (sessionId && messages.length > 0 && !isNewSession) {
      console.log('Session already loaded, skipping reload');
      setLoadingSession(false);
      return;
    }

    // ... rest of loading logic
  };

  if (user) {
    loadSession();
  }
}, [user, isNewSession, specificSessionId, sessionId, messages.length]);
//                                          ↑ ADD THESE DEPS
```

**Pros:**
- Extremely fast to implement
- Low risk
- Prevents most occurrences of the bug

**Cons:**
- Doesn't fix race condition
- Still possible edge cases
- Band-aid solution

---

### Solution B: Optimistic Updates (MEDIUM FIX - 30 minutes)

**Change:** Update frontend state immediately, don't wait for server confirmation

```typescript
// app/(protected)/chat/page.tsx - sendMessage function
const sendMessage = async (messageText?: string) => {
  const textToSend = messageText || input;
  if (!textToSend.trim() || loading) return;

  const userMessage: Message = { role: 'user', content: textToSend };
  
  // ✅ OPTIMISTIC UPDATE: Add both user and placeholder assistant message
  const tempAssistantMessage: Message = { 
    role: 'assistant', 
    content: '...', 
    temporary: true  // Mark as temporary
  };
  
  setMessages(prev => [...prev, userMessage, tempAssistantMessage]);
  setInput('');
  setLoading(true);

  try {
    const response = await fetch('/api/chat', { /* ... */ });
    const data = await response.json();

    // ✅ REPLACE temporary message with real response
    setMessages(prev => {
      const withoutTemp = prev.filter(m => !(m as any).temporary);
      return [...withoutTemp, {
        role: 'assistant',
        content: data.message,
        strategies: data.strategies
      }];
    });
  } catch (error) {
    // ✅ REMOVE temporary message on error
    setMessages(prev => prev.filter(m => !(m as any).temporary));
  }
};
```

**Also add guard in useEffect:**
```typescript
useEffect(() => {
  // ✅ NEVER overwrite messages if user has typed anything
  if (messages.some(m => m.role === 'user')) {
    console.log('Active conversation detected, not reloading');
    setLoadingSession(false);
    return;
  }
  
  // ... load session logic
}, [user, isNewSession, specificSessionId]);
```

**Pros:**
- Immediate UI feedback
- Prevents overwriting during active conversations
- Industry-standard pattern (used by ChatGPT, etc.)

**Cons:**
- More complex state management
- Need to handle error rollback
- Still doesn't prevent all race conditions

---

### Solution C: Server-Side Session Lock (ROBUST FIX - 1 hour)

**Change:** Prevent concurrent session modifications and ensure order

```typescript
// NEW FILE: lib/session/lock.ts
const sessionLocks = new Map<string, Promise<void>>();

export async function withSessionLock<T>(
  sessionId: string, 
  operation: () => Promise<T>
): Promise<T> {
  // Wait for any existing operation on this session
  const existingLock = sessionLocks.get(sessionId);
  if (existingLock) {
    await existingLock;
  }

  // Create new lock
  let releaseLock: () => void;
  const lock = new Promise<void>(resolve => {
    releaseLock = resolve;
  });
  sessionLocks.set(sessionId, lock);

  try {
    return await operation();
  } finally {
    releaseLock!();
    sessionLocks.delete(sessionId);
  }
}
```

```typescript
// app/api/chat/route.ts
export async function POST(req: NextRequest) {
  const { message, context } = await req.json();
  const sessionId = context?.sessionId;

  return await withSessionLock(sessionId, async () => {
    // ✅ All session operations happen sequentially
    
    // 1. Load conversation history
    const { data: conversationHistory } = await serviceClient
      .from('agent_conversations')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    // 2. Run agent
    const agentResult = await agent(message, { conversationHistory });

    // 3. Save immediately (before returning response)
    await serviceClient.from('agent_conversations').insert([
      { session_id: sessionId, role: 'user', content: message },
      { session_id: sessionId, role: 'assistant', content: agentResult.text }
    ]);

    // 4. Return response
    return new Response(JSON.stringify({ message: agentResult.text }));
  });
}
```

**Pros:**
- Guarantees consistency
- Prevents ALL race conditions
- Database always in sync with responses

**Cons:**
- More complex implementation
- Requires careful testing
- Potential performance impact (sequential processing)

---

### Solution D: Real-time Sync with Supabase Realtime (FUTURE-PROOF - 2 hours)

**Change:** Use Supabase Realtime to push updates to frontend

```typescript
// app/(protected)/chat/page.tsx
useEffect(() => {
  if (!sessionId) return;

  // ✅ Subscribe to conversation changes
  const subscription = supabase
    .channel(`conversation:${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'agent_conversations',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      // ✅ Add new message to state in real-time
      setMessages(prev => [...prev, {
        role: payload.new.role,
        content: payload.new.content
      }]);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [sessionId]);
```

**Pros:**
- Perfect sync between DB and frontend
- Works across multiple tabs/devices
- No polling, instant updates
- Future-proof for collaborative features

**Cons:**
- Requires Supabase Realtime setup
- Most complex to implement
- Overkill for single-user chat

---

## 📋 RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: Immediate Hotfix (Deploy Today)

**Implement Solution A + B Guards:**

1. ✅ **Add session check to useEffect** (5 min)
   ```typescript
   if (sessionId && messages.length > 0 && !isNewSession) {
     setLoadingSession(false);
     return;
   }
   ```

2. ✅ **Add active conversation guard** (5 min)
   ```typescript
   if (messages.some(m => m.role === 'user')) {
     setLoadingSession(false);
     return;
   }
   ```

3. ✅ **Move database save BEFORE response** (10 min)
   ```typescript
   // Save to DB first
   await saveConversation();
   
   // Then return response
   return new Response(JSON.stringify({ message }));
   ```

**Total Time:** 20 minutes  
**Risk:** Very Low  
**Expected Impact:** Fixes 80-90% of occurrences

---

### Phase 2: Robust Fix (Next Sprint)

**Implement Solution C (Session Lock):**

1. Create session lock utility
2. Wrap all `/api/chat` operations in lock
3. Ensure save happens before response
4. Add comprehensive logging

**Total Time:** 1-2 hours  
**Risk:** Medium  
**Expected Impact:** Fixes 99% of occurrences

---

### Phase 3: Future Enhancement (Nice to Have)

**Implement Solution D (Realtime Sync):**

1. Enable Supabase Realtime on `agent_conversations` table
2. Subscribe to changes in frontend
3. Remove manual session loading logic
4. Add multi-tab support

**Total Time:** 2-3 hours  
**Risk:** Medium  
**Expected Impact:** 100% bulletproof, enables future features

---

## 🧪 TESTING PLAN

### Test Case 1: Multi-Turn Discovery
1. Start discovery session
2. Answer "How many children?" = 2
3. System asks about oldest
4. Correct: "It's my youngest who has ADHD"
5. **Verify:** All previous messages still visible
6. **Verify:** No "Let's start with oldest" loop

### Test Case 2: Rapid Messaging
1. Start discovery session
2. Send message, wait for response
3. **Immediately** send another message before response finishes
4. **Verify:** Both messages and responses appear
5. **Verify:** No messages disappear

### Test Case 3: Mid-Session Refresh
1. Start discovery session
2. Answer 3-4 questions
3. **Hard refresh page** (Cmd+Shift+R)
4. **Verify:** All messages reload
5. **Verify:** Can continue conversation without restart

### Test Case 4: Multi-Tab Scenario
1. Open discovery session in Tab 1
2. Send some messages
3. Open same URL in Tab 2
4. **Verify:** Tab 2 shows same conversation history
5. Send message in Tab 1
6. **Verify:** Tab 2 doesn't lose history

---

## 📊 MONITORING & ROLLBACK

### Metrics to Track
- `discovery_session_reload_count` - How often useEffect reloads during active session
- `message_save_duration_ms` - Time to save messages to DB
- `conversation_drift_events` - Frontend vs DB message count mismatches

### Rollback Plan
If Phase 1 hotfix causes issues:
1. Remove session check guards
2. Keep save-before-response change
3. Log all useEffect triggers for analysis

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1 Hotfix (Required for Today)
- [ ] Add `sessionId` check to useEffect guard
- [ ] Add `messages.some(user)` active conversation guard
- [ ] Move DB save before response in `/api/chat/route.ts`
- [ ] Add logging for useEffect triggers
- [ ] Test all 4 test cases above
- [ ] Deploy to staging
- [ ] Test with real user scenario
- [ ] Deploy to production
- [ ] Monitor for 24 hours

### Phase 2 (Next Week)
- [ ] Implement session lock utility
- [ ] Wrap API operations in lock
- [ ] Add comprehensive error handling
- [ ] Load test with concurrent requests
- [ ] Deploy to production

### Phase 3 (Future)
- [ ] Enable Supabase Realtime
- [ ] Implement real-time subscription
- [ ] Test multi-tab scenarios
- [ ] Remove manual loading logic
- [ ] Deploy incrementally

---

**Created:** November 19, 2025  
**Next Review:** After Phase 1 deployment (tomorrow)
