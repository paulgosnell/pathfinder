# Voice Mode Integration Plan
## LiveKit Agents Integration for ADHD Support Agent

**Status**: Planning
**Created**: 2025-10-06
**Target**: Separate voice interface for testing alongside existing chat UI

---

## Executive Summary

This document outlines the plan to integrate [LiveKit Agents](https://github.com/livekit/agents) as a new voice-based interface for the ADHD Support Agent. The voice mode will be built as a **separate UI route** (`/voice`) to allow independent testing and evaluation, while maintaining consistency with the existing design system.

### Key Objectives
- ✅ Add real-time voice interaction capability
- ✅ Maintain existing GROW model coaching methodology
- ✅ Keep voice mode separate from chat UI for testing
- ✅ Follow established design system and UX patterns
- ✅ Enable crisis detection in voice conversations

---

## What is LiveKit Agents?

**LiveKit Agents** is a Python/Node.js framework for building real-time voice AI agents with advanced conversational capabilities.

### Core Features
- **Real-time WebRTC communication**: Low-latency voice streaming
- **Flexible AI pipeline**: STT (Speech-to-Text) → LLM → TTS (Text-to-Speech)
- **Multi-modal support**: Voice, video, and text in one platform
- **Semantic turn detection**: Natural conversation flow
- **Production-ready infrastructure**: Battle-tested at scale
- **Open source**: Apache 2.0 license

### Why LiveKit for This Project?
1. **Works with existing OpenAI integration** - Uses GPT-4o-mini (same as chat)
2. **React components available** - `@livekit/components-react` for Next.js
3. **Low latency** - WebRTC ensures smooth voice experience
4. **Proven framework** - Used by production voice AI applications
5. **Easy coaching prompt integration** - Can reuse existing system prompts

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     ADHD Support Agent                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │   Chat UI    │                    │  Voice UI    │       │
│  │  /chat       │                    │  /voice      │       │
│  │              │                    │              │       │
│  │ Text-based   │                    │ Audio-based  │       │
│  │ coaching     │                    │ coaching     │       │
│  └──────┬───────┘                    └──────┬───────┘       │
│         │                                   │               │
│         │                                   │               │
│         ▼                                   ▼               │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │ /api/chat    │                    │ /api/voice-  │       │
│  │              │                    │ token        │       │
│  │ Text agent   │                    │              │       │
│  └──────────────┘                    └──────┬───────┘       │
│                                             │               │
│                                             ▼               │
│                                      ┌──────────────┐       │
│                                      │ LiveKit      │       │
│                                      │ Room         │       │
│                                      └──────┬───────┘       │
│                                             │               │
│                                             ▼               │
│                                      ┌──────────────┐       │
│                                      │ Python Voice │       │
│                                      │ Agent        │       │
│                                      │              │       │
│                                      │ STT→LLM→TTS  │       │
│                                      └──────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Voice Agent Pipeline

```
User speaks → Deepgram STT → OpenAI GPT-4o-mini → ElevenLabs TTS → User hears
              (transcribe)    (coaching response)   (synthesize)
```

---

## Technical Implementation

### 1. Backend: Python Voice Agent

#### File Structure
```
adhd-support-agent/
├── voice-agent/                    # New directory
│   ├── agent.py                   # Main LiveKit agent entry point
│   ├── coaching_wrapper.py        # GROW/OARS coaching prompt
│   ├── session_manager.py         # Voice session state tracking
│   ├── requirements.txt           # Python dependencies
│   ├── .env.voice                 # Voice-specific environment vars
│   └── README.md                  # Voice agent documentation
```

#### Dependencies (requirements.txt)
```txt
livekit-agents[openai,deepgram,elevenlabs]~=1.2
livekit-plugins-noise-cancellation~=0.2
python-dotenv
```

#### Core Implementation (agent.py)
```python
import asyncio
from livekit.agents import JobContext, WorkerOptions, cli
from livekit.agents.llm import ChatContext, ChatMessage
from livekit.plugins import openai, deepgram, elevenlabs, silero

# Import our coaching system prompt
from coaching_wrapper import COACHING_SYSTEM_PROMPT

async def entrypoint(ctx: JobContext):
    """Voice agent entry point - connects to LiveKit room"""

    # Initialize the agent with GROW model coaching
    agent = openai.Agent(
        instructions=COACHING_SYSTEM_PROMPT,
        # Can add tools here for crisis detection, strategy retrieval, etc.
    )

    # Configure the voice pipeline
    session = await agent.start(
        ctx.room,
        vad=silero.VAD.load(),                    # Voice Activity Detection
        stt=deepgram.STT(model="nova-3"),         # Speech-to-Text
        llm=openai.LLM(model="gpt-4o-mini"),      # Language Model
        tts=elevenlabs.TTS(model="eleven_turbo"), # Text-to-Speech
    )

    # Session lifecycle management
    await session.wait_for_completion()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
```

#### Coaching Prompt Wrapper (coaching_wrapper.py)
```python
"""
Wraps the existing GROW/OARS coaching methodology for voice interactions.
This is adapted from lib/agents/proper-tools-agent.ts
"""

COACHING_SYSTEM_PROMPT = """
You are an ADHD parent coach conducting a voice session. Your role is to help parents
discover their own solutions through facilitative guidance, NOT to dispense advice.

CORE PHILOSOPHY - COACHING NOT CONSULTING:
- Coaches help parents discover their own solutions
- Parents are the experts on their child - you facilitate their thinking
- If they could do it, they would do it - struggles come from skill gaps,
  executive function challenges, or systemic barriers
- Curiosity over advice. Always.

VOICE-SPECIFIC GUIDELINES:
- Speak naturally and conversationally (this is voice, not text)
- Keep responses concise - voice conversations move faster than text
- Use active listening cues: "I hear you", "That sounds...", "Tell me more"
- Pause naturally to give them space to think and respond
- Reflect emotions you hear in their voice tone

YOUR COACHING FRAMEWORK - OARS (Motivational Interviewing):
[... rest of GROW/OARS framework from proper-tools-agent.ts ...]

REMEMBER:
This is a 50-minute voice coaching session. Listen deeply, speak naturally,
and help them find their own wisdom.
"""
```

---

### 2. Frontend: Voice Mode UI

#### File Structure
```
adhd-support-agent/
├── app/
│   ├── voice/
│   │   └── page.tsx              # Voice mode route
│   └── api/
│       └── voice-token/
│           └── route.ts          # LiveKit token generation API
├── components/
│   ├── VoiceAssistant.tsx        # Main voice UI component
│   └── AudioVisualizer.tsx       # Waveform visualization
```

#### Dependencies (package.json additions)
```json
{
  "dependencies": {
    "@livekit/components-react": "^2.5.0",
    "livekit-client": "^2.5.0"
  }
}
```

#### Voice UI Component (components/VoiceAssistant.tsx)
```tsx
'use client';

import { useState } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';

export function VoiceAssistant() {
  const [token, setToken] = useState<string>();
  const [connecting, setConnecting] = useState(false);

  const startSession = async () => {
    setConnecting(true);
    try {
      // Request LiveKit access token from our API
      const response = await fetch('/api/voice-token', {
        method: 'POST',
      });
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error('Failed to get voice token:', error);
    } finally {
      setConnecting(false);
    }
  };

  const endSession = () => {
    setToken(undefined);
  };

  // Design system colors
  const colors = {
    background: '#F9F7F3',
    primary: '#2A3F5A',
    secondary: '#586C8E',
    accent1: '#D7CDEC',
    accent2: '#B7D3D8',
    accent3: '#E3EADD',
  };

  if (!token) {
    // Initial state - show "Start Session" button
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden border flex flex-col p-8"
          style={{
            boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
            borderColor: 'rgba(215, 205, 236, 0.2)'
          }}
        >
          <h1
            className="font-display font-semibold text-2xl mb-4"
            style={{ color: colors.primary }}
          >
            Voice Coaching Session
          </h1>

          <p
            className="mb-6"
            style={{ color: colors.secondary, lineHeight: 1.6 }}
          >
            Start a voice conversation with your ADHD parent coach.
            Speak naturally - I'm here to listen and help you discover solutions.
          </p>

          <button
            onClick={startSession}
            disabled={connecting}
            className="w-full py-4 px-6 rounded-full font-semibold transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
              color: colors.primary,
              boxShadow: '0 5px 15px rgba(42, 63, 90, 0.08)',
            }}
          >
            {connecting ? 'Connecting...' : 'Start Voice Session'}
          </button>
        </div>
      </div>
    );
  }

  // Active session - show LiveKit room
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden border flex flex-col"
        style={{
          boxShadow: '0 5px 20px rgba(42, 63, 90, 0.1)',
          borderColor: 'rgba(215, 205, 236, 0.2)',
          height: '700px'
        }}
      >
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          connect={true}
          audio={true}
          video={false}
        >
          <VoiceAssistantUI onEndSession={endSession} />
        </LiveKitRoom>
      </div>
    </div>
  );
}

function VoiceAssistantUI({ onEndSession }: { onEndSession: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  const colors = {
    primary: '#2A3F5A',
    secondary: '#586C8E',
    accent1: '#D7CDEC',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-6"
        style={{
          background: 'linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7))',
        }}
      >
        <h2
          className="font-display font-semibold text-xl"
          style={{ color: colors.primary }}
        >
          Voice Session Active
        </h2>
        <p className="text-sm mt-1" style={{ color: colors.secondary }}>
          {state === 'listening' && 'I'm listening...'}
          {state === 'thinking' && 'Thinking...'}
          {state === 'speaking' && 'Speaking...'}
          {state === 'idle' && 'Ready to chat'}
        </p>
      </div>

      {/* Audio Visualizer */}
      <div className="flex-grow flex items-center justify-center p-8">
        {audioTrack && (
          <BarVisualizer
            state={state}
            barCount={30}
            trackRef={audioTrack}
            className="w-full h-32"
            options={{
              barColor: colors.accent1,
              barGap: 4,
              barWidth: 8,
            }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="p-6">
        <VoiceAssistantControlBar />

        <button
          onClick={onEndSession}
          className="w-full mt-4 py-3 px-6 rounded-full font-semibold transition-transform hover:scale-105"
          style={{
            backgroundColor: 'rgba(215, 205, 236, 0.3)',
            color: colors.primary,
            border: '1px solid rgba(215, 205, 236, 0.3)',
          }}
        >
          End Session
        </button>
      </div>
    </div>
  );
}
```

#### Token Generation API (app/api/voice-token/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { createServerClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate LiveKit access token
    const roomName = `voice-session-${user.id}-${Date.now()}`;
    const participantName = user.email || `user-${user.id}`;

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: user.id,
        name: participantName,
      }
    );

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Voice token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice token' },
      { status: 500 }
    );
  }
}
```

#### Voice Route (app/voice/page.tsx)
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import { VoiceAssistant } from '@/components/VoiceAssistant';

export default function VoicePage() {
  return (
    <ProtectedRoute>
      <VoiceAssistant />
    </ProtectedRoute>
  );
}
```

