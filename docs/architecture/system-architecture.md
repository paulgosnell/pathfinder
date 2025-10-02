# ADHD Support Agent - System Architecture

## 🏗️ **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ADHD Support Agent System                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐  │
│  │   Client UI     │    │   API Gateway    │    │     AI Agent Core          │  │
│  │                 │    │                  │    │                             │  │
│  │ • React 19      │◄──►│ • Next.js 15 API │◄──►│ • Crisis Agent (Priority)   │  │
│  │ • Tailwind CSS  │    │ • Error Handling │    │ • Therapeutic Agent (Main)  │  │
│  │ • TypeScript    │    │ • Rate Limiting  │    │ • Strategy Retrieval        │  │
│  │ • Real-time UI  │    │ • Validation     │    │ • Performance Monitoring    │  │
│  └─────────────────┘    └──────────────────┘    └─────────────────────────────┘  │
│                                 │                              │                 │
│                                 ▼                              ▼                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐  │
│  │   Database      │    │   Monitoring     │    │      External APIs          │  │
│  │                 │    │                  │    │                             │  │
│  │ • Supabase PG   │    │ • Performance    │    │ • OpenAI GPT-4o-mini        │  │
│  │ • Session Store │    │ • Analytics      │    │ • Token Usage Tracking      │  │
│  │ • User Data     │    │ • Error Logging  │    │ • Cost Optimization         │  │
│  │ • GDPR Compliant│    │ • Usage Reports  │    │ • Model Management          │  │
│  └─────────────────┘    └──────────────────┘    └─────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🤖 **Multi-Agent Processing Flow**

```
User Message
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                Step 1: Crisis Detection                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Crisis Agent (GPT-4o-mini)              │ │
│  │                                                     │ │
│  │  Tools:                                             │ │
│  │  • assessCrisis (risk level analysis)              │ │
│  │  • triggerEmergencyResponse (safety protocols)     │ │
│  │                                                     │ │
│  │  Output: Crisis Assessment                          │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
     │
     ▼ (if not critical)
┌─────────────────────────────────────────────────────────┐
│              Step 2: Therapeutic Processing            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Main Therapeutic Agent (GPT-4o-mini)       │ │
│  │                                                     │ │
│  │  Tools:                                             │ │
│  │  • assessSituation (challenge analysis)            │ │
│  │  • retrieveStrategy (evidence-based solutions)     │ │
│  │  • detectCrisis (secondary safety check)           │ │
│  │  • setTherapeuticGoal (outcome objectives)         │ │
│  │                                                     │ │
│  │  Smart Stopping: Max 5 steps, goal-based ending    │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│            Step 3: Data Persistence & Analytics        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │             Performance Tracking                    │ │
│  │                                                     │ │
│  │  • Session data → Supabase                          │ │
│  │  • Token usage → Cost calculation                   │ │
│  │  • Tool effectiveness → Analytics                   │ │
│  │  • Error logging → Monitoring                       │ │
│  │  • GDPR compliance → Data management                │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
     │
     ▼
 User Response
```

## 🔄 **Agent Decision Tree**

```
┌─────────────────┐
│  User Message   │
└─────────┬───────┘
          │
          ▼
    ┌──────────┐      YES    ┌─────────────────┐
    │ Crisis?  │────────────►│ Emergency Mode  │
    └─────┬────┘             │                 │
          │ NO               │ • Stop processing│
          ▼                  │ • Show resources │
┌─────────────────┐          │ • Log incident   │
│ Assess Challenge│          └─────────────────┘
└─────────┬───────┘
          │
          ▼
    ┌──────────┐      YES    ┌─────────────────┐
    │Strategy  │────────────►│ Retrieve & Show │
    │Needed?   │             │ Evidence-Based  │
    └─────┬────┘             │ Interventions   │
          │ NO               └─────────────────┘
          ▼
┌─────────────────┐
│ Emotional       │
│ Support Mode    │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│ Set Therapeutic │
│ Goals & Metrics │
└─────────────────┘
```

