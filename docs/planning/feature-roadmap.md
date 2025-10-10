# Feature Roadmap

Comprehensive feature development plan for the ADHD Parent Coaching Agent.

**Last Updated:** October 2025
**Current Version:** v2.0 (Coaching Transformation Complete)

---

## 🎯 Core Principles

All features should:
- **Center the parent**: They're the experts on their child
- **Facilitate discovery**: Help parents find their own solutions
- **Respect time**: Adapt to parent's availability
- **Build on strengths**: Focus on what's working
- **Maintain safety**: Crisis detection always prioritized

---

## 📋 Feature Categories

### 1. Session Experience & Pacing

#### 1.1 Time Available Prompt
**Priority:** High
**Status:** Planned
**Effort:** 3-4 days

**User Story:**
Parents need different depths of engagement depending on their available time.

**Implementation:**
- Add session type selector at conversation start
  - "Quick help (≈5 min)" - Focused problem-solving
  - "Deep session (≈50 min)" - Full GROW model coaching
- Adjust pacing rules based on selection:
  - **Quick**: 2-3 Reality exchanges before Options
  - **Deep**: 10-15 Reality exchanges (current behavior)
- Store selection in session metadata
- Update agent prompts with time-awareness context

**Technical Details:**
```typescript
// Add to session creation
interface SessionMetadata {
  sessionType: 'quick' | 'deep';
  estimatedDuration: number; // minutes
  startedAt: Date;
}

// Update GROW phase progression rules
const minRealityExchanges = sessionType === 'quick' ? 2 : 10;
```

**Success Metrics:**
- Session completion rate by type
- User satisfaction per type
- Actual vs. estimated duration

---

#### 1.2 Enhanced Session Closure
**Priority:** Medium
**Status:** Planned
**Effort:** 2-3 days

**User Story:**
Sessions should end with clear action plans and offer follow-up support.

**Implementation:**
- At closure phase:
  - Ask "Anything else you want to cover?"
  - Summarize parent's self-generated action plan
  - Offer proactive check-in scheduling
- Add follow-up system:
  - Schedule auto-message in 2-3 days
  - Reference specific action plan items
  - Store reminders tied to child and topic
- Database schema addition:

```sql
CREATE TABLE session_follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(id),
  user_id UUID REFERENCES auth.users(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  action_plan_summary TEXT,
  topic_tags TEXT[],
  child_reference TEXT,
  completed BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Success Metrics:**
- Follow-up opt-in rate
- Response rate to check-ins
- Reported action plan completion

---

### 2. User Profile & Context Management

#### 2.1 Improved Intake Questions
**Priority:** High
**Status:** Planned
**Effort:** 4-5 days

**User Story:**
Returning users shouldn't be re-asked known information, and new users need smooth onboarding.

**Implementation:**
- First session intake:
  - Child's name
  - Age and school stage
  - Primary concerns/challenges
- Persist to user profile table
- Auto-inject context in future sessions
- Add "update details" flow accessible from settings
- Guardrails to avoid re-asking:
  - Check profile completeness before intake
  - Only ask for missing data
  - Offer profile review every 3 months

**Database Schema:**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  children JSONB[], -- array of child objects
  primary_concerns TEXT[],
  profile_completed_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child object structure
{
  "name": "Alex",
  "age": 9,
  "school_stage": "primary",
  "adhd_type": "combined",
  "diagnosis_date": "2023-05",
  "key_challenges": ["morning routine", "homework resistance"],
  "strengths": ["creative", "empathetic"]
}
```

**Success Metrics:**
- Profile completion rate
- Reduction in re-asked questions
- Session personalization effectiveness

---

#### 2.2 Memory Buckets & Layered Summaries
**Priority:** High
**Status:** Planned
**Effort:** 1-2 weeks

**User Story:**
The agent should remember past conversations and build cumulative understanding of each family.

**Implementation:**
- **Topic Buckets** (auto-tagged):
  - Sleep
  - Food/Nutrition
  - Mood Regulation
  - Schoolwork/Homework
  - Routines
  - Relationships (siblings, friends)
  - Behavior/Discipline
  - Medication
  - School Communication
- **After each session**:
  - Generate "key moments" summary (150 words max)
  - Tag with relevant buckets
  - Extract quotable insights
  - Store strategies mentioned
- **Rolling Summary** per child:
  - Aggregate key patterns across sessions
  - Cap at 500 tokens
  - Update incrementally
  - Link to full transcript history