---

### 3. Environment Configuration

#### .env.local additions
```bash
# =============================================================================
# LiveKit Voice Mode Configuration
# =============================================================================
# Get these from: https://cloud.livekit.io/projects
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# =============================================================================
# Voice Services
# =============================================================================
# Deepgram for Speech-to-Text
# Get free $200 credit: https://console.deepgram.com/
DEEPGRAM_API_KEY=your_deepgram_key_here

# ElevenLabs for Text-to-Speech (already in .env.example)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

#### voice-agent/.env.voice
```bash
# Python agent environment variables
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud

OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

---

## Design System Integration

### Color Palette (matching existing chat UI)
```css
--background: #F9F7F3;      /* Warm off-white */
--primary: #2A3F5A;         /* Deep navy */
--secondary: #586C8E;       /* Muted blue */
--accent-1: #D7CDEC;        /* Soft lavender */
--accent-2: #B7D3D8;        /* Calm aqua */
--accent-3: #E3EADD;        /* Sage green */
--accent-4: #E6A897;        /* Warm coral */
--accent-5: #F0D9DA;        /* Blush pink */
```

### Typography
- **Font Family**: Quicksand (display), Atkinson Hyperlegible (body)
- **Mobile-first**: Max-width 400px container
- **Rounded corners**: 18px for bubbles, 24px for cards

