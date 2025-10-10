# Voice Mode Setup Guide

Quick start guide for setting up and testing the voice coaching mode.

## Prerequisites

- ✅ Existing ADHD Support Agent installation
- ✅ Node.js and npm installed
- ✅ Python 3.9+ installed
- ✅ OpenAI API key (already configured)

## Step 1: Get API Keys

### LiveKit (Required)

1. Go to https://cloud.livekit.io
2. Create account / sign in
3. Create a new project
4. Navigate to **Settings** → **Keys**
5. Copy:
   - API Key
   - API Secret
   - WebSocket URL (format: `wss://your-project.livekit.cloud`)

**Free Tier**: 50GB egress/month (plenty for testing)

### Deepgram (Optional but Recommended)

1. Go to https://console.deepgram.com
2. Create account / sign in
3. Navigate to **API Keys**
4. Create new key and copy it

**Free Credit**: $200 (~6,500 minutes of transcription)

**Note**: If you skip Deepgram, the agent will use OpenAI Whisper (slower but free with your OpenAI key)

## Step 2: Configure Environment Variables

### Frontend (.env.local)

Add these to `/Users/paulgosnell/Sites/pathfinder/adhd-support-agent/.env.local`:

```bash
# LiveKit Configuration
LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY_HERE
LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET_HERE
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# Speech Services (optional)
DEEPGRAM_API_KEY=YOUR_DEEPGRAM_KEY_HERE
```

### Voice Agent (voice-agent/.env.voice)

```bash
cd adhd-support-agent/voice-agent
cp .env.voice.example .env.voice
```

Edit `.env.voice`:
```bash
# LiveKit
LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY_HERE
LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET_HERE
LIVEKIT_URL=wss://your-project.livekit.cloud

# AI Services
OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
DEEPGRAM_API_KEY=YOUR_DEEPGRAM_KEY_HERE  # Optional
```

## Step 3: Install Python Dependencies

```bash
cd adhd-support-agent/voice-agent
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

This installs:
- `livekit-agents` - Voice agent framework
- `livekit-plugins-*` - STT/TTS integrations
- Supporting packages

**Note**: First install may take 2-3 minutes.

## Step 4: Test the Voice Agent

### Option A: LiveKit Playground (Easiest)

```bash
cd adhd-support-agent/voice-agent
source venv/bin/activate
python agent.py dev
```

This will:
1. Start the voice agent locally
2. Generate a test URL
3. Open your browser to LiveKit Playground
4. Connect you to a test room

**Try it:**
- Allow microphone access
- Say: "Hi, I'm struggling with mornings"
- The agent should respond with coaching questions

### Option B: Your App (Full Integration)

**Terminal 1 - Run Voice Agent:**
```bash
cd adhd-support-agent/voice-agent
source venv/bin/activate
python agent.py start
```

**Terminal 2 - Run Next.js:**
```bash
cd adhd-support-agent
npm run dev
```

**Browser:**
1. Go to http://localhost:3000
2. Sign in / register
3. Navigate to http://localhost:3000/voice
4. Click "Start Voice Session"
5. Allow microphone
6. Start talking!

## Step 5: Verify It's Working

### Success Indicators

**Voice Agent Terminal:**
```
INFO:__main__:Starting ADHD coaching session in room: voice-session-user-123-...
INFO:__main__:Parent connected: user-abc123
INFO:__main__:Voice assistant started successfully
```

**Browser UI:**
- Status shows "I'm listening..." when you speak
- Audio visualizer animates
- You hear the agent's voice response

### Troubleshooting

#### "Failed to get voice token"
- ✅ Check LiveKit API keys in `.env.local`
- ✅ Verify `NEXT_PUBLIC_LIVEKIT_URL` starts with `wss://`
- ✅ Restart Next.js dev server: `npm run dev`

#### "Voice agent not connecting"
- ✅ Check voice agent is running: `python agent.py start`
- ✅ Verify credentials in `voice-agent/.env.voice`
- ✅ Check firewall allows WebRTC connections