- **Session Loading**:
  - Load: profile + rolling summary + last 3 key moments
  - Keep last 50 messages in context window
  - Persist full transcript server-side

**Database Schema:**
```sql
CREATE TABLE session_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(id),
  user_id UUID REFERENCES auth.users(id),
  key_moments TEXT,
  topic_buckets TEXT[],
  strategies_mentioned TEXT[],
  parent_insights TEXT[],
  child_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rolling_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  child_name TEXT,
  summary_text TEXT,
  token_count INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  session_count INTEGER DEFAULT 0
);
```

**Success Metrics:**
- Context relevance ratings
- "Recall last plan" usage
- Reduction in repeated explanations

---

#### 2.3 Conversation History Limits
**Priority:** Medium
**Status:** Planned
**Effort:** 2-3 days

**Implementation:**
- Keep last 50 messages for context window
- Persist full transcript server-side in `agent_messages` table
- On new session load:
  - User profile
  - Rolling summary for child
  - Last 3 key moments
  - Last 50 messages (if same session)
- Add "Recall last plan for [child/topic]" helper function
- Implement efficient context pruning

**Technical Details:**
```typescript
// Context loading priority
const sessionContext = {
  profile: await loadUserProfile(userId),
  rollingSummary: await loadRollingSummary(userId, childName),
  recentKeyMoments: await loadKeyMoments(userId, limit: 3),
  recentMessages: await loadMessages(sessionId, limit: 50),
  totalTokens: calculateTokens(...contexts)
};

// Ensure < 8000 tokens for context
```

---

### 3. Conversation Quality & Tone

#### 3.1 Natural Language & Tone Refinement
**Priority:** High
**Status:** Planned
**Effort:** Ongoing (3-4 days initial)

**User Story:**
The agent should sound authentic and warm without relying on canned empathy phrases.

**Implementation:**
- **Vocabulary Guidelines**:
  - **Avoid**: "That must be really hard for you", "I can imagine how difficult..."
  - **Prefer**: "Got it", "Thanks for sharing", "Tell me more", "What else?"
- **Varied Acknowledgments**:
  - Create phrase bank (50+ variations)
  - Rotate based on context
  - Match parent's communication style
- **Micro-fillers for voice**:
  - Short pauses ("...")
  - Thinking sounds ("mm-hmm", "okay")
  - Natural transitions
- **A/B Testing Framework**:
  - Log phrasing variant used
  - Collect user satisfaction tags
  - Iterate on highest-rated patterns

**Prompt Enhancement:**
```
TONE GUIDELINES:
- Be warm but not performatively empathetic
- Mirror the parent's energy and vocabulary
- Use short acknowledgments naturally
- Avoid therapy-speak unless parent uses it first
- Be conversational, not clinical
- Let silence be okay (don't fill every gap)

AVOID:
❌ "That must be really hard for you"
❌ "I can only imagine..."
❌ "I'm sorry you're going through this"

PREFER:
✅ "Got it. What happened next?"
✅ "Mm-hmm. Tell me more."
✅ "Okay. So then..."
✅ [brief pause] "And?"
```

**Success Metrics:**
- Session satisfaction ratings
- Phrase variant performance
- User retention by tone style

---

### 4. Voice Mode Integration ✅

#### 4.1 Dual Voice Mode Implementation (A/B Testing)
**Priority:** High
**Status:** ✅ COMPLETE
**Completed:** October 2025

**Implemented Features:**
- ✅ **TWO voice implementations** for A/B testing quality/cost
- ✅ Dropdown navigation in `/chat` header to switch between modes
- ✅ Both modes use GROW/OARS coaching methodology
- ✅ Protected routes with authentication
- ✅ Audio visualization and control UI
- ✅ Natural conversation with interruption support

**Voice Mode 1: LiveKit (`/voice`)**
- **STT**: Deepgram (nova-2-general)
- **LLM**: OpenAI GPT-4o-mini
- **TTS**: OpenAI TTS (voice: "nova")
- **Backend**: Python LiveKit agent (`voice-agent/agent.py`)
- **Frontend**: `app/voice/page.tsx` + `components/VoiceAssistant.tsx`
- **API**: `/app/api/voice-token/route.ts`
- **Cost**: ~$0.10-0.20 per 50-min session

**Voice Mode 2: ElevenLabs (`/voice-v2`)**
- **Platform**: ElevenLabs Conversational AI Agents API
- **Agent ID**: `agent_2901k71gtfhmeex8rkxqwtnybhr4`
- **SDK**: `@elevenlabs/react`
- **Frontend**: `app/voice-v2/page.tsx` + `components/ElevenLabsVoiceAssistant.tsx`
- **Voice Quality**: Higher naturalness, more expressive
- **Cost**: ~$0.25-0.35 per 50-min session (premium quality)

