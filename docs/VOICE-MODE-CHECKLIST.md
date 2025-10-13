# Voice Mode - Ready to Test Checklist ✅

**Status**: Build Complete - Ready for API Setup
**Date**: October 6, 2025

---

## ✅ What's Done

### Backend (Python Voice Agent)
- [x] Voice agent implementation (`voice-agent/agent.py`)
- [x] GROW/OARS coaching prompt (`voice-agent/coaching_wrapper.py`)
- [x] Python dependencies configured (`requirements.txt`)
- [x] Environment template created (`.env.voice.example`)
- [x] README with setup instructions

### Frontend (React/Next.js)
- [x] Voice UI component (`components/VoiceAssistant.tsx`)
- [x] Voice route (`/voice`)
- [x] Token generation API (`/api/voice-token`)
- [x] Navigation links (chat ↔ voice)
- [x] Design system integrated
- [x] **Build verification**: ✅ Successful

### Configuration
- [x] Environment variables documented
- [x] npm packages installed
- [x] TypeScript types resolved

### Documentation
- [x] Integration plan (70+ pages)
- [x] Setup guide
- [x] Implementation summary
- [x] CLAUDE.md updated

---

## 🔑 What You Need (API Keys)

### 1. LiveKit Cloud (Required) - 5 minutes
**Sign up**: https://cloud.livekit.io

**Steps:**
1. Create account
2. Create new project
3. Go to Settings → Keys
4. Copy these 3 values:
   ```
   API Key: lk_...
   API Secret: API...
   WebSocket URL: wss://your-project.livekit.cloud
   ```

**Free Tier**: 50GB/month (277 sessions)

### 2. Deepgram (Recommended) - 5 minutes
**Sign up**: https://console.deepgram.com

**Steps:**
1. Create account
2. Go to API Keys
3. Create new key
4. Copy key: `YOUR_DEEPGRAM_KEY`

**Free**: $200 credit (11,111 sessions!)

### 3. Already Have ✅
- OpenAI API key (configured)
- Supabase credentials (configured)

---

## 📝 Setup Steps (15 minutes)

### Step 1: Add to `.env.local`

Open `/Users/paulgosnell/Sites/pathfinder/adhd-support-agent/.env.local`

Add these lines:
```bash
# LiveKit Configuration
LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY_HERE
LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET_HERE
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# Speech Services
DEEPGRAM_API_KEY=YOUR_DEEPGRAM_KEY_HERE
```

### Step 2: Create `voice-agent/.env.voice`

```bash
cd adhd-support-agent/voice-agent
cp .env.voice.example .env.voice
```

Edit `.env.voice`:
```bash
LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY_HERE
LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET_HERE
LIVEKIT_URL=wss://your-project.livekit.cloud

OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
DEEPGRAM_API_KEY=YOUR_DEEPGRAM_KEY_HERE
```

### Step 3: Install Python Dependencies

```bash
cd adhd-support-agent/voice-agent
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Wait 2-3 minutes for installation.

### Step 4: Test!

**Quick Test (LiveKit Playground):**
```bash
cd adhd-support-agent/voice-agent
source venv/bin/activate
python agent.py dev
```

Browser will open → Allow microphone → Say "Hi" → Agent responds!

**Full Test (Your App):**

Terminal 1:
```bash
cd adhd-support-agent/voice-agent
source venv/bin/activate
python agent.py start
```

Terminal 2:
```bash
cd adhd-support-agent
npm run dev
```

Browser:
- Go to http://localhost:3000
- Sign in
- Click `/voice` or use voice link in chat
- Start talking!

---

## ✅ Verification Checklist

After setup, verify:

### Technical Checks
- [ ] Voice agent starts without errors
- [ ] Next.js dev server runs
- [ ] Can navigate to `/voice` route
- [ ] LiveKit token generated successfully
- [ ] Microphone permission granted

### Functional Checks
- [ ] Voice session connects
- [ ] Can hear agent's voice
- [ ] Agent responds to questions
- [ ] Audio visualizer animates
- [ ] Can interrupt agent
- [ ] Session ends cleanly

### Coaching Checks
- [ ] Agent asks open questions (OARS)
- [ ] Reflects emotions
- [ ] Uses GROW model
- [ ] Doesn't rush to solutions
- [ ] Crisis keywords trigger safety response

---

## 🧪 Test Scenarios

Try these conversations:

### 1. Basic Coaching
**You**: "Hi, I need help with morning routines"
**Expect**: Agent asks open questions about your situation

### 2. Emotion Reflection
**You**: "I'm so frustrated every morning"
**Expect**: Agent reflects your frustration before problem-solving

### 3. Solution-Focused
**You**: "Nothing works with my son"
**Expect**: Agent asks about times when things DID work

### 4. Crisis Detection
**You**: "I can't cope anymore, I'm done"
**Expect**: Immediate safety response with 999, Samaritans numbers

### 5. Interruption
**While agent speaking**: Start talking
**Expect**: Agent stops, listens to you

---

## 🚨 Troubleshooting

### "Failed to get voice token"
```bash
# Check .env.local has LiveKit keys
grep LIVEKIT .env.local

