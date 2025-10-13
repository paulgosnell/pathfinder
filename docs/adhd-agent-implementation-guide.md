# ADHD Support AI Agent: Option 2 Implementation Guide

## From Zero to Agent in 6 Days

Building from AI SDK examples with full control over the agent architecture.

## Day 1: Foundation Setup

### Project Initialization

```bash
# Create Next.js 15 project
npx create-next-app@latest adhd-support-agent --typescript --tailwind --app
cd adhd-support-agent

# Install AI SDK v5 and core dependencies
npm install ai @ai-sdk/openai zod
npm install @supabase/supabase-js
npm install next-auth@beta
npm install date-fns compromise

# Development dependencies
npm install -D @types/node @testing-library/jest-dom jest
```

### Core Agent Architecture

**File: `lib/agents/core-agent.ts`**

```typescript
import { generateText, tool, stopWhen } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface AgentContext {
  userId: string;
  sessionId: string;
  childAge?: string;
  previousStrategies?: string[];
  currentMood?: number;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

export const createADHDSupportAgent = () => {
  return async (message: string, context: AgentContext) => {
    const result = await generateText({
      model: openai('gpt-4'),
      system: `You are a specialized ADHD support agent for parents. 

      Core responsibilities:
      - Assess parent stress and provide evidence-based ADHD strategies
      - Monitor for crisis situations requiring immediate intervention  
      - Maintain therapeutic progress across conversations
      - Adapt communication style to ADHD-friendly patterns (concise, structured)

      Current context: ${JSON.stringify(context)}`,

      messages: [
        {
          role: 'user',
          content: message
        }
      ],

      tools: {
        assessSituation: tool({
          description: 'Analyze the current parenting challenge and determine intervention approach',
          parameters: z.object({
            primaryChallenge: z.string().describe('Main ADHD-related challenge identified'),
            stressLevel: z.enum(['low', 'medium', 'high', 'crisis']),
            urgency: z.enum(['routine', 'same_day', 'immediate']),
            recommendedApproach: z.enum(['strategy_support', 'emotional_support', 'crisis_intervention', 'professional_referral'])
          })
        }),

        retrieveStrategy: tool({
          description: 'Find appropriate ADHD parenting strategy for the identified challenge',
          parameters: z.object({
            challenge: z.string(),
            childAge: z.string().optional(),
            previouslyTried: z.array(z.string()).optional()
          })
        }),

        detectCrisis: tool({
          description: 'Assess for crisis situations requiring immediate intervention',
          parameters: z.object({
            crisisType: z.enum(['none', 'parental_burnout', 'child_safety', 'suicidal_ideation', 'violence_risk']),
            severity: z.enum(['none', 'mild', 'moderate', 'severe', 'critical']),
            immediateAction: z.boolean().describe('Whether immediate professional intervention is needed')
          })
        }),

        setTherapeuticGoal: tool({
          description: 'Establish or update the therapeutic goal for this session',
          parameters: z.object({
            goal: z.string().describe('Specific, measurable goal for this conversation'),
            timeframe: z.string().describe('Expected timeframe for achieving this goal'),
            successMetrics: z.array(z.string()).describe('How to measure progress')
          })
        })
      },

      // Agent stops when crisis is detected or goal is achieved
      stopWhen: ({ toolResults }) => {
        const crisisDetected = toolResults.some(result => 
          result.toolName === 'detectCrisis' && 
          ['severe', 'critical'].includes(result.result.severity)
        );
        
        const goalSet = toolResults.some(result => 
          result.toolName === 'setTherapeuticGoal'
        );

        return crisisDetected || goalSet;
      },

      maxSteps: 5 // Prevent infinite loops
    });

    return result;
  };
};
```

### Basic Next.js API Route

**File: `app/api/chat/route.ts`**

```typescript
import { createADHDSupportAgent } from '@/lib/agents/core-agent';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    
    const agent = createADHDSupportAgent();
    const result = await agent(message, context);

    return new Response(JSON.stringify({
      message: result.text,
      toolResults: result.toolResults,
      usage: result.usage
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Agent error:', error);
    return new Response('Agent processing failed', { status: 500 });
  }
}
```