### UI States
1. **Idle**: Gentle pulsing circle in accent-1 color
2. **Listening**: Active waveform visualization in accent-2
3. **Thinking**: Animated dots in accent-1
4. **Speaking**: Active waveform in accent-3

---

## Implementation Phases

### Phase 1: Backend Agent Setup (4-6 hours)
**Goal**: Get Python voice agent running locally

- [ ] Create `voice-agent/` directory structure
- [ ] Install Python dependencies
- [ ] Write `agent.py` with LiveKit integration
- [ ] Port GROW/OARS coaching prompt to `coaching_wrapper.py`
- [ ] Configure STT (Deepgram) + LLM (OpenAI) + TTS (ElevenLabs)
- [ ] Test agent locally with LiveKit Playground
- [ ] Add session state tracking (GROW phases)
- [ ] Implement crisis detection for voice

**Success Criteria**:
- Voice agent connects to LiveKit room
- Can have basic voice conversation
- Coaching methodology is maintained

---

### Phase 2: Frontend Voice UI (3-4 hours)
**Goal**: Build voice interface matching design system

- [ ] Install `@livekit/components-react` and dependencies
- [ ] Create `/voice` route with authentication
- [ ] Build `VoiceAssistant.tsx` component
- [ ] Design audio visualizer with brand colors
- [ ] Implement connection states (idle, listening, thinking, speaking)
- [ ] Add error handling and loading states
- [ ] Style controls to match existing UI patterns

