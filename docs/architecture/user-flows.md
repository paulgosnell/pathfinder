# User Flows - ADHD Support Agent

## Overview

This document describes the user interaction flows for the ADHD Support Agent application. The app is designed with **minimal cognitive load** - users can start conversations immediately without making decisions about session types or durations.

## Core Design Principles

1. **Frictionless Entry**: No session selection on chat/voice pages - users go straight to conversation
2. **Discovery is Optional**: New users can dismiss discovery banner and try the app immediately
3. **Coaching is Separate**: Full GROW coaching sessions are booked separately, not forced on users
4. **Mode-Aware**: Different contexts (check-in vs coaching vs discovery) have appropriate prompts and time budgets

---

## 🌟 Primary User Flows

### Flow 1: First-Time User (Optional Discovery)

```
Landing Page (/)
     │
     ├─► Sign up for waitlist (optional)
     │   └─► Email captured → Confirmation page
     │
     └─► Login/Sign up
         └─► Redirected to /chat
             │
             ├─► Discovery Banner shown
             │   ├─► Click "Start Discovery" → Discovery session (8-10 exchanges)
             │   │   └─► Profile/family data captured → Saved to user_profiles
             │   │
             │   └─► Click "✕" (dismiss) → Banner hidden (shows on profile/family pages later)
             │
             └─► Start chatting immediately (check-in mode)
                 └─► "How are you doing today?" (5-15 min casual conversation)
```

**Key Points:**
- Discovery is **optional and dismissible**
- Users can chat immediately without completing discovery
- If dismissed, banner reappears on profile and family pages (where discovery data is displayed)

---

### Flow 2: Check-in Mode (Default Chat/Voice)

```
/chat or /voice
     │
     └─► Loads immediately (NO session selection UI)
         │
         ├─► Chat: Shows "How are you doing today?"
         │   └─► Casual 5-15 minute conversation
         │       ├─► Open-ended questions
         │       ├─► Emotional validation
         │       ├─► Opportunity to vent
         │       └─► No structured GROW model
         │
         └─► Voice: Shows microphone button
             └─► Click to start speaking
                 └─► Same check-in conversation, voice-optimized
```

**Key Points:**
- **Default mode**: Check-in (not coaching)
- **No time pressure**: Conversation ends naturally
- **No session selection**: Goes straight to microphone/chat
- **Interaction mode**: `'check-in'` sent to API
- **Time budget**: 15 minutes suggested, not enforced

---

### Flow 3: Book Coaching Session (Structured GROW)

```
Navigation Drawer
     │
     └─► Click "Book Coaching Session"
         └─► CoachingBookingModal opens
             │
             ├─► Select time: 30 or 50 minutes
             │
             ├─► "Start Now" option
             │   └─► /chat?new=true&mode=coaching&time=30
             │       └─► Full GROW model session
             │           ├─► Goal (10%)
             │           ├─► Reality (60%) - min 10-15 exchanges
             │           ├─► Options (20%)
             │           └─► Will (10%)
             │
             └─► "Schedule for later" option
                 └─► Calendar event generated (.ics file)
                     └─► User reminded to book via calendar
```

**Key Points:**
- **Explicitly booked**: Users choose to have a structured session
- **Time commitment clear**: 30 or 50 minutes selected upfront
- **GROW model applied**: Goal, Reality, Options, Will framework
- **Separate from check-in**: Different interaction mode (`'coaching'`)

---

### Flow 4: Discovery Session (New Users)

```
Discovery Banner
     │
     └─► Click "Start Discovery Session"
         └─► /chat?new=true&sessionType=discovery
             │
             └─► Conversational onboarding (8-10 exchanges)
                 │
                 ├─► Parent information gathered:
                 │   ├─► Name (optional)
                 │   ├─► Relationship to child
                 │   ├─► Age range
                 │   └─► Support system strength
                 │
                 ├─► Child information gathered:
                 │   ├─► Age and developmental stage
                 │   ├─► Key challenges and triggers
                 │   ├─► Strengths and interests
                 │   └─► Strategies already tried
                 │
                 └─► Data saved to user_profiles table
                     └─► discovery_completed = true
                         └─► Banner no longer shows
```

