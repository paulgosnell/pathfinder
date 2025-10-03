# ADHD Parent Coaching Agent - Technical Specification
**Version**: 2.0 (Coaching Transformation)
**Date**: October 3, 2025
**Technology Stack**: Next.js 15, AI SDK v5, Supabase, OpenAI GPT-4o-mini
**Coaching Framework**: GROW Model + OARS (Motivational Interviewing)

---

## 🏗️ **System Architecture**

### **High-Level Overview**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend UI   │◄──►│   API Gateway    │◄──►│  Coaching AI Core   │
│   (Next.js)     │    │  (Next.js API)   │    │  (GROW Model)       │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    Database     │    │   OpenAI API    │
                       │   (Supabase)    │    │  (GPT-4o-mini)  │
                       └─────────────────┘    └─────────────────┘
```

### **Coaching-First Architecture**
The system employs a **coaching-based approach** helping parents discover their own solutions:

1. **Crisis Detection Agent** (Priority 1 - Safety First)
2. **Main Coaching Agent** (Priority 2 - GROW Model)
3. **Strategy Support System** (Collaborative, not prescriptive)

---

## 🤖 **AI Agent Specifications**

### **Crisis Detection Agent**
- **Model**: OpenAI GPT-4o-mini
- **Purpose**: Real-time safety monitoring and emergency response
- **Processing Time**: <1 second for crisis assessment
- **Tools**:
  - `assessCrisis`: Risk level evaluation (none/low/medium/high/critical)
  - `triggerEmergencyResponse`: Activates emergency protocols

#### **Crisis Detection Parameters**
```typescript
interface CrisisAssessment {
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  crisisType: 'none' | 'parental_burnout' | 'child_safety' | 'self_harm' | 'violence';
  immediateIntervention: boolean;
  recommendedResources: string[];
  urgency: 'routine' | 'today' | 'within_hour' | 'immediate';
}
```

### **Main Coaching Agent** (NEW - v2.0)
- **Model**: OpenAI GPT-4o-mini
- **Purpose**: Facilitative coaching using GROW model to help parents discover solutions
- **Approach**: OARS Framework (Open questions, Affirmations, Reflective listening, Summaries)
- **Session Structure**:
  - Goal: 10% (set intention)
  - Reality: 60% (deep exploration, 10-15 exchanges minimum)
  - Options: 20% (parent-generated + collaborative suggestions)
  - Will: 10% (commitment and action planning)
- **No artificial time limits**: Sessions end when parent has their own plan

#### **Coaching Principles** (System Prompt)
```typescript
systemPrompt: `
You are an ADHD parent coach. Your role is to help parents discover
their own solutions through facilitative guidance, NOT to dispense advice.

CORE PHILOSOPHY:
- Coaches help parents discover their own solutions
- Parents are experts on their child - you facilitate thinking
- Curiosity over advice. Always.

OARS FRAMEWORK:
- Open Questions: "Tell me more about mornings at your house"
- Affirmations: "That shows real creativity in how you handled it"
- Reflective Listening: "That sounds really overwhelming"
- Summaries: "Let me make sure I've understood..."

GROW MODEL PACING:
- Stay in Reality phase for minimum 10-15 exchanges
- Can't move to Options until: emotions reflected AND exceptions explored
- No automatic progression based on message count
`;
```

#### **Session State Tracking** (Replaces old tool-based approach)
```typescript
interface CoachingSessionState {
  currentPhase: 'goal' | 'reality' | 'options' | 'will' | 'closing';
  realityExplorationDepth: number;  // Counts exchanges, enforces minimum
  emotionsReflected: boolean;        // Must be true before Options
  exceptionsExplored: boolean;       // Must be true before Options
  strengthsIdentified: string[];     // What's working well
  parentGeneratedIdeas: string[];    // Their solutions, not bot's
  readyForOptions: boolean;          // Gated: only true after deep Reality exploration
}
```

### **Conversation Flow Logic** (NEW - Coaching-Based)
Unlike the previous transactional approach, conversations now follow coaching principles:

```typescript
// OLD APPROACH (v1.0): Stopped after tools executed
stopWhen: ({ toolResults }) => {
  return goalSet && strategyProvided; // 3-5 exchanges typical
}

// NEW APPROACH (v2.0): No artificial stopping
// Conversation ends when:
// 1. Parent feels heard (subjective, agent-detected)
// 2. Parent has generated their own plan (Will phase complete)
// 3. Crisis situation (immediate stop with resources)