#### "No audio / can't hear agent"
- ✅ Check browser microphone permissions
- ✅ Try different browser (Chrome/Edge work best)
- ✅ Verify TTS is working in agent logs

#### "Poor audio quality / latency"
- ✅ Use Deepgram instead of Whisper (add `DEEPGRAM_API_KEY`)
- ✅ Check internet connection speed
- ✅ Close bandwidth-heavy apps

## Testing Checklist

Once running, test these scenarios:

- [ ] **Basic conversation**: "Hi, I need help with bedtime routines"
- [ ] **GROW methodology**: Agent asks open questions, reflects emotions
- [ ] **Interruption**: Try interrupting the agent while speaking
- [ ] **Crisis detection**: "I can't cope anymore" → should trigger safety response
- [ ] **Session end**: Click "End Session" → returns to start screen
- [ ] **Navigation**: Switch between `/chat` and `/voice` routes

## Cost Monitoring

Monitor costs during testing:

### Per Session (~30 minutes):
- LiveKit: ~$0.06
- OpenAI LLM: ~$0.001
- OpenAI TTS: ~$0.10
- Deepgram STT: ~$0.02
- **Total: ~$0.18/session**

### Free Tier Limits:
- LiveKit: 50GB/month ≈ 277 sessions
- Deepgram: $200 credit ≈ 11,111 sessions
- OpenAI: Depends on your plan

**Recommendation**: Set usage alerts in each service.

## Development Workflow

### Making Changes to Coaching Prompt

Edit `voice-agent/coaching_wrapper.py`:
```python
COACHING_SYSTEM_PROMPT = """
Your updated coaching prompt here...
"""
```

Then restart: `python agent.py start`

### Changing Voice Settings

Edit `voice-agent/agent.py`:
```python
# Change TTS voice
tts=openai.TTS(voice="nova")  # Options: alloy, echo, fable, onyx, nova, shimmer

# Change STT model
stt=deepgram.STT(model="nova-2-general")  # Or: nova-3, whisper-large
```

### Switching to ElevenLabs TTS

For more natural voice (but higher cost):

1. Get API key: https://elevenlabs.io
2. Add to `.env.voice`: `ELEVENLABS_API_KEY=...`
3. Edit `agent.py`:
```python
from livekit.plugins import elevenlabs

tts=elevenlabs.TTS(model="eleven_turbo")
```

Cost increases to ~$0.90 per 30-min session.

## Next Steps

### After Basic Testing:

1. **User Testing**: Get 5-10 ADHD parents to try it
2. **Feedback Collection**: Create feedback form
3. **Compare to Chat**: Which do users prefer?
4. **Iterate on Prompts**: Refine based on feedback
5. **Production Deploy**: See deployment section below

### Production Deployment

**Voice Agent (Backend):**
- Deploy Python agent to server (AWS EC2, Railway, Render)
- Use systemd/supervisor for auto-restart
- Set up monitoring and logging
- Consider using LiveKit Cloud Agents (managed)

**Next.js (Frontend):**
- Deploy to Vercel (already configured)
- Set environment variables in Vercel dashboard
- Point to production voice agent

## Support

### Documentation
- Integration plan: `docs/VOICE-MODE-INTEGRATION-PLAN.md`
- Coaching methodology: `docs/COACHING-METHODOLOGY.md`
- Voice agent README: `voice-agent/README.md`

### External Resources
- LiveKit Docs: https://docs.livekit.io/agents/
- Deepgram Docs: https://developers.deepgram.com
- OpenAI TTS Docs: https://platform.openai.com/docs/guides/text-to-speech

### Common Issues
- LiveKit SDK errors: Check Python version (need 3.9+)
- WebRTC not connecting: Verify firewall/network settings
- Agent crashes: Check API key validity and rate limits

---

**Quick Test Command:**
```bash
# One-line test (from adhd-support-agent directory)
cd voice-agent && source venv/bin/activate && python agent.py dev
```

Happy coaching! 🎙️
