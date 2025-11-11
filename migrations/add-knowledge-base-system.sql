-- Migration: Add Knowledge Base (RAG) System
-- Description: Adds tables and functions for AI-powered knowledge management
-- Created: 2025-11-11

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Source Documents Table
-- Tracks original uploaded files and processing status
CREATE TABLE IF NOT EXISTS source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document info
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, md, txt, url, youtube
  file_size_bytes INTEGER,
  file_url TEXT, -- Supabase Storage URL or external URL

  -- Processing status
  processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  chunks_generated INTEGER DEFAULT 0,

  -- Quality check results
  quality_check_status TEXT DEFAULT 'pending'
    CHECK (quality_check_status IN ('pending', 'passed', 'needs_review', 'rejected')),
  quality_check_summary JSONB, -- AI-generated analysis of content quality
  contradictions_detected JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  author TEXT,
  publication_date DATE,
  tags TEXT[] DEFAULT '{}',
  priority_level TEXT DEFAULT 'medium'
    CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),

  -- Audit trail
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for source_documents
CREATE INDEX IF NOT EXISTS idx_source_docs_status ON source_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_source_docs_uploaded_by ON source_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_source_docs_tags ON source_documents USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_source_docs_quality_status ON source_documents(quality_check_status);

-- Knowledge Base Table
-- Stores processed content chunks with vector embeddings
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension

  -- Source tracking
  source_document_id UUID REFERENCES source_documents(id) ON DELETE CASCADE,
  source_document_name TEXT NOT NULL,
  source_url TEXT,
  chunk_index INTEGER NOT NULL, -- Position in original document

  -- Metadata for filtering
  metadata JSONB DEFAULT '{}'::jsonb,
  topic_tags TEXT[] DEFAULT '{}', -- eating, sleep, school, medication, etc.
  age_relevance TEXT[], -- toddler, primary, secondary, teen
  diagnosis_relevance TEXT[], -- ADHD, ASD, both, general
  content_type TEXT, -- research, clinical_guidance, practical_tips, case_study

  -- Quality control
  confidence_score NUMERIC(3,2)
    CHECK (confidence_score >= 0 AND confidence_score <= 1),
  quality_status TEXT DEFAULT 'pending'
    CHECK (quality_status IN ('pending', 'approved', 'flagged', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (IVFFlat for fast approximate search)
-- Note: This index will be created after data is inserted (requires at least 100 rows)
-- For now, we'll use a basic index
CREATE INDEX IF NOT EXISTS idx_kb_embedding ON knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Standard indexes for filtering
CREATE INDEX IF NOT EXISTS idx_kb_topic_tags ON knowledge_base USING GIN (topic_tags);
CREATE INDEX IF NOT EXISTS idx_kb_age_relevance ON knowledge_base USING GIN (age_relevance);
CREATE INDEX IF NOT EXISTS idx_kb_quality_status ON knowledge_base(quality_status);
CREATE INDEX IF NOT EXISTS idx_kb_source_document ON knowledge_base(source_document_id);
CREATE INDEX IF NOT EXISTS idx_kb_confidence_score ON knowledge_base(confidence_score);

-- Row Level Security
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Admins can manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Admins can manage source documents" ON source_documents;
DROP POLICY IF EXISTS "Service role full access kb" ON knowledge_base;
DROP POLICY IF EXISTS "Service role full access docs" ON source_documents;

-- Admin-only access (check if user is in admins table)
CREATE POLICY "Admins can manage knowledge base" ON knowledge_base
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage source documents" ON source_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Service role bypass (for API endpoints)
CREATE POLICY "Service role full access kb" ON knowledge_base
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access docs" ON source_documents
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Function to search knowledge base by semantic similarity
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 5,
  filter_tags TEXT[] DEFAULT NULL,
  filter_age_relevance TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  source_document_name TEXT,
  source_url TEXT,
  topic_tags TEXT[],
  age_relevance TEXT[],
  content_type TEXT,
  confidence_score NUMERIC,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.chunk_text,
    kb.source_document_name,
    kb.source_url,
    kb.topic_tags,
    kb.age_relevance,
    kb.content_type,
    kb.confidence_score,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE
    kb.quality_status = 'approved'
    AND (filter_tags IS NULL OR kb.topic_tags && filter_tags)
    AND (filter_age_relevance IS NULL OR kb.age_relevance && filter_age_relevance)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_source_documents_updated_at ON source_documents;
CREATE TRIGGER update_source_documents_updated_at
  BEFORE UPDATE ON source_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for knowledge base uploads (via Supabase Storage API)
-- This needs to be done via Supabase dashboard or API:
-- Bucket name: knowledge-base-uploads
-- Public: false (admin-only access)

COMMENT ON TABLE source_documents IS 'Tracks uploaded documents and their processing status for the knowledge base system';
COMMENT ON TABLE knowledge_base IS 'Stores processed content chunks with vector embeddings for semantic search';
COMMENT ON FUNCTION search_knowledge_base IS 'Performs semantic similarity search on the knowledge base using vector embeddings';