## 🗄️ **Database Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             Supabase PostgreSQL                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │     Users       │    │  Agent Sessions │    │   Agent Conversations       │  │
│  │                 │    │                 │    │                             │  │
│  │ • id (UUID)     │◄───┤ • id (UUID)     │◄───┤ • id (UUID)                │  │
│  │ • consent_given │    │ • user_id (FK)  │    │ • session_id (FK)           │  │
│  │ • gdpr_delete   │    │ • therap_goal   │    │ • role (user/assistant)     │  │
│  │ • created_at    │    │ • crisis_level  │    │ • content                   │  │
│  └─────────────────┘    │ • strategies[]  │    │ • tool_calls (JSONB)        │  │
│                         │ • outcome       │    │ • created_at                │  │
│                         └─────────────────┘    └─────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │Agent Performance│    │ Agent Tool Usage│    │      Agent Errors           │  │
│  │                 │    │                 │    │                             │  │
│  │ • session_id    │    │ • session_id    │    │ • session_id                │  │
│  │ • total_tokens  │    │ • tool_name     │    │ • agent_type                │  │
│  │ • response_time │    │ • tool_input    │    │ • error_message             │  │
│  │ • total_cost    │    │ • tool_output   │    │ • error_context (JSONB)     │  │
│  │ • crisis_detect │    │ • success       │    │ • created_at                │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔒 **Security Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             Security Layers                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Application Layer                                    │ │
│  │                                                                             │ │
│  │  • Input Validation (Zod schemas)                                          │ │
│  │  • Error Handling (try-catch blocks)                                       │ │
│  │  • Rate Limiting (API protection)                                          │ │
│  │  • Environment Variable Security                                           │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Database Layer                                       │ │
│  │                                                                             │ │
│  │  • Row-Level Security (RLS) Policies                                       │ │
│  │  • User Authentication (auth.uid())                                        │ │
│  │  • Encrypted Data at Rest                                                  │ │
│  │  • Connection Encryption (TLS/SSL)                                         │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                       GDPR Compliance Layer                                │ │
│  │                                                                             │ │
│  │  • 2-Year Data Retention Policy                                            │ │
│  │  • Automatic Data Deletion Scheduling                                      │ │
│  │  • User Consent Tracking                                                   │ │
│  │  • Data Export/Portability                                                 │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 **Performance Monitoring Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Monitoring & Analytics                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │ Real-time       │    │   Cost          │    │     Performance             │  │
│  │ Monitoring      │    │   Tracking      │    │     Analytics               │  │
│  │                 │    │                 │    │                             │  │
│  │ • Response Time │    │ • Token Usage   │    │ • Tool Effectiveness        │  │
│  │ • Error Rates   │    │ • API Costs     │    │ • User Satisfaction         │  │
│  │ • User Sessions │    │ • Budget Alerts │    │ • Conversation Quality      │  │
│  │ • Crisis Events │    │ • Cost per User │    │ • Success Metrics           │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
│           │                       │                          │                 │
│           └───────────────────────┼──────────────────────────┘                 │
│                                   ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Analytics Dashboard                                  │ │
│  │                                                                             │ │
│  │  • Daily/Weekly/Monthly Reports                                            │ │
│  │  • Performance Trends                                                      │ │
│  │  • Cost Analysis & Optimization                                            │ │
│  │  • Error Pattern Analysis                                                  │ │
│  │  • User Behavior Insights                                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Production Environment                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │    Vercel       │    │    Supabase     │    │       OpenAI API            │  │
│  │   Platform      │    │   (Database)    │    │                             │  │
│  │                 │    │                 │    │ • GPT-4o-mini Model         │  │
│  │ • Auto-scaling  │◄──►│ • PostgreSQL    │    │ • Token Usage Tracking      │  │
│  │ • Edge Network  │    │ • Real-time     │    │ • Cost Optimization         │  │
│  │ • SSL/TLS       │    │ • Backups       │    │ • Rate Limiting             │  │
│  │ • CDN           │    │ • Monitoring    │    │ • Error Handling            │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           Environment Variables                             │ │
│  │                                                                             │ │
│  │  • OPENAI_API_KEY (secure)                                                 │ │
│  │  • NEXT_PUBLIC_SUPABASE_URL (public)                                       │ │
│  │  • NEXT_PUBLIC_SUPABASE_ANON_KEY (public)                                  │ │
│  │  • SUPABASE_SERVICE_ROLE_KEY (secure)                                      │ │
│  │  • NEXTAUTH_SECRET (secure)                                                │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 **Data Flow Architecture**

```
User Input → API Gateway → Crisis Check → Main Agent → Database → Response

   │              │             │            │           │           │
   ▼              ▼             ▼            ▼           ▼           ▼
┌──────┐   ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐
│React │   │ Validation  │ │Emergency│ │Therapeutic│ │Supabase │ │UI Update│
│ UI   │   │ Rate Limit  │ │Response │ │Processing │ │ Storage │ │Response │
│      │   │ Error Handle│ │         │ │ Tools     │ │ Analytics│ │ Display │
└──────┘   └─────────────┘ └─────────┘ └──────────┘ └─────────┘ └─────────┘
```

This architecture provides a robust, scalable, and secure foundation for the ADHD Support Agent system, with comprehensive monitoring, error handling, and performance optimization built into every layer.