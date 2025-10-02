# 🚀 ADHD Support Agent - Quick Start Guide

## Start the Application

```bash
cd /Users/paulgosnell/Sites/pathfinder/adhd-support-agent
npm run dev
```

**Open**: http://localhost:3000

---

## Quick Test Scenarios

### 1. Normal Support (Morning Routines)
```
"My 8-year-old takes forever to get ready for school"
```
**Expected**: Strategy suggestions with visual routine charts

### 2. Homework Help
```
"How can I help my 10-year-old focus on homework?"
```
**Expected**: Pomodoro technique, break schedules, workspace setup

### 3. Bedtime Issues
```
"Bedtime is a nightmare - it takes 3 hours every night"
```
**Expected**: Wind-down routine, sleep hygiene strategies

### 4. Parent Burnout (Elevated Support)
```
"I'm so exhausted, I feel completely overwhelmed"
```
**Expected**: Validation, support resources, self-care strategies

---

## View Real-Time Analytics

**URL**: http://localhost:3000/api/analytics

**Shows**:
- Session counts
- Token usage
- Costs ($0.001-0.003 per conversation)
- Response times
- Crisis detections
- Success rates

---

## Check System Status

**URL**: http://localhost:3000/api/test

**Shows**:
- API status
- Endpoints available
- Version info

**Query Parameters**:
- `?type=strategies` - List all strategies
- `?type=agents` - Verify agents loaded
- `?type=env` - Check environment variables

---

## Monitor Console Logs

**Watch for**:
- 🚨 Crisis detection alerts
- 💰 Cost per request ($X.XXXXXX)
- 🤖 Agent tool usage
- ✅ Completion times
- ⚠️ Warnings or errors

---

## Run Tests

```bash
npm test
```

**Tests validate**:
- Crisis detection accuracy
- Therapeutic agent tools
- Strategy database integrity
- Performance tracking
- Token usage limits

---

## Key Files

| File | Purpose |
|------|---------|
| `/app/page.tsx` | Beautiful UI |
| `/app/api/chat/route.ts` | AI agent integration |
| `/lib/agents/proper-tools-agent.ts` | Main therapeutic agent |
| `/lib/agents/crisis-tools-agent.ts` | Crisis detection |
| `/lib/data/strategies.ts` | 16 ADHD strategies |
| `/lib/monitoring/performance-tracker.ts` | Metrics & costs |

---

## Typical Response Times

- Crisis check: < 1 second
- Simple query: 2-4 seconds  
- With strategies: 5-8 seconds

---

## Cost Estimates

- Per conversation: $0.001-0.003
- 100 conversations: ~$0.10-0.30
- 1000 conversations: ~$1-3
- Monthly (moderate): $5-20

---

## Environment Variables

Check `.env.local` has:
```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Troubleshooting

### No response from chat
- Check console for errors
- Verify OPENAI_API_KEY is set
- Ensure server is running (`npm run dev`)

### 404 errors
- Wait for Next.js to finish building
- Check terminal for compilation errors
- Try refreshing the page

### Slow responses
- Normal for first request (cold start)
- Subsequent requests should be faster
- Check internet connection for OpenAI API

### High costs
- Monitor `/api/analytics` endpoint
- Each conversation should be < $0.01
- Crisis detection uses fewer tokens

---

## Feature Highlights

✨ **Crisis Detection**
- Automatic safety monitoring
- UK emergency resources
- Immediate intervention protocols

✨ **Smart Strategies**
- 16 evidence-based interventions
- Age-appropriate filtering
- Detailed implementation steps

✨ **Beautiful UI**
- Calming color palette
- Smooth animations
- Strategy cards with visual appeal
- Accessibility features

✨ **Performance Monitoring**
- Real-time token tracking
- Cost calculation
- Response time metrics
- Error logging

---

## Need Help?

1. Check **IMPLEMENTATION-COMPLETE.md** for full details
2. Review `/docs/` directory for architecture
3. Read `/lib/agents/` for AI behavior
4. Check tests in `/__tests__/` for examples

---

**Everything is ready to go! Start testing at http://localhost:3000** 🎉