conversationGuidelines: {
  minimumRealityExchanges: 10,
  emotionReflectionRequired: true,
  exceptionExplorationRequired: true,
  parentMustGenerateIdeas: true,
  noMessageCountLimits: true
}
```

---

## 🔄 **V2.0 Transformation Summary**

### **What Changed (October 2025)**

| **Aspect** | **V1.0 (Discovery-First)** | **V2.0 (Coaching-First)** |
|------------|---------------------------|---------------------------|
| **Approach** | Solution dispenser | Coaching companion |
| **Session Length** | 3-4 questions, then advice | 50 minutes, parent-driven ending |
| **System Prompt** | Transactional | OARS + GROW model |
| **Session State** | `discoveryPhaseComplete`, `questionsAsked` | `currentPhase`, `realityExplorationDepth`, `emotionsReflected` |
| **Agent Role** | Assess → Recommend | Explore → Reflect → Facilitate |
| **Parent Role** | Passive recipient | Active problem-solver |
| **Solutions** | Bot prescribes | Parent generates with support |

### **Migration Required**
```sql
-- Database schema changed (see migrations/add-coaching-state-columns.sql)
ALTER TABLE agent_sessions
  DROP COLUMN discovery_phase_complete,
  DROP COLUMN questions_asked,
  ADD COLUMN current_phase TEXT DEFAULT 'goal',
  ADD COLUMN reality_exploration_depth INTEGER DEFAULT 0,
  ADD COLUMN emotions_reflected BOOLEAN DEFAULT false,
  ADD COLUMN exceptions_explored BOOLEAN DEFAULT false,
  ADD COLUMN ready_for_options BOOLEAN DEFAULT false;
```

---

## 🗃️ **Database Schema**

### **Core Session Tables** (Updated for V2.0)
```sql
-- Main user sessions (COACHING STATE ADDED)
CREATE TABLE agent_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    therapeutic_goal TEXT,
    crisis_level TEXT DEFAULT 'none',
    strategies_discussed TEXT[],
    session_outcome TEXT,

    -- NEW: GROW Model Coaching State
    current_phase TEXT DEFAULT 'goal' CHECK (current_phase IN ('goal', 'reality', 'options', 'will', 'closing')),
    reality_exploration_depth INTEGER DEFAULT 0,
    emotions_reflected BOOLEAN DEFAULT false,
    exceptions_explored BOOLEAN DEFAULT false,
    strengths_identified TEXT[] DEFAULT '{}',
    parent_generated_ideas TEXT[] DEFAULT '{}',
    ready_for_options BOOLEAN DEFAULT false,

    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- Conversation history (unchanged)
CREATE TABLE agent_conversations (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES agent_sessions(id),
    role TEXT CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    agent_reasoning TEXT,
    created_at TIMESTAMPTZ
);
```

### **Performance & Analytics Tables**
```sql
-- Performance metrics per session
CREATE TABLE agent_performance (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES agent_sessions(id),
    user_id UUID REFERENCES users(id),
    total_tokens INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    tools_used INTEGER,
    response_time_ms INTEGER,
    successful_completion BOOLEAN,
    crisis_detected BOOLEAN,
    strategies_provided INTEGER,
    prompt_cost DECIMAL(10,6),
    completion_cost DECIMAL(10,6),
    total_cost DECIMAL(10,6),
    model_used TEXT DEFAULT 'gpt-4o-mini'
);

-- Tool usage tracking
CREATE TABLE agent_tool_usage (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES agent_sessions(id),
    tool_name TEXT NOT NULL,
    tool_input JSONB,
    tool_output JSONB,
    execution_time_ms INTEGER,
    success BOOLEAN,
    created_at TIMESTAMPTZ
);

-- Error logging
CREATE TABLE agent_errors (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES agent_sessions(id),
    agent_type TEXT, -- 'crisis' or 'main'
    error_message TEXT,
    error_context JSONB,
    created_at TIMESTAMPTZ
);
```

---

## 📊 **Performance Monitoring System**

### **Real-Time Metrics**
The system tracks comprehensive performance data:

```typescript
interface AgentPerformanceMetrics {
  sessionId: string;
  userId: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  toolsUsed: number;
  responseTimeMs: number;
  successfulCompletion: boolean;
  crisisDetected: boolean;
  strategiesProvided: number;
  timestamp: string;
}
```

### **Cost Calculation**
**GPT-4o-mini Pricing (2024)**:
- Prompt tokens: $0.15 per 1K tokens
- Completion tokens: $0.60 per 1K tokens

**Typical conversation costs**: $0.001 - $0.003

### **Analytics Endpoints**
- **GET** `/api/analytics` - Comprehensive usage reports
- **POST** `/api/chat` - Main conversation endpoint
- **GET** `/api/test` - System health check

---

## 🧠 **Evidence-Based Strategy Database**

### **Strategy Structure**
```typescript
interface ADHDStrategy {
  id: string;
  title: string;
  challenge: string; // "morning-routines", "homework-focus", etc.
  ageRange: string[]; // ["5-8", "9-12", "13-17"]
  description: string;
  implementation: string[]; // Step-by-step instructions
  timeframe: string;
  difficultyLevel: 'easy' | 'moderate' | 'challenging';
  evidenceLevel: 'research-backed' | 'clinical-practice' | 'parent-tested';
  successIndicators: string[];
}
```

### **Current Strategy Categories**
1. **Morning Routines** (visual charts, time management)
2. **Homework Focus** (Pomodoro technique, environment setup)
3. **Behavior Management** (positive reinforcement)
4. **Sleep/Bedtime** (calming routines)
5. **Emotional Regulation** (coping strategies)

### **Age-Appropriate Filtering**
The system automatically filters strategies based on child age:
- **5-8 years**: Visual aids, simple rewards
- **9-12 years**: Self-monitoring, intermediate complexity
- **13-17 years**: Independence, self-advocacy

---

## 🔒 **Security & Compliance**

### **GDPR Compliance**
```typescript
class GDPRManager {
  // 2-year data retention policy
  async scheduleDataDeletion(userId: string): Promise<void>;
  