**Key Points:**
- **8-10 exchanges**: Brief conversational data collection
- **Casual tone**: Not a form, but a conversation
- **Profile population**: Data auto-fills profile and family pages
- **One-time flag**: `discovery_completed` prevents re-showing

---

## 🎯 Session Type Mapping

### SessionType (6 types in code)
```typescript
type SessionType =
  | 'check-in'    // Default casual conversation (5-15 mins)
  | 'discovery'   // New user onboarding (8-10 exchanges)
  | 'quick-tip'   // Quick advice (maps to check-in)
  | 'update'      // Status update (maps to check-in)
  | 'strategy'    // Strategy discussion (maps to check-in)
  | 'crisis'      // Crisis detection (maps to check-in)
  | 'coaching'    // Full GROW session (30-50 mins)
```

### Interaction Mode (API context)
```typescript
type InteractionMode = 'check-in' | 'coaching'

// Check-in: Casual, unstructured, validating (DEFAULT)
// Coaching: GROW model, structured, goal-focused (BOOKED)
```

### Voice Prompt Modes (3 types)
```typescript
type VoiceMode = 'discovery' | 'check-in' | 'coaching'

// Mapping:
// - discovery → discovery voice prompt
// - coaching → coaching voice prompt
// - All others → check-in voice prompt
```

---

## 🚦 Navigation Flow

```
Landing Page (/)
     │
     ├─► /chat (protected) - Check-in mode, discovery banner
     ├─► /voice (protected) - Check-in mode, no discovery banner
     ├─► /profile (protected) - Profile settings, discovery banner
     ├─► /family (protected) - Family info (coming soon), discovery banner
     └─► /auth/login - Authentication flow
```

### Navigation Drawer Links
- **Dashboard** → `/chat` (default)
- **Voice Coaching** → `/voice`
- **Book Coaching Session** → Opens CoachingBookingModal
- **Session History** → `/history` (coming soon)
- **My Family** → `/family` (coming soon)
- **Profile Settings** → `/profile`
- **Logout** → Sign out

---

## 💾 Data Persistence Flow

### Check-in/Coaching Conversations
```
User message → API /chat route
     │
     ├─► Save to agent_conversations table
     │   ├─► session_id (UUID)
     │   ├─► role ('user' | 'assistant')
     │   ├─► content (message text)
     │   ├─► mode ('chat' | 'voice')
     │   └─► created_at (timestamp)
     │
     └─► Session metadata → agent_sessions table
         ├─► session_id
         ├─► user_id
         ├─► session_type ('check-in' | 'coaching')
         ├─► interaction_mode ('check-in' | 'coaching')
         ├─► time_budget_minutes (15 | 30 | 50)
         └─► GROW phase tracking (if coaching)
```

### Discovery Data
```
Discovery session → user_profiles table
     │
     ├─► Parent data:
     │   ├─► parent_name
     │   ├─► relationship_to_child
     │   ├─► parent_age_range
     │   └─► support_system_strength
     │
     ├─► Child data:
     │   ├─► child_age_range
     │   ├─► child_challenges (text)
     │   ├─► child_strengths (text)
     │   └─► strategies_tried (text)
     │
     └─► Flags:
         ├─► discovery_completed = true
         └─► created_at (timestamp)
```

### Voice Transcripts
```
Voice conversation → /api/voice-transcript
     │
     └─► Same tables as chat:
         ├─► agent_conversations (mode = 'voice')
         └─► agent_sessions (session_type, interaction_mode)
```

---

## 🎨 UI State Management

### Chat Page State
```typescript
const [sessionType, setSessionType] = useState<SessionType>('check-in'); // Always check-in
const [messages, setMessages] = useState<Message[]>([]);
const [isNewSession, setIsNewSession] = useState(true);
const [discoveryCompleted, setDiscoveryCompleted] = useState<boolean | null>(null);

// Discovery banner logic:
// - Check user_profiles.discovery_completed
// - Show banner if false
// - User can dismiss (component-level state)
// - Banner reappears on profile/family pages if dismissed
```