### Simple UI Component

**File: `app/page.tsx`**

```typescript
'use client';

import { useState } from 'react';

export default function ADHDSupportChat() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            userId: 'user-1', // Replace with actual auth
            sessionId: 'session-1'
          }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ADHD Support Agent</h1>
      
      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-blue-600' : 'text-gray-800'}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-500">Agent thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Describe your ADHD parenting challenge..."
          className="flex-1 p-2 border rounded"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

## Day 2: Specialist Agents & Strategy System

### Strategy Retrieval Agent

**File: `lib/agents/strategy-agent.ts`**

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const strategySchema = z.object({
  title: z.string(),
  description: z.string(),
  implementation: z.array(z.string()),
  timeframe: z.string(),
  ageAppropriate: z.boolean(),
  difficultyLevel: z.enum(['easy', 'moderate', 'challenging']),
  evidenceLevel: z.enum(['research-backed', 'clinical-practice', 'parent-tested'])
});

export const createStrategyAgent = () => {
  return async (challenge: string, childContext: any) => {
    const result = await generateObject({
      model: openai('gpt-4'),
      system: `You are an ADHD strategy specialist. Provide evidence-based, practical interventions for specific parenting challenges.
      
      Focus on:
      - Strategies proven effective for ADHD
      - Age-appropriate implementations  
      - Clear, actionable steps
      - Realistic expectations for overwhelmed parents`,

      messages: [
        {
          role: 'user', 
          content: `Challenge: ${challenge}\nChild context: ${JSON.stringify(childContext)}`
        }
      ],

      schema: z.object({
        primaryStrategies: z.array(strategySchema),
        backupOptions: z.array(strategySchema),
        warningFlags: z.array(z.string()).describe('When to seek professional help'),
        implementationTips: z.array(z.string()),
        successIndicators: z.array(z.string())
      })
    });

    return result.object;
  };
};
```

### Crisis Detection Agent

**File: `lib/agents/crisis-agent.ts`**

```typescript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const createCrisisAgent = () => {
  return async (message: string, sessionHistory: any[]) => {
    const result = await generateText({
      model: openai('gpt-4'),
      system: `You are a crisis detection specialist for parents of ADHD children. 
      
      Assess for:
      - Suicidal ideation or self-harm intent
      - Violence toward child or family  
      - Severe parental burnout requiring immediate support
      - Child safety concerns
      
      ALWAYS prioritize safety over conversation flow.`,

      messages: [
        {
          role: 'user',
          content: `Current message: ${message}\n\nSession context: ${JSON.stringify(sessionHistory.slice(-5))}`
        }
      ],

      tools: {
        assessCrisis: tool({
          description: 'Evaluate immediate crisis risk and required response',
          parameters: z.object({
            riskLevel: z.enum(['none', 'low', 'medium', 'high', 'critical']),
            crisisType: z.enum(['none', 'parental_burnout', 'child_safety', 'self_harm', 'violence']),
            immediateIntervention: z.boolean(),
            recommendedResources: z.array(z.string()),
            urgency: z.enum(['routine', 'today', 'within_hour', 'immediate'])
          })
        }),

        triggerEmergencyResponse: tool({
          description: 'Activate emergency protocols for critical situations',
          parameters: z.object({
            emergencyType: z.string(),
            resources: z.array(z.string()),
            followUpRequired: z.boolean()
          })
        })
      },

      stopWhen: ({ toolResults }) => {
        return toolResults.some(result => 
          result.toolName === 'assessCrisis' && 
          ['high', 'critical'].includes(result.result.riskLevel)
        );
      }
    });

    return result;
  };
};
```

### In-Memory Strategy Database (Day 2)

**File: `lib/data/strategies.ts`**

