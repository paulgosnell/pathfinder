# Voice Integration with ElevenLabs - Setup Guide

This guide explains how to set up and use the voice capabilities integrated into the ADHD Support Agent.

## 🎙️ Features

- **Voice Input**: Record your message using your microphone
- **Voice Output**: Hear assistant responses in a calm, therapeutic voice
- **Hybrid Mode**: Seamlessly switch between text and voice
- **Auto-Play**: Toggle automatic voice playback for responses
- **Real-time Transcription**: Speech-to-text powered by ElevenLabs Scribe v1
- **Low-Latency TTS**: Fast response using ElevenLabs Turbo v2.5

## 📋 Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key**: Get your API key from the ElevenLabs dashboard
3. **Microphone Access**: Browser permission required for voice input

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
cd adhd-support-agent
npm install
```

**Note**: The voice integration uses direct API calls to ElevenLabs - no SDK required! This keeps your bundle size small and avoids dependency issues.

### Step 2: Configure Environment Variables

Create or update your `.env.local` file in the root directory:

```bash
# Existing variables
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# NEW: ElevenLabs API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**To get your ElevenLabs API key:**
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign in or create an account
3. Navigate to your Profile Settings
4. Copy your API key from the API section

### Step 3: Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see the chat interface with voice capabilities!

## 🎨 How to Use

### Voice Input
1. Click the **microphone button** (🎤) in the input area
2. Speak your message
3. Click the button again to stop recording
4. The transcribed text will appear and be sent automatically

### Voice Output
1. Toggle **"Auto-play voice responses"** checkbox
2. When enabled, assistant responses will be read aloud automatically
3. A "Playing..." indicator shows when audio is active

### Text Input
- Type messages as usual - voice features are optional
- Press Enter to send, or use the send button (➤)

## 🔊 Voice Configuration

The system uses:
- **Model**: Eleven Turbo v2.5 (low latency, ~250-300ms)
- **Voice**: "Rachel" (calm, empathetic tone suitable for therapeutic context)
- **Language**: English (32 languages available)

### Customizing the Voice

To change the voice, edit `/app/api/voice/text-to-speech/route.ts`:

```typescript
// Line ~22: Change the voice ID
const voiceId = 'Rachel'; // Try: 'Bella', 'Antoni', 'Arnold', etc.
```

Available voices can be found in your ElevenLabs dashboard.

### Adjusting Voice Settings

In the same file, modify `voice_settings`:

```typescript
voice_settings: {
  stability: 0.5,        // 0-1: Higher = more consistent
  similarity_boost: 0.75, // 0-1: Higher = closer to original voice
  style: 0.0,            // 0-1: Exaggeration of style
  use_speaker_boost: true,
}
```

## 📊 API Endpoints

### POST `/api/voice/speech-to-text`
Converts audio to text using ElevenLabs Scribe v1.

**Request**: FormData with audio file
**Response**: `{ text: string, success: boolean }`

### POST `/api/voice/text-to-speech`
Converts text to speech using ElevenLabs Turbo v2.5.

**Request**: `{ text: string }`
**Response**: Audio stream (MP3)

## 💰 Cost Considerations

**ElevenLabs Pricing** (as of 2025):
- Free tier available with limited characters
- Paid plans start at ~$5/month
- Check current pricing at [elevenlabs.io/pricing](https://elevenlabs.io/pricing)

**Usage Optimization**:
- Only generates audio when auto-play is enabled
- Audio is cached per message
- Users can choose text-only mode to reduce costs

## 🔒 Privacy & Security

- Audio is processed in real-time, not stored permanently
- Transcriptions follow your existing GDPR compliance policies
- Microphone access requires explicit browser permission
- API key is server-side only (never exposed to client)

## 🐛 Troubleshooting

### "Unable to access microphone"
- Check browser permissions for microphone access
- Ensure you're using HTTPS in production (required for mic access)
- Try a different browser if issues persist

### "Voice service not configured"
- Verify `ELEVENLABS_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Check the key is valid in your ElevenLabs dashboard

### Audio not playing
- Check browser audio permissions
- Ensure audio isn't muted
- Check browser console for errors
- Try disabling and re-enabling auto-play

### Poor transcription quality
- Speak clearly and at normal pace
- Reduce background noise
- Check microphone quality/settings
- Consider using headphones with built-in mic

## 🚀 Deployment to Production

### Vercel Deployment

1. Add the environment variable in Vercel dashboard:
   ```
   ELEVENLABS_API_KEY=your_key_here
   ```

2. Deploy as usual:
   ```bash
   git push origin main
   ```

3. Ensure your domain uses HTTPS (required for microphone access)

### Environment Variables Checklist
- ✅ `ELEVENLABS_API_KEY` set in production
- ✅ All existing environment variables configured
- ✅ HTTPS enabled on domain

## 📈 Future Enhancements

Potential improvements:
- **Voice Library**: Let users choose their preferred voice
- **Language Support**: Multi-language transcription and TTS
- **WebSocket Streaming**: Real-time conversation mode
- **Voice Cloning**: Custom therapeutic voices
- **Audio History**: Save and replay previous responses
- **Offline Mode**: Cached responses for common queries

## 🔗 Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference)
- [Voice Library](https://elevenlabs.io/voice-library)
- [Model Comparison](https://elevenlabs.io/docs/models)

## 💬 Support

For issues related to:
- **Voice Features**: Check this guide first
- **ElevenLabs API**: Visit [ElevenLabs Help Center](https://help.elevenlabs.io)
- **General App Issues**: See main README.md

---

**Note**: Voice capabilities are optional enhancements. The text chat works independently and all features remain available without voice enabled.