**A/B Testing Framework:**
- Users can choose between "LiveKit Voice" or "ElevenLabs Voice" via dropdown
- Both use same coaching prompts for fair comparison
- Track metrics: quality ratings, completion rates, cost per session

#### 4.2 Voice Mode Enhancements (Future)
**Priority:** Medium
**Status:** Planned
**Effort:** 2-3 weeks

**Remaining Enhancements:**
- [ ] Session transcript persistence to Supabase
- [ ] Unified session history (voice + chat combined view)
- [ ] In-app modality switching (start in chat, switch to voice mid-session)
- [ ] Voice session summaries and follow-ups
- [ ] Regional accent/voice options
- [ ] Session state sync between voice and chat modalities
- [ ] Voice-optimized coaching prompts (shorter responses)

**Success Metrics (To Track):**
- Voice session completion rate
- Average session duration
- Voice vs chat preference
- User satisfaction by modality
- Cost per voice session

---

### 5. Strategy Knowledge Base

#### 5.1 Strategy Database Scaffolding
**Priority:** High
**Status:** Basic implementation exists (16 strategies)
**Effort:** 1-2 weeks

**Implementation:**
- Create comprehensive data model
- Ingest initial 100 evidence-based strategies
- De-duplicate by topic
- Add "suggest strategy" action from chat
- Log strategy selections and effectiveness

**Enhanced Schema:**
```sql
CREATE TABLE strategies_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  age_range TEXT[], -- ['5-8', '9-12', '13-17']
  audience TEXT[], -- ['parents', 'educators', 'both']
  topic_buckets TEXT[],
  difficulty TEXT, -- 'easy', 'moderate', 'advanced'
  time_to_implement TEXT, -- '1 day', '1 week', '2-4 weeks'
  steps JSONB,
  success_indicators TEXT[],
  citations JSONB[], -- {source, url, publication, year}
  evidence_level TEXT, -- 'research-backed', 'expert-recommended', 'community-validated'
  prerequisites TEXT[],
  related_strategies UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⚠️ REMOVED Oct 2025: strategy_usage table
-- Never implemented - no insert/update logic exists
-- See: DATABASE-CLEANUP.md for details
--
-- CREATE TABLE strategy_usage (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   strategy_id UUID REFERENCES strategies_v2(id),
--   user_id UUID REFERENCES auth.users(id),
--   session_id UUID REFERENCES agent_sessions(id),
--   suggested_at TIMESTAMPTZ DEFAULT NOW(),
--   user_interest TEXT, -- 'selected', 'dismissed', 'bookmarked'
--   effectiveness_rating INTEGER, -- 1-5, null until follow-up
--   feedback TEXT
-- );
```

**⚠️ NOTE**: This feature (strategy tracking) was planned but never implemented. The `strategy_usage` table was removed in October 2025 cleanup. If implementing this feature in the future, recreate the table and add tracking logic.

**Strategy Source Pipeline (if reimplemented):**
- Public research databases (CHADD, ADDitude)
- Evidence-based parenting programs
- Clinical guidelines (NICE, AAP)
- User-contributed (moderated)

**Success Metrics (if reimplemented):**
- Strategy suggestion acceptance rate
- Effectiveness ratings over time
- Most successful strategies by age/topic

---

#### 5.2 Content Card Embeds
**Priority:** Medium
**Status:** Planned
**Effort:** 1-2 weeks

**Implementation:**
- Support inline components in chat:
  - Breathing exercises (interactive)
  - Short video embeds
  - Checklists (checkable)
  - Routine templates (customizable)
  - Visual schedules
- "Preview + subscribe" CTA for premium content
- No need to leave chat interface

**Example Components:**
```tsx
<BreathingExercise type="4-7-8" />
<ChecklistCard items={morningRoutineSteps} />
<VideoEmbed src="adhd-friendly-homework-setup" duration={90} />
<RoutineTemplate type="morning" ageGroup="5-8" />
```

**Success Metrics:**
- Interaction rate with cards
- Completion rate for exercises
- Content type preferences

---

#### 5.3 Podcast & Book Ingestion Pipeline
**Priority:** Low
**Status:** Planned (stubs)
**Effort:** 2-3 weeks