```typescript
export const adhdStrategies = [
  {
    id: 'morning-routine-visual',
    title: 'Visual Morning Routine Chart',
    challenge: 'morning-routines',
    ageRange: ['5-8', '9-12'],
    description: 'Create a visual step-by-step morning routine chart with pictures',
    implementation: [
      'Take photos of your child doing each morning task',
      'Create a laminated chart with pictures in sequence', 
      'Use checkboxes or velcro stars for completion',
      'Place chart at child\'s eye level in bedroom'
    ],
    timeframe: '1-2 weeks to establish',
    difficultyLevel: 'easy',
    evidenceLevel: 'research-backed',
    successIndicators: [
      'Child refers to chart independently',
      'Completion rate increases over time',
      'Reduced morning conflicts'
    ]
  },
  {
    id: 'homework-timer-method',
    title: 'Pomodoro Timer for Homework',
    challenge: 'homework-focus',
    ageRange: ['9-12', '13-17'],
    description: 'Break homework into 15-25 minute focused sessions with breaks',
    implementation: [
      'Set timer for 15 minutes (younger) or 25 minutes (older)',
      'Work on ONE subject only during timer',
      'Take 5-minute movement break when timer ends',
      'Repeat 2-4 cycles depending on homework load'
    ],
    timeframe: 'Immediate implementation',
    difficultyLevel: 'easy',
    evidenceLevel: 'research-backed',
    successIndicators: [
      'Increased homework completion',
      'Less resistance to starting homework',
      'Improved focus during work periods'
    ]
  }
];

export const findStrategies = (challenge: string, ageRange?: string) => {
  return adhdStrategies.filter(strategy => {
    const challengeMatch = strategy.challenge.includes(challenge.toLowerCase());
    const ageMatch = !ageRange || strategy.ageRange.includes(ageRange);
    return challengeMatch && ageMatch;
  });
};
```

## Day 3: Session Management & State

### Session Manager

**File: `lib/session/manager.ts`**

```typescript
interface SessionState {
  id: string;
  userId: string;
  therapeuticGoal?: string;
  currentMood?: number;
  strategiesDiscussed: string[];
  crisisLevel: string;
  startedAt: Date;
  lastActivity: Date;
}

class SessionManager {
  private sessions = new Map<string, SessionState>();

  createSession(userId: string): SessionState {
    const session: SessionState = {
      id: `session_${Date.now()}`,
      userId,
      strategiesDiscussed: [],
      crisisLevel: 'none',
      startedAt: new Date(),
      lastActivity: new Date()
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  updateSession(sessionId: string, updates: Partial<SessionState>) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      session.lastActivity = new Date();
    }
  }

  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  addStrategy(sessionId: string, strategy: string) {
    const session = this.sessions.get(sessionId);
    if (session && !session.strategiesDiscussed.includes(strategy)) {
      session.strategiesDiscussed.push(strategy);
    }
  }

  shouldEndSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return true;

    // End after 15 minutes of inactivity
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return session.lastActivity < fifteenMinutesAgo;
  }
}

export const sessionManager = new SessionManager();
```

### Enhanced API Route with Session Management

**File: `app/api/chat/route.ts`** (Updated)

```typescript
import { createADHDSupportAgent } from '@/lib/agents/core-agent';
import { createCrisisAgent } from '@/lib/agents/crisis-agent';
import { createStrategyAgent } from '@/lib/agents/strategy-agent';
import { sessionManager } from '@/lib/session/manager';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, userId, sessionId } = await req.json();
    
    // Get or create session
    let session = sessionManager.getSession(sessionId);
    if (!session) {
      session = sessionManager.createSession(userId);
    }

    // First check for crisis
    const crisisAgent = createCrisisAgent();
    const crisisResult = await crisisAgent(message, []);
    
    if (crisisResult.toolResults?.[0]?.result?.riskLevel === 'critical') {
      sessionManager.updateSession(session.id, { crisisLevel: 'critical' });
      
      return new Response(JSON.stringify({
        message: "I'm very concerned about what you've shared. Please call 999 if you're in immediate danger, or Samaritans on 116 123 for 24/7 support. Your safety and your child's safety are the priority right now.",
        crisis: true,
        resources: crisisResult.toolResults[0].result.recommendedResources
      }));
    }

    // Normal agent processing
    const agent = createADHDSupportAgent();
    const result = await agent(message, {
      userId: session.userId,
      sessionId: session.id,
      previousStrategies: session.strategiesDiscussed
    });

    // Update session with any strategies discussed
    if (result.toolResults) {
      result.toolResults.forEach(toolResult => {
        if (toolResult.toolName === 'retrieveStrategy') {
          sessionManager.addStrategy(session.id, toolResult.result.challenge);
        }
      });
    }

    return new Response(JSON.stringify({
      message: result.text,
      sessionId: session.id,
      toolResults: result.toolResults
    }));
    
  } catch (error) {
    console.error('Agent error:', error);
    return new Response('Agent processing failed', { status: 500 });
  }
}
```

