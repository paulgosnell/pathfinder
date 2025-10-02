-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_given BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMPTZ,
    consent_details JSONB,
    gdpr_delete_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_sessions table
CREATE TABLE agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    therapeutic_goal TEXT,
    crisis_level TEXT DEFAULT 'none',
    strategies_discussed TEXT[] DEFAULT '{}',
    session_outcome TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_conversations table
CREATE TABLE agent_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    agent_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_decisions table for monitoring
CREATE TABLE agent_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
    decision_point TEXT NOT NULL,
    context_factors JSONB,
    decision_made TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create strategy_usage table for tracking effectiveness
CREATE TABLE strategy_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    strategy_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX idx_agent_conversations_session_id ON agent_conversations(session_id);
CREATE INDEX idx_agent_decisions_session_id ON agent_decisions(session_id);
CREATE INDEX idx_strategy_usage_user_id ON strategy_usage(user_id);
CREATE INDEX idx_users_gdpr_delete_at ON users(gdpr_delete_at) WHERE gdpr_delete_at IS NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_usage ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth setup)
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can view own sessions" ON agent_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own conversations" ON agent_conversations
    FOR ALL USING (session_id IN (
        SELECT id FROM agent_sessions WHERE user_id = auth.uid()
    ));

-- Allow anonymous access for development/testing
CREATE POLICY "Anonymous access" ON agent_conversations
    FOR ALL USING (true);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_sessions_updated_at BEFORE UPDATE ON agent_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_usage_updated_at BEFORE UPDATE ON strategy_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();