  // User consent tracking
  async recordConsent(userId: string, consentData: any): Promise<void>;
  
  // Complete data deletion
  async executeDataDeletion(userId: string): Promise<void>;
}
```

### **Row-Level Security (RLS)**
All database tables implement RLS policies:
```sql
CREATE POLICY "Users can view own data" ON agent_sessions
  FOR ALL USING (user_id = auth.uid());
```

### **Environment Security**
- API keys stored in `.env.local`
- Supabase service role key for backend operations
- HTTPS enforcement in production

---

## 🚀 **Deployment Configuration**

### **Environment Variables**
```bash
# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication (optional)
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=https://your-domain.com
```

### **Production Deployment Steps**
1. **Vercel Deployment**: `npx vercel --prod`
2. **Environment Setup**: Configure all required environment variables
3. **Database Migration**: Run SQL schema in Supabase
4. **DNS Configuration**: Point custom domain to Vercel
5. **SSL/TLS**: Automatic HTTPS via Vercel

### **Monitoring Setup**
```typescript
// Performance tracking automatically enabled
performanceTracker.trackSession({
  sessionId: session.id,
  userId: session.userId,
  totalTokens: result.usage.totalTokens,
  responseTimeMs: Date.now() - startTime,
  successfulCompletion: true,
  crisisDetected: !!crisisAssessment
});
```

---

## 🔧 **Development Workflow**

### **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type checking
npm run lint
```

### **Code Quality**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Jest**: Unit testing framework
- **Prettier**: Code formatting (configured)

### **Testing Strategy**
```typescript
// Agent functionality tests
describe('ADHD Support Agent', () => {
  it('should detect morning routine challenges', async () => {
    const result = await agent("My child takes forever to get ready");
    expect(result.toolResults).toBeDefined();
  });
  
  it('should identify crisis situations', async () => {
    const result = await agent("I can't take this anymore");
    expect(crisisTool.result.severity).toBe('severe');
  });
});
```

---

## 📈 **Performance Benchmarks**

### **Response Time Targets**
- **Crisis Detection**: <1 second
- **Simple Queries**: 2-4 seconds  
- **Complex Strategy Retrieval**: 5-8 seconds
- **Database Operations**: <500ms

### **Token Usage Optimization**
- **Average Conversation**: 800-1200 tokens
- **Crisis Detection**: 400-600 tokens
- **Strategy Retrieval**: 600-900 tokens
- **Cost per Conversation**: $0.001-0.003

### **Reliability Metrics**
- **Uptime Target**: 99.9%
- **Error Rate**: <0.1%
- **Crisis Detection Accuracy**: >95%
- **User Satisfaction**: Measured via feedback

---

## 🔄 **API Integration Patterns**

### **Frontend to Backend Communication**
```typescript
// Chat API call
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    context: {
      userId: crypto.randomUUID(),
      sessionId: crypto.randomUUID()
    }
  })
});
```

### **AI SDK Integration**
```typescript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4o-mini'),
  system: therapeuticSystemPrompt,
  prompt: userMessage,
  tools: { assessSituation, retrieveStrategy, detectCrisis, setTherapeuticGoal },
  maxSteps: 5,
  stopWhen: intelligentStoppingConditions
});
```

---

## 📚 **Documentation Structure**

```
docs/
├── client-updates/          # Progress reports and updates
│   └── progress-update-2025-01-25.md
├── technical/               # Technical specifications
│   ├── technical-specification.md
│   ├── api-documentation.md
│   └── database-schema.md
├── architecture/            # System design documents
│   ├── multi-agent-design.md
│   └── security-model.md
└── deployment/              # Deployment and operations
    ├── production-deployment.md
    └── monitoring-setup.md
```

This technical specification provides comprehensive details for development, deployment, and maintenance of the ADHD Support Agent system.