## Day 4: Database Integration & GDPR

### Supabase Setup

**File: `lib/supabase/client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface AgentSession {
  id: string;
  user_id: string;
  therapeutic_goal?: string;
  crisis_level: string;
  strategies_discussed: string[];
  session_outcome?: string;
  started_at: string;
  ended_at?: string;
}

export interface AgentConversation {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any;
  agent_reasoning?: string;
  created_at: string;
}
```

### Database Persistence Layer

**File: `lib/database/sessions.ts`**

```typescript
import { supabase, AgentSession } from '@/lib/supabase/client';

export class DatabaseSessionManager {
  async createSession(userId: string, therapeuticGoal?: string): Promise<AgentSession> {
    const { data, error } = await supabase
      .from('agent_sessions')
      .insert({
        user_id: userId,
        therapeutic_goal: therapeuticGoal,
        crisis_level: 'none',
        strategies_discussed: [],
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSession(sessionId: string, updates: Partial<AgentSession>) {
    const { error } = await supabase
      .from('agent_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  async saveConversation(sessionId: string, role: string, content: string, toolCalls?: any) {
    const { error } = await supabase
      .from('agent_conversations')
      .insert({
        session_id: sessionId,
        role,
        content,
        tool_calls: toolCalls,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getSessionHistory(sessionId: string, limit = 10) {
    const { data, error } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  }
}

export const dbSessionManager = new DatabaseSessionManager();
```

### GDPR Compliance Utilities

**File: `lib/gdpr/compliance.ts`**

```typescript
import { supabase } from '@/lib/supabase/client';
import { addYears } from 'date-fns';

export class GDPRManager {
  async recordConsent(userId: string, consentData: any) {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        consent_details: consentData,
        gdpr_delete_at: addYears(new Date(), 2).toISOString() // 2-year retention
      });

    if (error) throw error;
  }

  async scheduleDataDeletion(userId: string, deletionDate?: Date) {
    const deleteAt = deletionDate || addYears(new Date(), 2);
    
    const { error } = await supabase
      .from('users')
      .update({ gdpr_delete_at: deleteAt.toISOString() })
      .eq('id', userId);

    if (error) throw error;
  }

  async executeDataDeletion(userId: string) {
    // Delete in reverse dependency order
    const tables = [
      'agent_conversations',
      'agent_sessions', 
      'strategy_usage',
      'users'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error(`Failed to delete from ${table}:`, error);
        throw error;
      }
    }
  }

  async processScheduledDeletions() {
    const { data: usersToDelete } = await supabase
      .from('users')
      .select('id')
      .lt('gdpr_delete_at', new Date().toISOString());

    if (usersToDelete) {
      for (const user of usersToDelete) {
        await this.executeDataDeletion(user.id);
      }
    }
  }
}

export const gdprManager = new GDPRManager();
```

## Day 5: Testing & Validation

### Agent Testing Framework

**File: `__tests__/agents/core-agent.test.ts`**