# Restart Next.js
npm run dev
```

### "Voice agent won't connect"
```bash
# Check voice agent is running
# Should see: "Voice assistant started successfully"

# Verify .env.voice
cat voice-agent/.env.voice
```

### "Can't hear anything"
```bash
# Check browser permissions (microphone)
# Try different browser (Chrome works best)
# Check agent logs for errors
```

### "Poor audio quality"
```bash
# Make sure Deepgram is configured
# Check internet speed
# Try reducing background noise
```

---

## 📊 Monitoring

### During Testing

**Voice Agent Terminal - Good Signs:**
```
INFO:__main__:Starting ADHD coaching session
INFO:__main__:Parent connected: user-abc123
INFO:__main__:Voice assistant started successfully
```

**Voice Agent Terminal - Issues:**
```
ERROR: ... (Look for missing API keys, connection errors)
```

**Browser Console - Good:**
```
✅ Voice token generated successfully
```

**Browser Console - Issues:**
```
❌ Check for CORS, WebRTC, or API errors
```

---

## 💰 Cost Tracking

### Free Tier Testing (you're covered!)
- LiveKit: 277 free sessions
- Deepgram: 11,111 free sessions
- OpenAI: Depends on your plan (~1000 sessions)

### After Free Tier
- ~$0.17 per 30-minute session
- Set up billing alerts in each service

---

## 📁 Files Created (11 new)

```
✅ voice-agent/agent.py
✅ voice-agent/coaching_wrapper.py
✅ voice-agent/requirements.txt
✅ voice-agent/.env.voice.example
✅ voice-agent/README.md
✅ app/voice/page.tsx
✅ app/api/voice-token/route.ts
✅ components/VoiceAssistant.tsx
✅ docs/VOICE-MODE-INTEGRATION-PLAN.md
✅ docs/VOICE-MODE-SETUP.md
✅ VOICE-MODE-IMPLEMENTATION-SUMMARY.md
```

**Modified Files (4):**
```
✅ .env.example (added LiveKit vars)
✅ CLAUDE.md (added voice section)
✅ app/chat/page.tsx (added voice link)
✅ package.json (added dependencies)
```

---

## 🎯 Success Criteria

You'll know it's working when:
1. ✅ Agent connects in < 2 seconds
2. ✅ You hear agent's voice clearly
3. ✅ Agent asks coaching questions
4. ✅ Can have natural back-and-forth
5. ✅ Audio visualizer shows activity
6. ✅ No error messages in console

---

## 📚 Documentation Links

**Start Here:**
- [Setup Guide](docs/VOICE-MODE-SETUP.md) ← Quick start
- [Implementation Summary](VOICE-MODE-IMPLEMENTATION-SUMMARY.md) ← Overview

**Deep Dive:**
- [Integration Plan](docs/VOICE-MODE-INTEGRATION-PLAN.md) ← Full architecture
- [Coaching Methodology](docs/COACHING-METHODOLOGY.md) ← How it coaches
- [Voice Agent README](voice-agent/README.md) ← Python agent details

**External:**
- [LiveKit Docs](https://docs.livekit.io/agents/)
- [Deepgram Docs](https://developers.deepgram.com)
- [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech)

---

## 🎉 You're Ready!

**Estimated time from here to first voice conversation**: 20 minutes

**Steps:**
1. Get LiveKit keys (5 min)
2. Get Deepgram key (5 min)
3. Configure .env files (5 min)
4. Install Python deps (3 min)
5. Run tests (2 min)
6. 🎙️ **Talk to your ADHD coach!**

---

## 📞 Next Steps After Testing

1. **Collect Feedback**
   - Test with 5-10 ADHD parents
   - Create feedback form
   - Compare to text chat

2. **Iterate**
   - Adjust prompts based on feedback
   - Tune voice settings
   - Improve UI/UX

3. **Deploy**
   - Deploy Python agent to server
   - Update Vercel with LiveKit vars
   - Production testing

4. **Monitor**
   - Track usage and costs
   - Monitor quality metrics
   - User satisfaction scores

---

**Quick Start Command:**
```bash
cd adhd-support-agent/voice-agent && python agent.py dev
```

🚀 **Let's hear that coaching voice!**
