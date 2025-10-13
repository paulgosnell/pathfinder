-- Migration: Add Custom Analytics System
-- Purpose: Track page visits, referrals, session times, and user engagement
-- Date: 2025-10-11
-- Features:
--   - Page visit tracking with full referral data
--   - Search engine keyword tracking (Google, Bing, etc.)
--   - LLM traffic detection (ChatGPT, Claude, Perplexity, etc.)
--   - Session duration and engagement metrics
--   - Geographic and device analytics
--   - Real-time monitoring capabilities

-- ============================================================
-- PART 1: Page Visits Tracking
-- ============================================================

CREATE TABLE page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Visit metadata
    path TEXT NOT NULL,                          -- URL path visited
    page_title TEXT,                             -- Page title

    -- User identification (may be null for anonymous)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,                    -- Browser session ID (fingerprint)
    visitor_id TEXT,                             -- Persistent visitor ID (cookie)

    -- Referral tracking
    referrer_url TEXT,                           -- Full referrer URL
    referrer_domain TEXT,                        -- Extracted domain
    referrer_type TEXT,                          -- 'search', 'social', 'direct', 'llm', 'referral'

    -- Search engine data
    search_engine TEXT,                          -- 'google', 'bing', 'duckduckgo', etc.
    search_query TEXT,                           -- Search keywords (if detectable)

    -- LLM traffic detection
    is_llm_traffic BOOLEAN DEFAULT FALSE,        -- Detected LLM user agent
    llm_source TEXT,                             -- 'chatgpt', 'claude', 'perplexity', 'gemini', etc.

    -- Campaign tracking (UTM parameters)
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,

    -- Browser & device info
    user_agent TEXT,
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    device_type TEXT,                            -- 'desktop', 'mobile', 'tablet'
    is_mobile BOOLEAN DEFAULT FALSE,

    -- Geographic data (can be enriched later)
    country_code TEXT,
    city TEXT,
    region TEXT,

    -- Engagement metrics
    time_on_page_seconds INTEGER,                -- How long they stayed
    scroll_depth_percent INTEGER,                -- How far they scrolled
    clicks_count INTEGER DEFAULT 0,              -- Clicks on page

    -- Performance
    page_load_time_ms INTEGER,

    -- Timestamps
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 2: Analytics Sessions (Website Sessions, not Agent)
-- ============================================================

