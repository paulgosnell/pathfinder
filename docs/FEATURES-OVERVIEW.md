# Pathfinder: Features & Functions Overview

**Quick reference guide to what Pathfinder does and how it works**

---

## What is Pathfinder?

Pathfinder is an AI-powered coaching platform for parents of children with ADHD. Unlike advice-giving chatbots, Pathfinder uses professional coaching methodology (GROW model + OARS framework) to help parents discover their own solutions through facilitative conversation.

**Core Philosophy**: Parents are the experts on their child. Pathfinder facilitates their thinking through deep exploration and reflection rather than prescribing fixes.

---

## Key Features

### 1. Text Chat Coaching
**Location**: `/chat`

**What it does**:
- Full 50-minute coaching conversations using the GROW model
- Deep exploration of current reality (10-15 exchanges minimum)
- Helps parents discover their own solutions
- Tracks session progress through coaching phases

**How it works**:
- Goal: What do you want to achieve with your child?
- Reality: Deep dive into current situation (60% of session time)
- Options: Parent generates their own solutions
- Will: Parent commits to specific action plan

**Session tracking**:
- Conversation depth counter (ensures thorough exploration)
- Emotions reflected (validation tracking)
- Exceptions explored (solution-focused techniques)
- Parent-generated ideas (their solutions, not bot's)

### 2. Voice Mode
**Location**: `/voice`

**What it does**:
- Real-time voice coaching using ElevenLabs AI
- Two modes: Quick check-in (5-15 min) or full coaching (30-50 min)
- Natural conversational dialogue with interruption support
- Automatic transcript saving to database

**How it works**:
- Zero-backend architecture (ElevenLabs handles STT/TTS/LLM)
- WebRTC for low-latency audio streaming (~300ms response)
- Runtime prompt overrides controlled from code (not dashboard)
- Unified storage with text chat (same database tables)

**Session types**:
- **Check-in**: Casual supportive conversation, no formal structure
- **Coaching**: Full GROW model session with deep exploration

**Cost**: ~$0.40 per 50-minute session (vs $0.01 for text chat)

### 3. Crisis Safety System

**What it does**:
- Automatic detection of suicidal ideation, violence risk, severe burnout
- Immediate emergency resource provision
- Crisis agent runs BEFORE main coaching agent (priority #1)

**Emergency resources provided**:
- 999 (Emergency services)
- Samaritans 116 123 (24/7 support)
- NSPCC 0808 800 5000 (Child protection)
- Family Lives 0808 800 2222 (Parent support)

**How it works**:
- Two-tier processing: Crisis check first, then coaching
- Separate crisis agent with dedicated detection logic
- Overrides normal conversation flow when triggered

### 4. Evidence-Based Strategy Database

**What it does**:
- 50+ evidence-based ADHD parenting strategies
- Age-appropriate filtering (5-8, 9-12, 13-17)
- Implementation steps, timeframes, success indicators

**Strategy categories**:
- Emotional regulation
- Executive function support
- Communication techniques
- Behavioral interventions
- School collaboration
- Self-care for parents

**How it's used**:
- Agent retrieves relevant strategies during Options phase
- Parent chooses which strategies resonate
- Implementation guidance provided
- Follow-up tracking in future sessions

### 5. User Profile & Context Memory

**What it does**:
- Learns about user's child (age, ADHD presentation, challenges)
- Tracks successful strategies from previous sessions
- Remembers parenting style preferences
- Stores goals and action plans

**Database structure**:
- `user_profiles` table with learned context
- `agent_sessions` table for session history
- `agent_conversations` table for message transcripts
- Automatic 2-year retention with GDPR compliance

### 6. Waitlist & Landing Page

**Location**: `/` (public homepage)

**What it does**:
- Email signup for early testing and launch notifications
- Early tester opt-in checkbox
- Email validation and duplicate detection
- Success confirmation page

**Database**: `waitlist_signups` table with RLS policies

---

## Core Functions

### Coaching Methodology (GROW Model)

**Phase breakdown**:
1. **Goal** (5-10 minutes): What do you want to achieve?
2. **Reality** (30 minutes): Deep exploration of current situation
   - Minimum 10 exchanges before moving to Options
   - 60% of session time spent here
   - Focus on what's working, not just what's broken
3. **Options** (10 minutes): Parent generates solutions
   - Agent facilitates brainstorming
   - Strategy database consulted if helpful
4. **Will** (5 minutes): Commit to specific action plan
   - SMART goals
   - Accountability measures

### OARS Framework (Communication Techniques)

**O - Open Questions**:
- "What have you noticed about..."
- "How does that affect..."
- "What's been most challenging?"

**A - Affirmations**:
- Recognize strengths and efforts
- Validate emotions before problem-solving
- Build parent confidence

**R - Reflective Listening**:
- Mirror back emotions heard
- Summarize parent's insights
- Check understanding

**S - Summaries**:
- Recap key points at phase transitions
- Synthesize parent's own discoveries
- Confirm action plan commitments

### Session State Tracking

**What's tracked**:
- Current GROW phase (goal, reality, options, will, closing)
- Conversation depth counter (ensures thorough Reality exploration)
- Emotions reflected (validation tracking)
- Exceptions explored (solution-focused technique tracking)
- Parent-generated ideas (their solutions, not bot's)
- Ready for Options flag (only true after 10+ exchanges)

**Why it matters**:
- Prevents premature advice-giving
- Ensures deep exploration before solutions
- Tracks coaching quality metrics
- Enables session continuity across conversations

### Multi-Agent Architecture

**Agent hierarchy**:
1. **Crisis Agent** (runs first, always)
   - File: `lib/agents/crisis-tools-agent.ts`
   - Detects emergency situations
   - Overrides normal flow if triggered

2. **Main Coaching Agent** (runs if no crisis)
   - File: `lib/agents/proper-tools-agent.ts` (text chat)
   - File: `lib/agents/voice-prompts.ts` (voice mode)
   - Implements GROW/OARS methodology
   - Manages session state progression

3. **Strategy Agent** (called by main agent)
   - File: `lib/agents/strategy-agent.ts`
   - Retrieves evidence-based strategies
   - Filters by age appropriateness

### Data Persistence

**Database tables**:
- `users`: Auth users + GDPR consent (5 rows)
- `user_profiles`: Learned user context (3 rows)
- `agent_sessions`: Coaching sessions (10 rows)
- `agent_conversations`: Chat/voice transcripts (162 rows)
- `agent_performance`: Token usage tracking (75 rows)
- `waitlist_signups`: Email signups (0 rows - new feature)

**GDPR compliance**:
- Automatic 2-year data retention
- User consent management
- Data deletion utilities
- Audit trail tracking

---

## User Journeys

### First-Time User
1. Land on homepage (`/`)
2. Read about GROW coaching approach
3. Sign up for waitlist OR proceed to chat
4. Authenticate (if not on waitlist)
5. Choose text chat or voice mode
6. Start first coaching session:
   - Share goal for their child
   - Deep exploration of current reality
   - Discover own solutions
   - Commit to action plan

### Returning User
1. Log in to account
2. See session history
3. Choose to:
   - Continue previous coaching conversation
   - Start new goal-focused session
   - Quick voice check-in for support
4. Agent references previous context:
   - Remembers child's age and challenges
   - Recalls successful strategies tried
   - Follows up on commitments made

### Voice Mode Check-In
1. Navigate to `/voice`
2. Select "Check-in" mode
3. Allow microphone access
4. Casual 5-15 minute conversation:
   - How's the week going?
   - Celebrate wins
   - Brief support for challenges
   - No formal GROW structure
5. Transcript automatically saved

### Voice Mode Full Coaching
1. Navigate to `/voice`
2. Select "Coaching" mode
3. Allow microphone access
4. 30-50 minute structured session:
   - Same GROW model as text chat
   - Voice-optimized prompts (shorter sentences)
   - Natural conversational flow
   - Full transcript persistence

---

## Technical Stack

**Frontend**:
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- ElevenLabs React SDK (`@elevenlabs/react`)

**Backend**:
- Next.js API Routes
- Vercel AI SDK v5
- OpenAI GPT-4o-mini
- Supabase (PostgreSQL + Auth + RLS)
- ElevenLabs Conversational AI

**Key Libraries**:
- `ai`: Vercel AI SDK for streaming chat
- `@supabase/supabase-js`: Database client
- `@elevenlabs/react`: Voice UI components
- `zod`: Schema validation
- `nanoid`: Session ID generation

**Infrastructure**:
- Vercel (hosting)
- Supabase (database + auth)
- OpenAI (text chat LLM)
- ElevenLabs (voice mode STT/TTS/LLM)

---

## API Endpoints

### `/api/chat` (POST)
**Purpose**: Main text chat endpoint

**Flow**:
1. Receives user message
2. Runs crisis detection agent
3. If crisis: Returns emergency resources
4. If no crisis: Runs coaching agent
5. Updates session state tracking
6. Streams response back
7. Saves conversation to database

**Request**:
```json
{
  "messages": [...],
  "sessionId": "uuid"
}
```

**Response**: Streaming text response with session state updates

### `/api/voice-transcript` (POST)
**Purpose**: Save voice conversation transcripts

**Flow**:
1. Receives transcript from ElevenLabs webhook
2. Saves to `agent_conversations` table
3. Updates session state
4. Returns success confirmation

**Request**:
```json
{
  "sessionId": "uuid",
  "transcript": "...",
  "role": "user" | "assistant"
}
```

### `/api/waitlist` (POST)
**Purpose**: Waitlist email signup

**Flow**:
1. Validates email format
2. Checks for duplicates
3. Saves to `waitlist_signups` table
4. Returns success/error

**Request**:
```json
{
  "email": "parent@example.com",
  "early_tester": true
}
```

---

## Performance Metrics

**Text Chat**:
- Average response time: ~2-3 seconds
- Cost per session: ~$0.01
- Token usage: ~3,000-5,000 per session
- Concurrent users supported: 100+

**Voice Mode**:
- Average response latency: ~300ms
- Cost per session: ~$0.40 (50 minutes)
- Concurrent users supported: 10+ (ElevenLabs limits)

**Database**:
- Current sessions: 10
- Total messages: 162
- Active users: 5
- Storage: <1GB

---

## Security & Compliance

**Authentication**:
- Supabase Auth (email/password)
- Row-level security (RLS) on all tables
- Protected routes for chat/voice

**Data Privacy**:
- GDPR compliant
- 2-year automatic retention
- User consent tracking
- Data deletion on request
- Audit trail logging

**Crisis Safety**:
- Mandatory crisis check on every message
- Emergency resource provision
- Clear disclaimer: Not a replacement for professional care

---

## Development Workflow

### Local Development
```bash
cd adhd-support-agent
npm install
npm run dev  # localhost:3000
```

### Environment Variables Required
```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_...
```

### Database Migrations
```bash
# Apply migrations in Supabase SQL Editor
# Files in migrations/ directory
# Order matters - run sequentially
```

### Testing
```bash
npm test  # Run Jest test suite
npm run lint  # Run ESLint
```

### Deployment
```bash
# Automatic via Vercel Git integration
# Or manual:
vercel deploy --prod
```

---

## Recent Updates (October 2025)

**Database Cleanup**:
- Removed 5 unused monitoring tables
- Cleaned up old discovery phase columns
- Deleted dead TypeScript code

**Voice UI Redesign**:
- Replaced emojis with Lucide icons
- Proper button padding and spacing
- Inline styles to avoid caching issues

**Removed LiveKit**:
- ElevenLabs is now the only voice implementation
- Cleaner `/voice` URL (was `/voice-v2`)

**Landing Page & Waitlist**:
- Public homepage at `/`
- Email signup system
- Chat moved to `/chat` (protected route)

**Coaching Transformation**:
- Full 50-minute GROW model sessions
- Minimum 10 exchanges in Reality phase
- Session state tracking for coaching quality

---

## Future Roadmap

**Phase 1: User Testing** (Current)
- Collect feedback from ADHD parents
- Refine coaching prompts
- A/B test voice vs text preferences

**Phase 2: Feature Enhancements**
- Progress tracking dashboard
- Strategy library browsing
- Session summary emails
- Parent community features

**Phase 3: Scale & Monetization**
- Subscription tiers
- Professional coaching add-ons
- Integration with schools/therapists
- Mobile app (React Native)

---

## Support & Resources

**Documentation**:
- `PROJECT-MASTER-DOC.md`: Complete technical documentation (30,000+ words)
- `EXECUTIVE-SUMMARY.md`: Business overview for stakeholders
- `COACHING-METHODOLOGY.md`: Full coaching approach guide
- `USER-TESTING.md`: UAT workflow and feedback process
- `BACKLOG.md`: Prioritized feature backlog

**Slash Commands** (Claude Code):
- `/uat`: Load user testing context
- `/backlog`: Manage product backlog

**Getting Help**:
- Check documentation first
- Review session logs in Supabase
- Test in staging environment
- Consult coaching methodology guide

---

*Last updated: January 2025*