**Implementation:**
- **Upload endpoints**:
  - `/api/ingest/transcript` - Podcast transcripts
  - `/api/ingest/pdf` - Book PDFs
- **PDF Processing**:
  - Require text-layer PDFs
  - Reject image-only (add OCR fallback in future)
  - Extract actionable parent guidance
  - Generate quotable snippets with citations
- **Content Processing**:
  - Summarize to parent-actionable steps
  - Tag with topic buckets
  - Extract key insights
  - Link to original source
- **Content Sources**:
  - Claire Stapley (How to ADHD podcast)
  - Edmund Sonuga-Barke books
  - CHADD webinars
  - Research papers

**Schema:**
```sql
CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT, -- 'podcast', 'book', 'article', 'video'
  title TEXT NOT NULL,
  author TEXT,
  publication_date DATE,
  original_url TEXT,
  transcript_url TEXT,
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  topic_buckets TEXT[],
  key_insights JSONB[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_snippets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES knowledge_sources(id),
  snippet_text TEXT,
  context TEXT,
  citation TEXT,
  topic_buckets TEXT[],
  actionable BOOLEAN DEFAULT FALSE,
  indexed BOOLEAN DEFAULT FALSE
);
```

---

### 6. Crisis Detection & Safety

#### 6.1 Enhanced Crisis Routing
**Priority:** High
**Status:** Basic implementation complete
**Effort:** 3-4 days

**Implementation:**
- Verify crisis classifiers active in both chat and voice
- Update referral responses with region-agnostic defaults
- Make provider list configurable by user location
- Add crisis severity levels:
  - **Level 1**: Immediate danger (suicide, violence)
  - **Level 2**: Severe distress (burnout, breakdown)
  - **Level 3**: Elevated concern (persistent stress)
- Log crisis detections for analysis

**Regional Resource Configuration:**
```typescript
const crisisResources = {
  default: {
    emergency: "999",
    crisis_line: "Samaritans 116 123",
    text_line: "SHOUT: text 85258"
  },
  US: {
    emergency: "988",
    crisis_line: "988 Suicide & Crisis Lifeline",
    text_line: "Crisis Text Line: text HOME to 741741"
  },
  // ... other regions
};
```

**Success Metrics:**
- Crisis detection accuracy (false positive rate)
- Resource engagement rate
- User safety outcomes (via follow-up surveys)

---

### 7. Access Control & Waitlist

#### 7.1 Waitlist & Access Management
**Priority:** High
**Status:** Basic waitlist complete
**Effort:** 3-4 days

**Implementation:**
- Public registration → waitlist by default
- Confirmation page with expectations
- Flag invite-only access in config
- Admin dashboard features:
  - View all waitlist signups
  - Enable/disable user access
  - Send invite emails
  - Track conversion from waitlist → active
  - Analytics: signup source, early tester interest

**Admin Dashboard Routes:**
```
/admin/waitlist
  - List all signups (sortable, filterable)
  - Bulk actions (approve, invite, remove)
  - Email campaign tools

/admin/users
  - View active users
  - Usage statistics
  - Session history
  - Manage access levels
```

**Success Metrics:**
- Waitlist signup rate
- Waitlist → active conversion rate
- Time on waitlist

---

#### 7.2 Landing Page Enhancements
**Priority:** Medium
**Status:** Basic landing page complete
**Effort:** 2-3 days

**Implementation:**
- Update copy to emphasize two modes:
  - Quick help (5 min)
  - Deep coaching (50 min)
- Add neurodiverse-friendly design palette
- Maintain accessible typography (dyslexia-friendly fonts)
- Add social proof:
  - User testimonials (with consent)
  - Usage statistics
  - Expert endorsements
- Optimize for conversion:
  - Clear value proposition
  - Trust indicators
  - Simple signup flow

**Design Principles:**
- High contrast, low clutter
- Sans-serif fonts (Open Dyslexic as option)
- Consistent spacing and layout
- Screen reader optimized
- Keyboard navigation support

---

### 8. Analytics & Monitoring

#### 8.1 Enhanced Logging & Analytics
**Priority:** Medium
**Status:** Basic monitoring exists
**Effort:** 1 week

**Implementation:**
- **Session Metrics**:
  - Session type chosen (quick vs deep)
  - Time in session (actual vs estimated)
  - Completion rate by type
  - Follow-up opt-in rate
  - Topic buckets used
- **Conversation Metrics**:
  - Reality phase depth (exchange count)
  - Emotions reflected count
  - Exceptions explored count
  - Parent-generated ideas count
  - Strategy suggestions accepted/dismissed