**Success Criteria**:
- UI matches existing design system
- Can start/end voice sessions
- Visual feedback for all states
- Mobile-responsive

---

### Phase 3: API Integration (2-3 hours)
**Goal**: Connect frontend to backend

- [ ] Create `/api/voice-token` endpoint
- [ ] Implement LiveKit token generation
- [ ] Add user authentication checks
- [ ] Link voice mode from navigation
- [ ] Add analytics tracking for voice sessions
- [ ] Implement session logging to Supabase

**Success Criteria**:
- Authenticated users can get voice tokens
- Sessions are tracked in database
- Voice mode accessible from app

---

### Phase 4: Testing & Refinement (2-3 hours)
**Goal**: Validate and improve experience

- [ ] Test voice quality and latency
- [ ] Validate coaching methodology in voice format
- [ ] Test crisis detection triggers
- [ ] Check GDPR compliance for voice data
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Documentation updates

**Success Criteria**:
- Voice latency < 500ms
- Coaching feels natural and effective
- Crisis detection works reliably
- No data privacy issues

---

## Required Accounts & API Keys

### Existing (Already Have)
- ✅ OpenAI API key
- ✅ Supabase project
- ✅ ElevenLabs API key (in .env.example)

### New (Need to Create)
- 🆕 **LiveKit Cloud** account
  - URL: https://cloud.livekit.io
  - Free tier: 50GB egress/month
  - Get: API key, API secret, WebSocket URL

- 🆕 **Deepgram** account
  - URL: https://console.deepgram.com
  - Free: $200 credit
  - Get: API key

---

## Architecture Decisions

### Why Separate Voice UI?
**Decision**: Build `/voice` as standalone route, not integrated into `/chat`

**Rationale**:
1. **Testing isolation**: Can evaluate voice mode independently
2. **Simpler implementation**: No need to handle mode switching
3. **Different UX patterns**: Voice and text require different interactions
4. **Performance**: Separate bundles for each mode
5. **Future flexibility**: Easy to merge or keep separate based on testing results

### Voice Pipeline Choices

**STT (Speech-to-Text)**: Deepgram Nova-3
- **Why**: Fastest transcription (< 300ms latency)
- **Alternatives**: OpenAI Whisper (slower), AssemblyAI

**LLM (Language Model)**: OpenAI GPT-4o-mini
- **Why**: Already using in chat, cost-effective, fast
- **Keep consistent**: Same coaching prompts as chat

**TTS (Text-to-Speech)**: ElevenLabs Turbo
- **Why**: Most natural-sounding, low latency
- **Already configured**: API key in .env.example
- **Alternatives**: OpenAI TTS (cheaper but less natural)

### Session Management

