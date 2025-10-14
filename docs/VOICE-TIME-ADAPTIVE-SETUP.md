# Voice Mode Time-Adaptive Coaching Setup

**Status**: Code Complete - Requires ElevenLabs Dashboard Configuration
**Created**: October 13, 2025
**Last Updated**: October 13, 2025

## Overview

Voice mode now passes the user's selected time budget (5/15/30/50 minutes) to the ElevenLabs agent as a dynamic variable. The agent needs to be configured to use this variable in its system prompt.

## What Changed

### Code Changes (✅ Complete)

**File**: [`components/ElevenLabsVoiceAssistant.tsx:100-102`](../components/ElevenLabsVoiceAssistant.tsx#L100-L102)

```typescript
await conversation.startSession({
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
  connectionType: 'webrtc',
  dynamicVariables: {
    time_budget_minutes: timeBudgetMinutes || 50,
  },
});
```

Now when a user selects their time budget (e.g., 15 minutes), it's sent to ElevenLabs as `time_budget_minutes: 15`.

## ElevenLabs Dashboard Configuration Required

You need to update your agent's system prompt in the ElevenLabs dashboard to use the dynamic variable.

### Step 1: Access ElevenLabs Dashboard

1. Go to [https://elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
2. Find your ADHD Support Agent (Agent ID from env var: `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`)
3. Click "Edit Agent"

### Step 2: Update System Prompt

Add time-adaptive instructions to your agent's system prompt using the `{{time_budget_minutes}}` variable:

#### Add to System Prompt (Top Section):

```
# TIME-ADAPTIVE COACHING

You have {{time_budget_minutes}} minutes for this session. Adapt your coaching depth accordingly:

**5-minute sessions (Quick Check-In):**
- Ask 1-2 key questions maximum
- Focus on immediate, actionable next steps
- Skip deep exploration - parent needs fast guidance
- Example: "What's the main challenge right now?" → Quick reflection → "Here's one thing to try today"

**15-minute sessions (Brief Session):**
- 5-7 back-and-forth exchanges maximum
- Brief Reality exploration (2-3 questions)
- Focus on one specific situation
- Move to Options if parent seems ready after 5 exchanges
- Keep responses concise and focused

**30-minute sessions (Standard Session):**
- 8-12 back-and-forth exchanges
- Moderate Reality exploration (4-5 questions)
- Explore 1-2 situations in depth
- Full GROW model progression
- Balance depth with time constraints

**50-minute sessions (Deep Dive):**
- 10-15+ back-and-forth exchanges
- Deep Reality exploration (5+ questions)
- Multiple situations explored
- Full GROW model with thorough exploration
- Original coaching depth and pacing

**CRITICAL PACING RULES:**
- Never exceed the time budget - adapt your depth to fit
- Shorter sessions = fewer questions, faster progression
- Prioritize parent's most urgent need in short sessions
- For 5-15 min sessions: Move quickly to actionable solutions
- For 30+ min sessions: Allow deeper exploration
```

#### Update Existing GROW Model Section:

Find your existing GROW model instructions and modify the Reality phase guidance:

```
## GROW MODEL PHASES

### 2. REALITY (Current Situation) - TIME-ADAPTIVE DEPTH

**Depth Requirements Based on Session Length:**
- 5 mins: 1-2 Reality questions only
- 15 mins: 5-7 Reality exchanges before Options
- 30 mins: 8-12 Reality exchanges before Options
- 50 mins: 10-15+ Reality exchanges (full exploration)

[Keep rest of your existing GROW model instructions...]
```

### Step 3: Test the Configuration

After updating the prompt:

1. Save the agent configuration
2. Test with different time budgets:
   - Start a 5-minute session → Should give quick advice after 1-2 questions
   - Start a 15-minute session → Should be brief but still coaching-focused
   - Start a 50-minute session → Should use full depth (original behavior)

## Dynamic Variable Reference

The variable is passed as:
- **Name**: `time_budget_minutes`
- **Type**: `number`
- **Values**: `5`, `15`, `30`, or `50`
- **Usage in prompt**: `{{time_budget_minutes}}`

## Example Prompt Snippets

### Opening Message (Time-Aware)

```
{{#if time_budget_minutes <= 5}}
I have 5 minutes with you. What's the most urgent challenge right now?
{{else if time_budget_minutes <= 15}}
I have 15 minutes to support you. What's been most challenging recently?
{{else}}
I'm here to support you through whatever you're facing with your child's ADHD. What's on your mind today?
{{/if}}
```

**Note**: Check ElevenLabs documentation to confirm if they support Handlebars-style conditionals. If not, you'll need to rely on natural language instructions like shown in the main prompt section above.

## Verification Checklist

- [ ] Code updated in `ElevenLabsVoiceAssistant.tsx` (✅ Complete)
- [ ] Agent system prompt updated in ElevenLabs dashboard
- [ ] Test 5-minute session: Quick advice after 1-2 questions
- [ ] Test 15-minute session: Brief coaching with 5-7 exchanges
- [ ] Test 30-minute session: Standard depth with 8-12 exchanges
- [ ] Test 50-minute session: Full exploration (original behavior)
- [ ] Time budget displays correctly in voice UI
- [ ] Sessions end naturally within time constraints

## Technical Implementation

### How Dynamic Variables Work

From ElevenLabs documentation:
1. Variables are passed in `startSession()` call
2. ElevenLabs injects them into the system prompt at runtime
3. Syntax: `{{variable_name}}` in agent prompt
4. Supported types: `string`, `number`, `boolean`

### Our Implementation

```typescript
dynamicVariables: {
  time_budget_minutes: timeBudgetMinutes || 50,
}
```

This passes the number directly (e.g., `15`) so you can use it in conditionals or text:
- "You have {{time_budget_minutes}} minutes for this session"
- The agent sees: "You have 15 minutes for this session"

## Deployment

### Code Deployment (✅ Complete)
The code changes are committed and will deploy automatically via Netlify.

### ElevenLabs Configuration (⏳ Manual Step Required)
You need to manually update the agent prompt in the ElevenLabs dashboard. This cannot be automated.

## Future Enhancements

1. **Visual Time Indicator**: Show remaining time to user during session
2. **Mid-Session Extension**: Allow agent to request more time if needed
3. **Time Tracking**: Log actual elapsed time vs estimated
4. **Analytics**: Track completion rates by time budget

## Related Documentation

- [TIME-ADAPTIVE-COACHING.md](./TIME-ADAPTIVE-COACHING.md) - Chat mode implementation
- [CLAUDE.md](../CLAUDE.md#voice-mode) - Voice mode overview
- [ElevenLabs Dynamic Variables Docs](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)

## Questions?

If the dynamic variable isn't working:
1. Verify agent ID matches: `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
2. Check ElevenLabs agent logs for the variable value
3. Ensure prompt syntax is exactly: `{{time_budget_minutes}}` (case-sensitive)
4. Test by hardcoding a value in the prompt to verify prompt updates are working