- **Content Metrics**:
  - A/B tone test results
  - Content card interaction rates
  - Strategy effectiveness ratings
  - Voice vs chat preferences
- **Privacy Compliance**:
  - Minimal PII in logs
  - Align with GDPR consent flags
  - Anonymized aggregates only
  - Audit trail for data access

**Event Schema:**
```typescript
interface AnalyticsEvent {
  eventType: string;
  userId: string; // hashed
  sessionId: string;
  timestamp: Date;
  metadata: Record<string, any>;
  anonSessionId: string; // for cross-session analysis
}
```

**Dashboards:**
- Real-time usage monitoring
- Cohort analysis
- Funnel tracking (signup → first session → return)
- Strategy effectiveness trends
- Crisis detection patterns

**Success Metrics:**
- Dashboard usage by team
- Data-driven decisions made
- Feature iteration cycle time

---

### 9. Testing & Quality Assurance

#### 9.1 Comprehensive QA Checklist
**Priority:** High
**Status:** Basic tests exist
**Effort:** 1-2 weeks

**Test Coverage:**
- **Intake Prompts**:
  - First-time user flow
  - Returning user (profile exists)
  - Partial profile completion
  - Profile update flow
- **Memory System**:
  - Summary generation accuracy
  - Topic bucket tagging
  - Rolling summary updates
  - Context loading performance
- **Session Management**:
  - Time-aware pacing (quick vs deep)
  - Closure prompts
  - Follow-up scheduling
  - Session state persistence
- **Crisis Routing**:
  - Level 1/2/3 detection
  - Resource provision
  - Regional resource selection
  - Voice mode crisis handling
- **Voice Pipeline**:
  - Latency measurement
  - Transcript accuracy
  - Filler insertion
  - Session state sync

**Testing Framework:**
```bash
# E2E tests
npm run test:e2e

# Voice pipeline health
npm run test:voice

# Load testing
npm run test:load

# Accessibility audit
npm run test:a11y
```

---

### 10. Documentation & Developer Experience

#### 10.1 Updated Architecture Documentation
**Priority:** Medium
**Status:** Needs updates
**Effort:** 3-4 days

**Documentation Updates:**
- Voice/chat flow diagrams
- Memory layer architecture
- Strategy knowledge base design
- Session state machine (GROW model)
- Crisis routing flowchart
- Data models and schemas

**Developer README Updates:**
- Environment variables:
  - OpenAI/Gemini API keys
  - 11Labs credentials
  - LiveKit configuration
- Feature flags:
  - Voice mode enabled
  - Waitlist mode
  - Crisis detection level
- Bucket/tag taxonomy
- Contribution guidelines

**Files to Update:**
- [docs/architecture/system-overview.md](../architecture/system-overview.md)
- [docs/technical/api-documentation.md](../technical/api-documentation.md)
- [README.md](../../README.md)
- [CLAUDE.md](../../CLAUDE.md)

---

## 🗓️ Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Core UX improvements and data infrastructure

- [x] Landing page & waitlist (COMPLETE)
- [ ] Time available prompt (session types)
- [ ] Improved intake questions
- [ ] User profile enrichment
- [ ] Natural tone refinement (initial pass)
- [ ] QA checklist implementation

### Phase 2: Memory & Context (Weeks 5-8)
**Goal:** Intelligent conversation history and personalization

- [ ] Memory buckets implementation
- [ ] Layered summaries
- [ ] Conversation history limits
- [ ] Session closure enhancements
- [ ] Follow-up scheduling system

### Phase 3: Content & Strategies (Weeks 9-12)
**Goal:** Rich strategy database and content delivery

- [ ] Strategy database scaffolding
- [ ] Content card embeds
- [ ] 100+ evidence-based strategies
- [ ] Strategy effectiveness tracking
- [ ] Podcast/book ingestion pipeline (stubs)

### Phase 4: Voice & Modality (Weeks 13-16)
**Goal:** Unified voice/chat experience

- [x] Voice mode implementation (COMPLETE - October 2025)
- [ ] Voice session transcript persistence
- [ ] Session state sync across modalities
- [ ] In-app modality switching
- [ ] Unified session history (voice + chat)

### Phase 5: Analytics & Scale (Weeks 17-20)
**Goal:** Data-driven optimization and monitoring

- [ ] Enhanced logging & analytics
- [ ] A/B testing framework
- [ ] Admin dashboard features
- [ ] Performance optimization
- [ ] Load testing

