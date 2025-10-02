-- Add performance tracking tables to existing schema

-- Agent performance metrics per session
CREATE TABLE agent_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_tokens INTEGER NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    tools_used INTEGER NOT NULL DEFAULT 0,
    response_time_ms INTEGER NOT NULL,
    successful_completion BOOLEAN NOT NULL DEFAULT true,
    crisis_detected BOOLEAN NOT NULL DEFAULT false,
    strategies_provided INTEGER NOT NULL DEFAULT 0,
    prompt_cost DECIMAL(10,6) NOT NULL,
    completion_cost DECIMAL(10,6) NOT NULL,
    total_cost DECIMAL(10,6) NOT NULL,
    model_used TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent error logs
CREATE TABLE agent_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL, -- 'crisis' or 'main'
    error_message TEXT NOT NULL,
    error_context JSONB,
    model_used TEXT,
    message_length INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool usage tracking
CREATE TABLE agent_tool_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    tool_input JSONB,
    tool_output JSONB,
    execution_time_ms INTEGER,
    success BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily usage aggregates for analytics
CREATE TABLE agent_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,4) NOT NULL DEFAULT 0,
    avg_response_time_ms INTEGER NOT NULL DEFAULT 0,
    crisis_sessions INTEGER NOT NULL DEFAULT 0,
    successful_sessions INTEGER NOT NULL DEFAULT 0,
    strategies_provided INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_agent_performance_session_id ON agent_performance(session_id);
CREATE INDEX idx_agent_performance_user_id ON agent_performance(user_id);
CREATE INDEX idx_agent_performance_created_at ON agent_performance(created_at);
CREATE INDEX idx_agent_errors_created_at ON agent_errors(created_at);
CREATE INDEX idx_agent_errors_agent_type ON agent_errors(agent_type);
CREATE INDEX idx_agent_tool_usage_tool_name ON agent_tool_usage(tool_name);
CREATE INDEX idx_agent_tool_usage_session_id ON agent_tool_usage(session_id);
CREATE INDEX idx_agent_daily_stats_date ON agent_daily_stats(date);
CREATE INDEX idx_agent_daily_stats_user_id ON agent_daily_stats(user_id);

-- RLS policies
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance data" ON agent_performance
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own error logs" ON agent_errors
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own tool usage" ON agent_tool_usage
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own daily stats" ON agent_daily_stats
    FOR ALL USING (user_id = auth.uid());

-- Update trigger for daily stats
CREATE TRIGGER update_agent_daily_stats_updated_at BEFORE UPDATE ON agent_daily_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();