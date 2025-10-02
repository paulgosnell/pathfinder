# ADHD Support Agent

An AI-powered therapeutic chatbot designed to provide evidence-based support for parents of children with ADHD.

## Features

- **Intelligent Crisis Detection**: Automatically identifies situations requiring immediate intervention
- **Evidence-Based Strategies**: Provides research-backed ADHD parenting strategies
- **Voice Integration**: Optional voice input/output powered by ElevenLabs (see [VOICE-INTEGRATION-GUIDE.md](VOICE-INTEGRATION-GUIDE.md))
- **Session Management**: Tracks therapeutic goals and progress across conversations
- **GDPR Compliant**: Built-in data privacy and deletion capabilities
- **Production Ready**: Monitoring, logging, and error handling included

## Quick Start

### 1. Environment Setup

Copy the environment variables:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For voice features
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**Note**: Voice features are optional. The app works fully without the ElevenLabs API key. See [VOICE-INTEGRATION-GUIDE.md](VOICE-INTEGRATION-GUIDE.md) for voice setup.

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Update your environment variables with the Supabase credentials

### 3. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting with the agent.

### 4. Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in your Vercel dashboard or via CLI:

```bash
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc
```

## Architecture

### Core Components

- **Core Agent** (`lib/agents/core-agent.ts`): Main ADHD support agent with therapeutic tools
- **Crisis Agent** (`lib/agents/crisis-agent.ts`): Specialized crisis detection and response
- **Strategy Agent** (`lib/agents/strategy-agent.ts`): Evidence-based strategy recommendations
- **Session Manager** (`lib/session/manager.ts`): In-memory session state management
- **Database Layer** (`lib/database/`): Persistent storage with Supabase
- **GDPR Compliance** (`lib/gdpr/`): Data privacy and deletion utilities

### Agent Tools

1. **assessSituation**: Analyzes parenting challenges and determines intervention approach
2. **retrieveStrategy**: Finds appropriate ADHD strategies for specific challenges
3. **detectCrisis**: Monitors for crisis situations requiring immediate help
4. **setTherapeuticGoal**: Establishes measurable goals for each conversation

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- Agent tool functionality
- Crisis detection scenarios
- Conversation flow validation
- Strategy retrieval accuracy

## Safety Features

- **Crisis Detection**: Automatic identification of suicidal ideation, violence risk, or severe burnout
- **Emergency Response**: Immediate provision of crisis resources and professional referrals
- **Data Privacy**: GDPR-compliant data handling with automatic deletion schedules
- **Content Filtering**: Age-appropriate strategy recommendations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support with setup or usage, please open an issue in the GitHub repository.

---

**⚠️ Important**: This tool provides informational support only and is not a replacement for professional medical or therapeutic care. In crisis situations, always contact emergency services or mental health professionals directly.