CREATE TABLE analytics_sessions (
    id TEXT PRIMARY KEY,                         -- Session fingerprint

    -- User association
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    visitor_id TEXT,

    -- Session metadata
    first_visit_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    session_duration_seconds INTEGER DEFAULT 0,

    -- Entry point
    landing_page TEXT,
    landing_referrer TEXT,
    landing_referrer_type TEXT,

    -- Exit point
    exit_page TEXT,

    -- Engagement
    pages_viewed INTEGER DEFAULT 1,
    total_clicks INTEGER DEFAULT 0,
    total_scroll_depth INTEGER DEFAULT 0,

    -- Conversion tracking
    signed_up BOOLEAN DEFAULT FALSE,
    started_chat BOOLEAN DEFAULT FALSE,
    started_voice BOOLEAN DEFAULT FALSE,

    -- Device consistency
    device_type TEXT,
    is_mobile BOOLEAN,

    -- Traffic source
    source TEXT,
    medium TEXT,
    campaign TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 3: Aggregated Analytics (Daily Rollups)
-- ============================================================

CREATE TABLE daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,

    -- Traffic metrics
    total_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    new_visitors INTEGER DEFAULT 0,
    returning_visitors INTEGER DEFAULT 0,

    -- Page views
    total_page_views INTEGER DEFAULT 0,
    pages_per_session DECIMAL(10,2) DEFAULT 0,
    avg_session_duration_seconds INTEGER DEFAULT 0,
    bounce_rate_percent DECIMAL(5,2) DEFAULT 0,

    -- Conversions
    signups INTEGER DEFAULT 0,
    chat_sessions_started INTEGER DEFAULT 0,
    voice_sessions_started INTEGER DEFAULT 0,

    -- Traffic sources breakdown
    direct_traffic INTEGER DEFAULT 0,
    search_traffic INTEGER DEFAULT 0,
    social_traffic INTEGER DEFAULT 0,
    referral_traffic INTEGER DEFAULT 0,
    llm_traffic INTEGER DEFAULT 0,

    -- Top referrers (JSONB array)
    top_referrers JSONB DEFAULT '[]'::jsonb,
    top_search_queries JSONB DEFAULT '[]'::jsonb,
    top_pages JSONB DEFAULT '[]'::jsonb,

    -- Device breakdown
    desktop_visitors INTEGER DEFAULT 0,
    mobile_visitors INTEGER DEFAULT 0,
    tablet_visitors INTEGER DEFAULT 0,

    -- LLM traffic breakdown
    chatgpt_traffic INTEGER DEFAULT 0,
    claude_traffic INTEGER DEFAULT 0,
    perplexity_traffic INTEGER DEFAULT 0,
    other_llm_traffic INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 4: Indexes for Performance
-- ============================================================

-- Page visits indexes
CREATE INDEX idx_page_visits_user_id ON page_visits(user_id);
CREATE INDEX idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX idx_page_visits_visited_at ON page_visits(visited_at DESC);
CREATE INDEX idx_page_visits_path ON page_visits(path);
CREATE INDEX idx_page_visits_referrer_type ON page_visits(referrer_type);
CREATE INDEX idx_page_visits_is_llm ON page_visits(is_llm_traffic) WHERE is_llm_traffic = TRUE;
CREATE INDEX idx_page_visits_search_query ON page_visits(search_query) WHERE search_query IS NOT NULL;

-- Analytics sessions indexes
CREATE INDEX idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_visitor_id ON analytics_sessions(visitor_id);
CREATE INDEX idx_analytics_sessions_last_activity ON analytics_sessions(last_activity_at DESC);
CREATE INDEX idx_analytics_sessions_source ON analytics_sessions(source);

-- Daily analytics index
CREATE INDEX idx_daily_analytics_date ON daily_analytics(date DESC);

-- ============================================================
-- PART 5: Row Level Security (RLS)
-- ============================================================

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- Admin access to all analytics data
CREATE POLICY "Admins can view all analytics" ON page_visits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all sessions" ON analytics_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view daily analytics" ON daily_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Service role can insert/update (for tracking middleware)
CREATE POLICY "Service can manage page visits" ON page_visits
    FOR ALL USING (true);

CREATE POLICY "Service can manage sessions" ON analytics_sessions
    FOR ALL USING (true);

CREATE POLICY "Service can manage daily analytics" ON daily_analytics
    FOR ALL USING (true);

-- ============================================================
-- PART 6: Update Triggers
-- ============================================================

CREATE TRIGGER update_analytics_sessions_updated_at
    BEFORE UPDATE ON analytics_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_analytics_updated_at
    BEFORE UPDATE ON daily_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PART 7: Helper Functions
-- ============================================================

-- Function to classify referrer type
CREATE OR REPLACE FUNCTION classify_referrer_type(referrer TEXT)
RETURNS TEXT AS $$
BEGIN
    IF referrer IS NULL OR referrer = '' THEN
        RETURN 'direct';
    ELSIF referrer ILIKE '%google%' OR referrer ILIKE '%bing%' OR referrer ILIKE '%duckduckgo%' OR referrer ILIKE '%yahoo%' THEN
        RETURN 'search';
    ELSIF referrer ILIKE '%facebook%' OR referrer ILIKE '%twitter%' OR referrer ILIKE '%linkedin%' OR referrer ILIKE '%instagram%' THEN
        RETURN 'social';
    ELSIF referrer ILIKE '%chatgpt%' OR referrer ILIKE '%claude%' OR referrer ILIKE '%perplexity%' THEN
        RETURN 'llm';
    ELSE
        RETURN 'referral';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to detect LLM user agent
CREATE OR REPLACE FUNCTION detect_llm_source(user_agent TEXT)
RETURNS TEXT AS $$
BEGIN
    IF user_agent ILIKE '%ChatGPT%' OR user_agent ILIKE '%GPTBot%' THEN
        RETURN 'chatgpt';
    ELSIF user_agent ILIKE '%Claude%' OR user_agent ILIKE '%Anthropic%' THEN
        RETURN 'claude';
    ELSIF user_agent ILIKE '%Perplexity%' THEN
        RETURN 'perplexity';
    ELSIF user_agent ILIKE '%Gemini%' OR user_agent ILIKE '%Bard%' THEN
        RETURN 'gemini';
    ELSIF user_agent ILIKE '%bot%' OR user_agent ILIKE '%crawler%' THEN
        RETURN 'other_bot';
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================================

-- Uncomment to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%analytics%' OR table_name = 'page_visits';
-- SELECT COUNT(*) FROM page_visits;
-- SELECT COUNT(*) FROM analytics_sessions;