**Option A (Recommended for Phase 1)**: Separate voice sessions
- Voice sessions stored independently from chat sessions
- Simpler implementation
- Allows comparison between modalities

**Option B (Future enhancement)**: Unified session tracking
- Voice and chat share conversation history
- User can switch between modalities mid-session
- More complex but richer experience

**Decision**: Start with Option A, evaluate Option B based on user feedback

---

## Data & Privacy Considerations

### Voice Data Handling
- **Recording**: Not stored by default (LiveKit ephemeral)
- **Transcripts**: Saved to `agent_conversations` table (same as chat)
- **Retention**: Same 2-year GDPR policy
- **User consent**: Update privacy policy to mention voice data

### GDPR Compliance Checklist
- [ ] Update privacy policy for voice data
- [ ] Add voice consent checkbox
- [ ] Ensure transcripts are deletable (use existing GDPR utils)
- [ ] Voice sessions included in data export
- [ ] Automatic deletion after 2 years

---

## Monitoring & Analytics

### Metrics to Track
- Voice session duration
- Audio quality (packet loss, latency)
- User satisfaction (post-session rating)
- Conversation depth (GROW phase progression)
- Crisis detections in voice mode
- Cost per voice session (STT + LLM + TTS)

### Implementation
```typescript
// Add to lib/monitoring/performance-tracker.ts
export async function trackVoiceSession({
  sessionId: string,
  userId: string,
  durationSeconds: number,
  audioQuality: 'excellent' | 'good' | 'poor',
  transcriptionAccuracy?: number,
  costUSD: number,
  crisisDetected: boolean,
  userRating?: number,
}) {
  // Track voice-specific metrics
}
```

---

## Cost Estimation

### Per 50-minute Voice Session
| Service | Usage | Cost |
|---------|-------|------|
| Deepgram STT | ~3000 words | $0.03 |
| OpenAI GPT-4o-mini | ~5000 tokens | $0.002 |
| ElevenLabs TTS | ~3000 chars | $0.90 |
| LiveKit | 50 min audio | ~$0.10 |
| **Total** | | **~$1.03** |

**Note**: Chat sessions cost ~$0.01 per session (100x cheaper)

### Optimization Options
1. Use OpenAI TTS instead of ElevenLabs (~$0.15 vs $0.90)
2. Limit voice session length
3. Hybrid: Start with voice, continue with chat
4. Reserved capacity discounts for high volume

---

## Testing Strategy

### Manual Testing
1. **Voice quality**: Clarity, naturalness, latency
2. **Coaching effectiveness**: Does GROW model work in voice?
3. **Crisis detection**: Test emergency scenarios
4. **Edge cases**: Poor connection, background noise
5. **Mobile**: Test on actual phones, not just desktop

### Automated Testing
```python
# voice-agent/tests/test_agent.py
import pytest
from agent import entrypoint

async def test_coaching_prompt_loaded():
    """Verify GROW/OARS prompt is loaded"""
    # Test implementation

async def test_crisis_detection():
    """Verify crisis keywords trigger response"""
    # Test implementation
```

### User Acceptance Testing
- Recruit 5-10 ADHD parents
- 20-30 minute sessions
- Feedback form:
  - Voice quality (1-5)
  - Coaching effectiveness (1-5)
  - Preference: voice vs chat
  - Willingness to pay

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| High voice latency | Poor UX | Medium | Use Deepgram (fastest STT), optimize TTS |
| Cost overrun | Budget | Medium | Monitor usage, set session limits, optimize TTS choice |
| Privacy concerns | Legal | Low | GDPR compliance, clear consent, no persistent recordings |
| Coaching doesn't translate to voice | Product | Low | Extensive testing, iterate on prompts |
| Technical complexity | Timeline | Medium | Use LiveKit starter template, allocate buffer time |

---

## Success Metrics

### Phase 1 (Technical Validation)
- [ ] Voice latency < 500ms end-to-end
- [ ] Audio quality rated "good" or better
- [ ] Zero critical bugs in 10 test sessions
- [ ] Successful deployment to production

