# ADHD Support Agent - Technical Specification
**Version**: 1.0  
**Date**: January 25, 2025  
**Technology Stack**: Next.js 15, AI SDK v5, Supabase, OpenAI GPT-4o-mini

---

## 🏗️ **System Architecture**

### **High-Level Overview**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │◄──►│   API Gateway    │◄──►│  AI Agent Core  │
│   (Next.js)     │    │  (Next.js API)   │    │  (Multi-Agent)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    Database     │    │   OpenAI API    │
                       │   (Supabase)    │    │  (GPT-4o-mini)  │
                       └─────────────────┘    └─────────────────┘
```

### **Multi-Agent Architecture**
The system employs a sophisticated multi-agent approach with specialized AI agents:

1. **Crisis Detection Agent** (Priority 1)
2. **Main Therapeutic Agent** (Priority 2)
3. **Strategy Retrieval System** (Support)

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

### **Main Therapeutic Agent**
- **Model**: OpenAI GPT-4o-mini
- **Purpose**: Evidence-based ADHD support and strategy provision
- **Max Steps**: 5 (prevents infinite loops)
- **Tools**:

#### **1. Situation Assessment Tool**
```typescript
assessSituation: {
  primaryChallenge: string;
  stressLevel: 'low' | 'medium' | 'high' | 'crisis';
  urgency: 'routine' | 'same_day' | 'immediate';
  recommendedApproach: 'strategy_support' | 'emotional_support' | 'crisis_intervention' | 'professional_referral';
}
```

#### **2. Strategy Retrieval Tool**
```typescript
retrieveStrategy: {
  challenge: string; // e.g., "morning-routines", "homework-focus"
  childAge?: '5-8' | '9-12' | '13-17';
  previouslyTried?: string[]; // Avoid suggesting same strategies
}
```

#### **3. Crisis Detection Tool**
```typescript
detectCrisis: {
  riskIndicators: string[];
  severity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  immediateAction: boolean;
}
```

#### **4. Therapeutic Goal Setting Tool**
```typescript
setTherapeuticGoal: {
  goal: string; // Specific, measurable objective
  timeframe: string; // Expected achievement timeline
  successMetrics: string[]; // How to measure progress
}
```

### **Intelligent Stopping Conditions**
The system uses sophisticated logic to determine when conversations are complete:

```typescript
stopWhen: ({ toolResults, stepCount }) => {
  // Immediate stop for crisis situations
  const crisisDetected = toolResults?.some(result => 
    result.toolName === 'detectCrisis' && 
    ['severe', 'critical'].includes(result.result.severity)
  );
  
  // Stop when therapeutic objectives are met
  const goalSet = toolResults?.some(result => 
    result.toolName === 'setTherapeuticGoal'
  );
  const strategyProvided = toolResults?.some(result => 
    result.toolName === 'retrieveStrategy'
  );
  
  // Prevent infinite loops
  return crisisDetected || (goalSet && strategyProvided) || stepCount >= 5;
}
```

---

## 🗃️ **Database Schema**

### **Core Session Tables**
```sql
-- Main user sessions
CREATE TABLE agent_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    therapeutic_goal TEXT,
    crisis_level TEXT DEFAULT 'none',
    strategies_discussed TEXT[],
    session_outcome TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- Conversation history
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