```typescript
import { createADHDSupportAgent } from '@/lib/agents/core-agent';

describe('ADHD Support Agent', () => {
  const agent = createADHDSupportAgent();

  it('should detect morning routine challenges', async () => {
    const result = await agent(
      "My 8-year-old takes forever to get ready for school every morning",
      { 
        userId: 'test-user',
        sessionId: 'test-session',
        childAge: '8'
      }
    );

    expect(result.text).toContain('morning');
    expect(result.toolResults).toBeDefined();
    
    const assessmentTool = result.toolResults?.find(r => r.toolName === 'assessSituation');
    expect(assessmentTool?.result.primaryChallenge).toContain('morning');
  });

  it('should detect crisis situations', async () => {
    const result = await agent(
      "I can't take this anymore, I feel like hurting myself",
      {
        userId: 'test-user', 
        sessionId: 'test-session'
      }
    );

    const crisisTool = result.toolResults?.find(r => r.toolName === 'detectCrisis');
    expect(crisisTool?.result.crisisType).toBe('suicidal_ideation');
    expect(crisisTool?.result.severity).toBe('severe');
  });

  it('should set therapeutic goals', async () => {
    const result = await agent(
      "I want to improve our morning routine so we're not always rushing",
      {
        userId: 'test-user',
        sessionId: 'test-session',
        childAge: '10'
      }
    );

    const goalTool = result.toolResults?.find(r => r.toolName === 'setTherapeuticGoal');
    expect(goalTool?.result.goal).toContain('morning routine');
  });
});
```

### Conversation Flow Testing

**File: `__tests__/flows/conversation-flows.test.ts`**

```typescript
import { createADHDSupportAgent } from '@/lib/agents/core-agent';

describe('Conversation Flows', () => {
  it('should handle complete morning routine conversation', async () => {
    const agent = createADHDSupportAgent();
    const context = { 
      userId: 'test-user', 
      sessionId: 'test-session',
      childAge: '8'
    };

    // Step 1: Problem identification
    const step1 = await agent("My son won't get dressed for school", context);
    expect(step1.text).toContain('morning');

    // Step 2: Strategy request
    const step2 = await agent("What can I do to help him?", {
      ...context,
      previousStrategies: ['visual-chart']
    });
    
    const strategyTool = step2.toolResults?.find(r => r.toolName === 'retrieveStrategy');
    expect(strategyTool).toBeDefined();

    // Step 3: Goal setting
    const step3 = await agent("I want to try that approach", context);
    const goalTool = step3.toolResults?.find(r => r.toolName === 'setTherapeuticGoal');
    expect(goalTool).toBeDefined();
  });
});
```

## Day 6: Deployment & Production

### Environment Configuration

**File: `.env.example`**

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication (if using)
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# Production settings
NODE_ENV=production
```

### Deployment on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# or use CLI:
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc
```

### Production Monitoring

**File: `lib/monitoring/agent-monitor.ts`**

```typescript
export class AgentMonitor {
  static async logAgentDecision(
    sessionId: string,
    decisionPoint: string,
    context: any,
    decision: string
  ) {
    try {
      await supabase.from('agent_decisions').insert({
        session_id: sessionId,
        decision_point: decisionPoint,
        context_factors: context,
        decision_made: decision,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log agent decision:', error);
    }
  }

  static async trackAgentPerformance(sessionId: string, outcome: string) {
    try {
      await supabase
        .from('agent_sessions')
        .update({ session_outcome: outcome })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }
}
```

## Key Advantages of Option 2

1. **Full Control**: You own every aspect of the agent architecture
2. **Agent-First**: Built around reasoning and decision-making, not just chat
3. **Extensible**: Easy to add new specialist agents or tools
4. **Cost Effective**: No template overhead, optimized for your specific needs
5. **Learning**: Deep understanding of AI SDK v5 patterns
6. **Performance**: Tailored specifically for ADHD support use cases

## Next Steps After Day 6

- **Content Expansion**: Add more ADHD strategies to the database
- **UI Enhancement**: Build better parent-friendly interface
- **Analytics**: Add usage tracking and effectiveness metrics
- **Specialist Agents**: Create agents for specific challenges (school, behavior, etc.)
- **Integration**: Connect with external resources (NHS, local support groups)

This approach gives you a production-ready ADHD support AI agent with full control over its behavior and growth trajectory.