### Phase 2 (User Validation)
- [ ] 80%+ user satisfaction rating
- [ ] 50%+ prefer voice over chat (or vice versa)
- [ ] Average session length > 15 minutes
- [ ] Crisis detection works 100% of tested cases

### Phase 3 (Business Validation)
- [ ] Cost per session within acceptable range
- [ ] Users willing to pay premium for voice
- [ ] Retention rate comparable to chat mode

---

## Future Enhancements

### Post-MVP Ideas
1. **Hybrid mode**: Start with voice, switch to chat for strategy cards
2. **Multilingual support**: Spanish, French voice coaching
3. **Voice journaling**: Save personal reflections
4. **Parent-child mode**: Coach both parent and child
5. **Group sessions**: Multiple parents in one room
6. **Custom voices**: Let users choose TTS voice/accent
7. **Offline mode**: Download coaching prompts for later

---

## Resources & References

### Documentation
- [LiveKit Agents GitHub](https://github.com/livekit/agents)
- [LiveKit Agents Docs](https://docs.livekit.io/agents/)
- [Voice Assistant Quickstart](https://docs.livekit.io/agents/quickstarts/voice-agent/)
- [React Components Reference](https://docs.livekit.io/reference/components/react/)
- [Agent Starter React Template](https://github.com/livekit-examples/agent-starter-react)

### Example Code
- [LiveKit Meet (Open Source)](https://github.com/livekit-examples/meet)
- [Voice AI Recipes](https://docs.livekit.io/recipes/)

### API Documentation
- [Deepgram API](https://developers.deepgram.com/docs)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [OpenAI API](https://platform.openai.com/docs)

---

## Next Steps

### Immediate Actions
1. **Set up accounts**:
   - [ ] Create LiveKit Cloud account
   - [ ] Create Deepgram account
   - [ ] Get API keys and add to .env.local

2. **Development environment**:
   - [ ] Install Python 3.9+ (check: `python --version`)
   - [ ] Install Node.js dependencies
   - [ ] Set up Python virtual environment

3. **Kick-off implementation**:
   - Start with Phase 1: Backend Agent Setup
   - Follow implementation checklist
   - Test early and often

### Decision Points
**Before starting Phase 2**, decide:
- [ ] TTS provider: ElevenLabs (natural) vs OpenAI TTS (cheap)?
- [ ] Session management: Separate vs unified with chat?
- [ ] Analytics: What additional metrics to track?

---

## Questions & Clarifications

### For Product Owner
1. **Budget**: What's acceptable cost per voice session?
2. **Priority**: Is voice mode critical path or experiment?
3. **Timeline**: When do we need this ready for testing?

### Technical Decisions Needed
1. Should voice sessions share history with chat sessions?
2. Do we need video support (for screen sharing strategies)?
3. What's the max session length we want to support?

---

## Appendix

### A. Comparison: LiveKit vs Alternatives

| Feature | LiveKit | Twilio | Vocode | Vapi.ai |
|---------|---------|--------|--------|---------|
| **Open Source** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Self-hosted** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **React Components** | ✅ Yes | ⚠️ Basic | ❌ No | ❌ No |
| **Python SDK** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ REST only |
| **WebRTC** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Cost (50min)** | ~$1.00 | ~$2.50 | ~$1.00 | ~$3.00 |
| **Latency** | Low | Low | Medium | Low |
| **Learning Curve** | Medium | Low | High | Low |

**Recommendation**: LiveKit (best balance of features, cost, and flexibility)

### B. File Checklist

**New Files to Create**:
```
✅ docs/VOICE-MODE-INTEGRATION-PLAN.md (this document)
⬜ voice-agent/agent.py
⬜ voice-agent/coaching_wrapper.py
⬜ voice-agent/requirements.txt
⬜ voice-agent/README.md
⬜ app/voice/page.tsx
⬜ app/api/voice-token/route.ts
⬜ components/VoiceAssistant.tsx
⬜ components/AudioVisualizer.tsx (optional)
```

**Files to Modify**:
```
⬜ .env.example (add LiveKit/Deepgram vars)
⬜ package.json (add LiveKit dependencies)
⬜ app/page.tsx (add link to voice mode)
⬜ CLAUDE.md (document voice mode)
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-06
**Author**: Claude Code
**Status**: Ready for Review