### Phase 6: Safety & Access (Ongoing)
**Goal:** Crisis safety and controlled access

- [ ] Enhanced crisis routing
- [ ] Regional resource configuration
- [ ] Waitlist management features
- [ ] Access control system

---

## 📊 Success Criteria

### User Experience
- ✅ Session completion rate >70%
- ✅ Session type satisfaction >4.2/5
- ✅ Profile completion rate >80%
- ✅ Follow-up opt-in rate >50%
- ✅ Strategy acceptance rate >40%

### Technical Performance
- ✅ Response latency <2s (chat) / <500ms (voice)
- ✅ Context loading time <200ms
- ✅ Crisis detection accuracy >95%
- ✅ System uptime >99.5%
- ✅ Cost per session <$0.05 (chat) / <$0.30 (voice)

### Content Quality
- ✅ 100+ evidence-based strategies
- ✅ Strategy effectiveness rating >4.0/5
- ✅ Tone naturalness rating >4.2/5
- ✅ Context relevance rating >4.0/5

### Safety & Compliance
- ✅ Zero false negatives (crisis detection)
- ✅ 100% GDPR compliance
- ✅ Resource provision rate on crisis: 100%
- ✅ Data retention policy enforced

---

## 🚫 Out of Scope (For Now)

These features are valuable but not prioritized for current roadmap:

- Native mobile apps (PWA sufficient)
- Multi-language support (i18n)
- Video analysis features
- Community forum features
- Therapist integration marketplace
- Gamification & rewards
- Fine-tuned custom LLMs
- HIPAA compliance (unless required)
- White-label solutions
- Public API for third parties

---

## 💡 Quick Wins (Can Do Anytime)

Low-effort, high-impact improvements:

1. **Add 10 more strategies** (1 day)
2. **Improve error messages** (3-4 hours)
3. **Add FAQ page** (2-3 hours)
4. **Create tutorial video** (half day)
5. **Add testimonials to landing page** (1-2 hours)
6. **Improve mobile touch targets** (half day)
7. **Add keyboard shortcuts** (1 day)
8. **Dark mode toggle** (half day)
9. **Create shareable strategy cards** (3-4 hours)
10. **Session export (PDF)** (1 day)

---

## 📈 Measuring Success

### North Star Metrics
1. **Parent empowerment**: % of parents who create their own action plans
2. **Strategy effectiveness**: Average effectiveness rating
3. **Crisis prevention**: Reduction in crisis escalations (via follow-ups)
4. **Return rate**: % of users with 3+ sessions

### Supporting Metrics
- Session completion rate by type
- Profile completion rate
- Follow-up engagement rate
- Strategy acceptance & effectiveness
- Voice vs chat preference
- Cost per session
- Response latency
- System uptime

### Qualitative Measures
- User testimonials
- Session transcript analysis
- Parent stress reduction (self-reported)
- Parenting confidence increase
- Quality of parent-generated solutions

---

## 🤝 Collaboration & Contributions

### Internal Team
- Product: Feature prioritization and user research
- Engineering: Implementation and technical design
- Content: Strategy curation and coaching methodology
- Design: UX/UI and accessibility

### External Contributions
- Clinical advisors: Coaching methodology validation
- ADHD parents: User testing and feedback
- Researchers: Evidence-based strategy review
- Community moderators: Content quality assurance

---

## 📞 Decision Framework

Before implementing any feature, ask:

1. **User Impact**: Does this help parents discover solutions?
2. **Coaching Alignment**: Does this support GROW/OARS methodology?
3. **Safety**: Does this maintain or enhance crisis detection?
4. **Feasibility**: Can we build and maintain this?
5. **Measurement**: Can we track its effectiveness?
6. **Timing**: Is this the right time, or should we wait for more data?

---

## 🔄 Roadmap Review Cadence

- **Weekly**: Sprint planning and progress review
- **Monthly**: Roadmap adjustments based on user feedback
- **Quarterly**: Major milestone review and strategy alignment
- **Annually**: Product vision and competitive positioning

---

**Next Review Date:** November 2025
**Roadmap Owner:** Product Team
**Last Major Update:** October 2025 (Coaching Transformation)

---

## 📚 Related Documentation

- [Coaching Methodology](../COACHING-METHODOLOGY.md)
- [Voice Mode Integration Plan](../VOICE-MODE-INTEGRATION-PLAN.md)
- [Current Roadmap](./roadmap.md)
- [Architecture Overview](../architecture/system-overview.md)
- [API Documentation](../API-DOCUMENTATION.md)