### Voice Page State
```typescript
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

// NO session selection state
// NO time budget selection
// Goes straight to ElevenLabsVoiceAssistant with:
// - sessionType="coaching" (default for voice)
// - timeBudgetMinutes=50
```

### Discovery Banner State (Component)
```typescript
const [discoveryCompleted, setDiscoveryCompleted] = useState<boolean | null>(null);
const [dismissed, setDismissed] = useState(false);

// Shows if:
// - discoveryCompleted === false
// - dismissed === false
```

---

## 🔄 URL Parameters

### Chat Page
```
/chat                           → Default check-in mode
/chat?new=true                  → Start new check-in session
/chat?new=true&sessionType=discovery → Start discovery session
/chat?new=true&mode=coaching&time=30 → Start 30-min coaching session
/chat?new=true&mode=coaching&time=50 → Start 50-min coaching session
```

### Voice Page
```
/voice → Always starts in check-in mode, no URL params
```

---

## 📊 Analytics & Tracking

### Session Tracking
- **session_id**: Unique identifier for conversation thread
- **session_type**: What kind of session (check-in, discovery, coaching)
- **interaction_mode**: How agent behaves (check-in vs coaching)
- **time_budget_minutes**: Suggested duration
- **mode**: Chat or voice interface

### Performance Metrics (agent_performance table)
- **total_tokens**: Token usage per session
- **total_cost**: Cost calculation ($0.00015/1K input, $0.0006/1K output)
- **response_time_ms**: Latency tracking
- **crisis_detected**: Safety flag

### User Metrics (user_profiles table)
- **discovery_completed**: Boolean flag
- **last_session_at**: Timestamp of last interaction
- **total_sessions**: Count of all sessions

---

## 🚨 Error Flows

### Crisis Detection
```
User message contains crisis indicators
     │
     └─► Crisis agent triggered (runs BEFORE main agent)
         │
         ├─► Risk level: CRITICAL
         │   └─► Immediate emergency resources
         │       ├─► 999 (UK emergency)
         │       ├─► Samaritans 116 123
         │       └─► Stop processing, log for safety
         │
         └─► Risk level: LOW/MEDIUM
             └─► Pass to main agent with context
                 └─► Gentle check-in and support
```

### Authentication Failures
```
Unauthenticated request to /chat or /voice
     │
     └─► Redirect to /auth/login
         └─► After login → Redirect back to original page
```

### Session Load Failures
```
Session ID not found in database
     │
     └─► Start new session instead
         └─► Log error for monitoring
```

---

## 🎯 Success Metrics

### Check-in Success
- User completes conversation naturally (no forced end)
- Emotions validated (tracked in session state)
- User feels heard

### Coaching Success
- User reaches Will phase with own action plan
- Minimum 10 exchanges in Reality phase
- Parent-generated solutions (not bot prescriptions)
- Confidence score 7+ on action commitment

### Discovery Success
- 8-10 exchanges completed
- All key profile fields populated
- User understands app capabilities
- `discovery_completed = true`

---

## 📝 Developer Notes

### Adding New Session Types
1. Add to `SessionType` union in `/lib/types/sessions.ts`
2. Map to interaction mode in `/app/api/chat/route.ts`
3. If voice needed, map to voice mode in `/components/ElevenLabsVoiceAssistant.tsx`
4. Update session type card if displayed anywhere

### Modifying User Flows
1. Update this document first (source of truth)
2. Check impact on discovery banner logic
3. Verify URL parameter handling in chat page
4. Test with both new and returning users

### Testing User Flows
```bash
# Test check-in flow
curl /api/chat -d '{"sessionType":"check-in","interactionMode":"check-in"}'

# Test discovery flow
curl /api/chat -d '{"sessionType":"discovery"}'

# Test coaching flow
curl /api/chat -d '{"sessionType":"coaching","interactionMode":"coaching","timeBudgetMinutes":30}'
```

---

## 🔗 Related Documentation

- [System Architecture](./system-architecture.md) - Technical architecture diagrams
- [Coaching Methodology](../features/coaching-methodology.md) - GROW/OARS framework
- [Voice Mode Setup](../features/voice-mode-setup.md) - ElevenLabs integration
- [Database Schema](../../migrations/) - Database structure and migrations
