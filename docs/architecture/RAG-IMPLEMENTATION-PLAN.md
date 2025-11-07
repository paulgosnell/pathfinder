# RAG Knowledge Base Implementation Plan

**Project**: Pathfinder ADHD Parent Coaching Agent
**Feature**: AI-Powered Knowledge Management System
**Created**: 2025-11-07
**Status**: Planning Phase

---

## 📋 Executive Summary

This document outlines the implementation plan for adding a Retrieval Augmented Generation (RAG) system to Pathfinder, allowing admins to upload and manage ADHD research content that the AI agent can reference during coaching sessions.

**Key Innovation**: AI-powered quality filtering automatically evaluates uploaded content, only keeping valuable, evidence-based guidance while discarding generic or potentially harmful advice.

---

## 🎯 Current State Analysis

### What You Have
- ✅ Admin dashboard at `/admin` with authentication (AdminProtectedRoute)
- ✅ Admin auth system with `admins` table and audit logging
- ✅ Supabase database with Postgres 17 (supports pgvector extension)
- ✅ Multiple tabs in admin UI (Overview, Analytics, Monitor, Sessions, Users, Waitlist, Feedback)
- ✅ OpenAI integration via AI SDK v5
- ✅ Service role keys for backend processing

### What's Missing
- ❌ pgvector extension not enabled
- ❌ No knowledge base tables
- ❌ No content upload/management system
- ❌ No embedding generation pipeline
- ❌ No semantic search integration

---

## 🏗️ System Architecture

### High-Level Flow

```
Admin uploads content → AI quality filter → Chunking → Embedding → Storage
                              ↓
                         (Auto-approve high quality)
                              ↓
                         (Flag medium quality for review)
                              ↓
                         (Auto-reject low quality)

Runtime:
User message → Embed query → Vector search → Top 3-5 KB chunks → Add to context → Send to Claude
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN UPLOADS CONTENT                    │
│  (PDFs, Markdown, URLs, YouTube transcripts)                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   CONTENT EXTRACTION                         │
│  • PDF → Text (pdf-parse)                                   │
│  • URL → Scraped content                                    │
│  • YouTube → Transcript via API                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   SEMANTIC CHUNKING                          │
│  • Split on paragraphs/sections (not arbitrary chars)       │
│  • 500-1000 tokens per chunk (optimal: 750)                 │
│  • Keep related content together                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              AI QUALITY FILTER (CRITICAL STEP)               │
│  GPT-4o evaluates each chunk:                               │
│  • Clinical accuracy?                                        │
│  • Evidence-based?                                           │
│  • Specific & actionable?                                    │
│  • Empowering (not blaming)?                                 │
│                                                              │
│  Output:                                                     │
│  • shouldInclude: boolean                                    │
│  • confidenceScore: 0-1                                      │
│  • reasoning: string                                         │
│  • recommendedTags: string[]                                 │
│  • ageRelevance: string[]                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
            ┌────────┴────────┐
            ↓                 ↓
     High confidence     Medium confidence     Low confidence
     (auto-approve)     (flag for review)     (auto-reject)
            ↓                 ↓                      ↓
     ┌─────────────┐   ┌─────────────┐       [Discarded]
     │  Generate   │   │   Admin     │
     │  Embedding  │   │   Reviews   │
     └──────┬──────┘   └──────┬──────┘
            │                 │
            │ ←───────────────┘
            ↓
┌─────────────────────────────────────────────────────────────┐
│                STORE IN KNOWLEDGE BASE                       │
│  • chunk_text                                               │
│  • embedding (vector)                                       │
│  • metadata (tags, age relevance, etc.)                     │
└────────────────────┬────────────────────────────────────────┘
                     ↓
              [Ready for agent use]
```

---

## 📊 Database Schema

### Phase 1: Database Foundation (2-3 hours)

#### 1.1 Enable pgvector Extension

```sql
-- Enable pgvector for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 1.2 Source Documents Table

Tracks original uploaded files and processing status.

```sql
CREATE TABLE source_documents (
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
  uploaded_by UUID REFERENCES admins(id) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_source_docs_status ON source_documents(processing_status);
CREATE INDEX idx_source_docs_uploaded_by ON source_documents(uploaded_by);
CREATE INDEX idx_source_docs_tags ON source_documents USING GIN (tags);
```

#### 1.3 Knowledge Base Table

Stores processed content chunks with vector embeddings.

```sql
CREATE TABLE knowledge_base (
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
  reviewed_by UUID REFERENCES admins(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (IVFFlat for fast approximate search)
CREATE INDEX idx_kb_embedding ON knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Standard indexes for filtering
CREATE INDEX idx_kb_topic_tags ON knowledge_base USING GIN (topic_tags);
CREATE INDEX idx_kb_age_relevance ON knowledge_base USING GIN (age_relevance);
CREATE INDEX idx_kb_quality_status ON knowledge_base(quality_status);
CREATE INDEX idx_kb_source_document ON knowledge_base(source_document_id);
CREATE INDEX idx_kb_confidence_score ON knowledge_base(confidence_score);
```

#### 1.4 Row Level Security

```sql
-- RLS Policies
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;

-- Admin-only access
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
```

#### 1.5 Helper Functions

```sql
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
```

---

## 🤖 AI Processing Pipeline

### Phase 2: Content Processing Services (3-4 hours)

#### 2.1 Content Extraction Service

**File**: `lib/knowledge-base/content-extractor.ts`

```typescript
import pdf from 'pdf-parse';
import { JSDOM } from 'jsdom';

export type FileType = 'pdf' | 'md' | 'txt' | 'url' | 'youtube';

export interface ExtractionResult {
  text: string;
  metadata: {
    pageCount?: number;
    author?: string;
    title?: string;
    wordCount: number;
  };
}

/**
 * Extract text content from various file types
 */
export async function extractContent(
  file: File | string,
  fileType: FileType
): Promise<ExtractionResult> {
  switch (fileType) {
    case 'pdf':
      return extractFromPDF(file as File);
    case 'md':
    case 'txt':
      return extractFromText(file as File);
    case 'url':
      return extractFromURL(file as string);
    case 'youtube':
      return extractFromYouTube(file as string);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractFromPDF(file: File): Promise<ExtractionResult> {
  const buffer = await file.arrayBuffer();
  const data = await pdf(Buffer.from(buffer));

  return {
    text: data.text,
    metadata: {
      pageCount: data.numpages,
      author: data.info?.Author,
      title: data.info?.Title,
      wordCount: data.text.split(/\s+/).length
    }
  };
}

async function extractFromText(file: File): Promise<ExtractionResult> {
  const text = await file.text();
  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).length
    }
  };
}

async function extractFromURL(url: string): Promise<ExtractionResult> {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Remove script and style elements
  const scripts = document.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());

  // Extract text from body
  const text = document.body.textContent || '';
  const title = document.querySelector('title')?.textContent || '';

  return {
    text: text.replace(/\s+/g, ' ').trim(),
    metadata: {
      title,
      wordCount: text.split(/\s+/).length
    }
  };
}

async function extractFromYouTube(videoUrl: string): Promise<ExtractionResult> {
  // Extract video ID from URL
  const videoId = extractYouTubeVideoId(videoUrl);

  // Fetch transcript using youtube-transcript package
  const { YoutubeTranscript } = await import('youtube-transcript');
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);

  const text = transcript.map(item => item.text).join(' ');

  return {
    text,
    metadata: {
      title: `YouTube Video: ${videoId}`,
      wordCount: text.split(/\s+/).length
    }
  };
}

function extractYouTubeVideoId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid YouTube URL');
  return match[1];
}
```

#### 2.2 AI Quality Filter Service

**File**: `lib/knowledge-base/quality-filter.ts`

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const qualityCheckSchema = z.object({
  shouldInclude: z.boolean(),
  confidenceScore: z.number().min(0).max(1),
  reasoning: z.string(),
  qualityIssues: z.array(z.string()),
  valuableInsights: z.array(z.string()),
  contradictions: z.array(z.object({
    topic: z.string(),
    conflictsWith: z.string()
  })),
  recommendedTags: z.array(z.string()),
  ageRelevance: z.array(z.enum(['toddler', 'primary', 'secondary', 'teen', 'all'])),
  diagnosisRelevance: z.array(z.enum(['ADHD', 'ASD', 'both', 'general'])),
  contentType: z.enum(['research', 'clinical_guidance', 'practical_tips', 'case_study', 'general'])
});

export type QualityCheckResult = z.infer<typeof qualityCheckSchema>;

/**
 * CRITICAL: AI evaluates content quality before adding to knowledge base
 *
 * This prevents dilution of high-quality guidance with generic advice
 */
export async function evaluateContentQuality(
  text: string,
  sourceContext?: string
): Promise<QualityCheckResult> {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: qualityCheckSchema,
    prompt: `You are a clinical expert evaluating content for an ADHD parent coaching system.

# Your Mission
Determine if this content should be included in a knowledge base used to guide parents of children with ADHD.

# Evaluation Criteria

## INCLUDE content that:
✅ Provides specific, actionable strategies
✅ Is backed by research or expert clinical experience
✅ Addresses real ADHD-specific challenges (not generic parenting)
✅ Offers empowering, strength-based perspectives
✅ Acknowledges ADHD as a neurological difference (not a character flaw)
✅ Provides practical implementation steps
✅ Considers different ages and developmental stages

## EXCLUDE content that:
❌ Gives generic "try harder" or "just be consistent" advice without ADHD-specific adaptations
❌ Contradicts established ADHD research
❌ Promotes harmful practices (withholding food, excessive punishment, etc.)
❌ Blames parents or children for ADHD behaviors
❌ Is vague or unhelpful ("communicate better", "be patient")
❌ Would dilute high-quality guidance
❌ Lacks specificity or actionable steps

# Confidence Scoring
- **0.9-1.0**: Excellent research-backed, specific guidance
- **0.7-0.89**: Good practical advice, some ADHD specificity
- **0.5-0.69**: Acceptable but generic, flag for review
- **0.3-0.49**: Questionable quality, likely exclude
- **0.0-0.29**: Poor quality, definitely exclude

# Content to Evaluate
${sourceContext ? `Source: ${sourceContext}\n\n` : ''}${text}

Provide structured assessment with reasoning.`
  });

  return object;
}

/**
 * Batch evaluate multiple chunks efficiently
 */
export async function batchEvaluateQuality(
  chunks: Array<{ text: string; index: number }>,
  sourceContext?: string
): Promise<Array<QualityCheckResult & { chunkIndex: number }>> {
  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  const results: Array<QualityCheckResult & { chunkIndex: number }> = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async chunk => {
        const result = await evaluateContentQuality(chunk.text, sourceContext);
        return { ...result, chunkIndex: chunk.index };
      })
    );
    results.push(...batchResults);
  }

  return results;
}
```

#### 2.3 Semantic Chunking Service

**File**: `lib/knowledge-base/chunker.ts`

```typescript
import { encoding_for_model } from 'tiktoken';

const tokenizer = encoding_for_model('gpt-4o');

export interface Chunk {
  text: string;
  index: number;
  tokenCount: number;
  startChar: number;
  endChar: number;
}

/**
 * Smart semantic chunking - splits on natural boundaries, not arbitrary character counts
 */
export function chunkDocument(
  text: string,
  maxChunkSize: number = 750, // tokens
  minChunkSize: number = 200,  // tokens
  overlapSize: number = 50     // tokens
): Chunk[] {
  const chunks: Chunk[] = [];

  // Split on semantic boundaries (double newlines = paragraph breaks)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  let currentChunk: string[] = [];
  let currentTokenCount = 0;
  let chunkIndex = 0;
  let charPosition = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = countTokens(paragraph);

    // If single paragraph exceeds max size, split it further
    if (paragraphTokens > maxChunkSize) {
      // Save current chunk if exists
      if (currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk.join('\n\n'), chunkIndex++, charPosition));
        currentChunk = [];
        currentTokenCount = 0;
      }

      // Split large paragraph by sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        const sentenceTokens = countTokens(sentence);

        if (currentTokenCount + sentenceTokens > maxChunkSize && currentChunk.length > 0) {
          chunks.push(createChunk(currentChunk.join(' '), chunkIndex++, charPosition));

          // Add overlap from previous chunk
          const overlapText = getLastNTokens(currentChunk.join(' '), overlapSize);
          currentChunk = [overlapText];
          currentTokenCount = countTokens(overlapText);
        }

        currentChunk.push(sentence);
        currentTokenCount += sentenceTokens;
      }
    } else {
      // Normal paragraph handling
      if (currentTokenCount + paragraphTokens > maxChunkSize && currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk.join('\n\n'), chunkIndex++, charPosition));

        // Add overlap
        const overlapText = getLastNTokens(currentChunk.join('\n\n'), overlapSize);
        currentChunk = [overlapText];
        currentTokenCount = countTokens(overlapText);
      }

      currentChunk.push(paragraph);
      currentTokenCount += paragraphTokens;
    }

    charPosition += paragraph.length + 2; // +2 for \n\n
  }

  // Add final chunk if exists and meets minimum size
  if (currentChunk.length > 0 && currentTokenCount >= minChunkSize) {
    chunks.push(createChunk(currentChunk.join('\n\n'), chunkIndex++, charPosition));
  }

  return chunks;
}

function countTokens(text: string): number {
  return tokenizer.encode(text).length;
}

function createChunk(text: string, index: number, startChar: number): Chunk {
  return {
    text: text.trim(),
    index,
    tokenCount: countTokens(text),
    startChar,
    endChar: startChar + text.length
  };
}

function getLastNTokens(text: string, n: number): string {
  const tokens = tokenizer.encode(text);
  const lastTokens = tokens.slice(-n);
  return new TextDecoder().decode(tokenizer.decode(lastTokens));
}

/**
 * Preview chunking results before processing
 */
export function previewChunks(text: string, maxChunkSize: number = 750): {
  totalChunks: number;
  avgTokensPerChunk: number;
  chunks: Array<{ preview: string; tokens: number }>;
} {
  const chunks = chunkDocument(text, maxChunkSize);

  return {
    totalChunks: chunks.length,
    avgTokensPerChunk: Math.round(
      chunks.reduce((sum, c) => sum + c.tokenCount, 0) / chunks.length
    ),
    chunks: chunks.map(c => ({
      preview: c.text.substring(0, 200) + (c.text.length > 200 ? '...' : ''),
      tokens: c.tokenCount
    }))
  };
}
```

#### 2.4 Embedding Generation Service

**File**: `lib/knowledge-base/embeddings.ts`

```typescript
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const EMBEDDING_MODEL = 'text-embedding-3-small'; // 1536 dimensions
const BATCH_SIZE = 100; // OpenAI supports up to 2048, but we'll be conservative

/**
 * Generate embedding for a single text chunk
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: text
  });

  return embedding;
}

/**
 * Generate embeddings for multiple chunks in batches
 * More efficient than one-at-a-time
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  // Process in batches to respect rate limits
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const { embeddings } = await embedMany({
      model: openai.embedding(EMBEDDING_MODEL),
      values: batch
    });

    allEmbeddings.push(...embeddings);

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allEmbeddings;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar chunks to a query (useful for testing)
 */
export async function findSimilarChunks(
  queryText: string,
  candidateTexts: string[],
  topK: number = 5
): Promise<Array<{ text: string; similarity: number; index: number }>> {
  const queryEmbedding = await generateEmbedding(queryText);
  const candidateEmbeddings = await generateBatchEmbeddings(candidateTexts);

  const similarities = candidateEmbeddings.map((embedding, index) => ({
    text: candidateTexts[index],
    similarity: cosineSimilarity(queryEmbedding, embedding),
    index
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
```

#### 2.5 Contradiction Detection Service

**File**: `lib/knowledge-base/contradiction-detector.ts`

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const contradictionSchema = z.object({
  hasContradiction: z.boolean(),
  contradictions: z.array(z.object({
    topic: z.string(),
    newChunkAdvice: z.string(),
    existingChunkAdvice: z.string(),
    severity: z.enum(['minor', 'moderate', 'major']),
    explanation: z.string(),
    recommendation: z.string()
  }))
});

export type ContradictionResult = z.infer<typeof contradictionSchema>;

/**
 * Detect contradictions between new content and existing knowledge base
 */
export async function detectContradictions(
  newChunkText: string,
  similarExistingChunks: Array<{ text: string; source: string }>
): Promise<ContradictionResult> {
  if (similarExistingChunks.length === 0) {
    return {
      hasContradiction: false,
      contradictions: []
    };
  }

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: contradictionSchema,
    prompt: `You are a clinical expert reviewing ADHD guidance for contradictions.

# Task
Compare new content against existing knowledge base chunks to identify conflicting advice.

# New Content
${newChunkText}

# Existing Knowledge Base
${similarExistingChunks.map((chunk, i) => `
[Chunk ${i + 1}] Source: ${chunk.source}
${chunk.text}
`).join('\n\n')}

# Analysis Instructions
Look for contradictions in:
- Treatment approaches
- Strategy recommendations
- Clinical guidance
- Safety considerations

Severity levels:
- **Minor**: Different approaches that are both valid
- **Moderate**: Conflicting advice that could confuse parents
- **Major**: Contradictory guidance on safety or clinical issues

For each contradiction, recommend:
- Keep new (if it's more current/accurate)
- Keep existing (if new is outdated/incorrect)
- Flag for expert review (if both have merit)
- Synthesize both perspectives

Identify any contradictions and explain them clearly.`
  });

  return object;
}

/**
 * Find chunks in KB that might contradict new content
 * Uses semantic search to find topically similar content
 */
export async function findPotentialContradictions(
  supabase: any,
  newChunkEmbedding: number[],
  topicTags: string[]
): Promise<Array<{ id: string; text: string; source: string; similarity: number }>> {
  const { data, error } = await supabase.rpc('search_knowledge_base', {
    query_embedding: newChunkEmbedding,
    match_threshold: 0.7, // Lower threshold to catch potential contradictions
    match_count: 10,
    filter_tags: topicTags
  });

  if (error) {
    console.error('Error searching for contradictions:', error);
    return [];
  }

  return data || [];
}
```

---

## 🖥️ Admin UI Components

### Phase 3: Admin Upload Interface (2-3 hours)

#### 3.1 Update Admin Dashboard

**File**: `app/admin/page.tsx` (modifications)

Add 'knowledge' to tabs array:

```typescript
const tabs: TabType[] = [
  'overview',
  'analytics',
  'monitor',
  'sessions',
  'users',
  'waitlist',
  'feedback',
  'knowledge' // NEW
];

// In render:
{activeTab === 'knowledge' && <KnowledgeTab />}
```

#### 3.2 Knowledge Base Management Component

**File**: `app/admin/page.tsx` (add component)

```typescript
function KnowledgeTab() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [processingDocs, setProcessingDocs] = useState<any[]>([]);
  const [flaggedChunks, setFlaggedChunks] = useState<any[]>([]);
  const [knowledgeBaseChunks, setKnowledgeBaseChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  useEffect(() => {
    fetchKnowledgeBaseData();
  }, []);

  async function fetchKnowledgeBaseData() {
    const [docsRes, flaggedRes, chunksRes] = await Promise.all([
      fetch('/api/admin/knowledge-base/documents'),
      fetch('/api/admin/knowledge-base/flagged'),
      fetch('/api/admin/knowledge-base/chunks')
    ]);

    setDocuments(await docsRes.json());
    setFlaggedChunks(await flaggedRes.json());
    setKnowledgeBaseChunks(await chunksRes.json());
    setLoading(false);
  }

  async function handleFileUpload(files: FileList) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    const response = await fetch('/api/admin/knowledge-base/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      await fetchKnowledgeBaseData();
    }
  }

  async function handleURLSubmit(url: string) {
    const response = await fetch('/api/admin/knowledge-base/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (response.ok) {
      await fetchKnowledgeBaseData();
    }
  }

  async function handleApproveChunk(chunkId: string) {
    await fetch(`/api/admin/knowledge-base/chunks/${chunkId}/approve`, {
      method: 'POST'
    });
    await fetchKnowledgeBaseData();
  }

  async function handleRejectChunk(chunkId: string, reason: string) {
    await fetch(`/api/admin/knowledge-base/chunks/${chunkId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    await fetchKnowledgeBaseData();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard
          label="Total Documents"
          value={documents.length}
          sublabel="Uploaded"
          icon={<FileText size={32} />}
          color="#B7D3D8"
        />
        <MetricCard
          label="Knowledge Chunks"
          value={knowledgeBaseChunks.length}
          sublabel="Approved & Ready"
          icon={<Database size={32} />}
          color="#D7CDEC"
        />
        <MetricCard
          label="Needs Review"
          value={flaggedChunks.length}
          sublabel="Flagged Content"
          icon={<AlertCircle size={32} />}
          color="#E6A897"
        />
        <MetricCard
          label="Processing"
          value={processingDocs.length}
          sublabel="In Queue"
          icon={<RefreshCw size={32} />}
          color="#E3EADD"
        />
      </div>

      {/* Upload Section */}
      <Card title="Upload Content">
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={() => setUploadMode('file')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: uploadMode === 'file' ? 'linear-gradient(135deg, #D7CDEC, #B7D3D8)' : '#E3EADD',
                color: uploadMode === 'file' ? 'white' : '#586C8E',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Upload Files
            </button>
            <button
              onClick={() => setUploadMode('url')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: uploadMode === 'url' ? 'linear-gradient(135deg, #D7CDEC, #B7D3D8)' : '#E3EADD',
                color: uploadMode === 'url' ? 'white' : '#586C8E',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add URL
            </button>
          </div>

          {uploadMode === 'file' ? (
            <FileUploadZone onUpload={handleFileUpload} />
          ) : (
            <URLInputForm onSubmit={handleURLSubmit} />
          )}
        </div>
      </Card>

      {/* Processing Queue */}
      {processingDocs.length > 0 && (
        <Card title="Processing Queue">
          <ProcessingQueue documents={processingDocs} />
        </Card>
      )}

      {/* Review Queue */}
      {flaggedChunks.length > 0 && (
        <Card title="Needs Review - Medium Confidence Content">
          <p style={{ color: '#586C8E', fontSize: '14px', marginBottom: '16px' }}>
            These chunks scored 0.5-0.7 confidence. Review and approve/reject manually.
          </p>
          <ReviewQueue
            chunks={flaggedChunks}
            onApprove={handleApproveChunk}
            onReject={handleRejectChunk}
          />
        </Card>
      )}

      {/* Source Documents Table */}
      <Card title="Source Documents">
        <SourceDocumentsTable documents={documents} onRefresh={fetchKnowledgeBaseData} />
      </Card>

      {/* Knowledge Base Browser */}
      <Card title="Knowledge Base - Approved Chunks">
        <KnowledgeBaseBrowser chunks={knowledgeBaseChunks} />
      </Card>
    </div>
  );
}

// Helper Components
function FileUploadZone({ onUpload }: { onUpload: (files: FileList) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        border: '2px dashed #D7CDEC',
        borderRadius: '10px',
        padding: '48px',
        textAlign: 'center',
        cursor: 'pointer',
        background: 'rgba(215, 205, 236, 0.05)',
        transition: 'all 0.2s'
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
          onUpload(e.dataTransfer.files);
        }
      }}
    >
      <Upload size={48} style={{ color: '#D7CDEC', marginBottom: '16px' }} />
      <p style={{ color: '#2A3F5A', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
        Drop files here or click to upload
      </p>
      <p style={{ color: '#586C8E', fontSize: '14px' }}>
        Supports: PDF, Markdown, Text files
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.md,.txt"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
    </div>
  );
}

function URLInputForm({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState('');

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/article or https://youtube.com/watch?v=..."
        style={{
          flex: 1,
          padding: '12px 16px',
          border: '1px solid rgba(215, 205, 236, 0.3)',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      />
      <button
        onClick={() => {
          onSubmit(url);
          setUrl('');
        }}
        disabled={!url}
        style={{
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
          color: 'white',
          fontWeight: '600',
          cursor: url ? 'pointer' : 'not-allowed',
          opacity: url ? 1 : 0.5
        }}
      >
        Add URL
      </button>
    </div>
  );
}
```

---

## 🔌 API Endpoints

### Phase 4: Backend Services (2-3 hours)

#### 4.1 Upload Endpoint

**File**: `app/api/admin/knowledge-base/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // 3. Process each file
    const uploadedDocuments = [];

    for (const file of files) {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('knowledge-base-uploads')
        .upload(fileName, file);

      if (storageError) {
        console.error('Storage error:', storageError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('knowledge-base-uploads')
        .getPublicUrl(fileName);

      // Create source_documents record
      const { data: docData, error: dbError } = await supabase
        .from('source_documents')
        .insert({
          title: file.name,
          file_name: fileName,
          file_type: getFileType(file.name),
          file_size_bytes: file.size,
          file_url: urlData.publicUrl,
          processing_status: 'pending',
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        continue;
      }

      uploadedDocuments.push(docData);

      // 4. Trigger background processing
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/knowledge-base/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.id })
      });
    }

    return NextResponse.json({
      success: true,
      documents: uploadedDocuments
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'pdf';
    case 'md': return 'md';
    case 'txt': return 'txt';
    default: return 'unknown';
  }
}
```

#### 4.2 Processing Worker

**File**: `app/api/admin/knowledge-base/process/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { extractContent } from '@/lib/knowledge-base/content-extractor';
import { chunkDocument } from '@/lib/knowledge-base/chunker';
import { batchEvaluateQuality } from '@/lib/knowledge-base/quality-filter';
import { generateBatchEmbeddings } from '@/lib/knowledge-base/embeddings';
import { detectContradictions, findPotentialContradictions } from '@/lib/knowledge-base/contradiction-detector';

export const maxDuration = 300; // 5 minutes for long documents

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    const supabase = createServerClient();

    // 1. Get document record
    const { data: doc, error: docError } = await supabase
      .from('source_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // 2. Update status to processing
    await supabase
      .from('source_documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    try {
      // 3. Download and extract content
      const fileResponse = await fetch(doc.file_url);
      const fileBlob = await fileResponse.blob();
      const file = new File([fileBlob], doc.file_name);

      const { text, metadata } = await extractContent(file, doc.file_type);

      // 4. Chunk the document
      const chunks = chunkDocument(text);

      // 5. AI quality evaluation (batch process)
      const qualityResults = await batchEvaluateQuality(
        chunks.map((c, i) => ({ text: c.text, index: i })),
        `${doc.title} by ${doc.author || 'Unknown'}`
      );

      // 6. Process approved chunks
      const approvedChunks = [];
      const flaggedChunks = [];
      let autoRejectedCount = 0;

      for (const result of qualityResults) {
        const chunk = chunks[result.chunkIndex];

        if (!result.shouldInclude || result.confidenceScore < 0.3) {
          // Auto-reject low quality
          autoRejectedCount++;
          continue;
        }

        if (result.confidenceScore >= 0.7) {
          // Auto-approve high quality
          approvedChunks.push({ chunk, result });
        } else {
          // Flag for manual review
          flaggedChunks.push({ chunk, result });
        }
      }

      // 7. Generate embeddings for approved chunks
      const approvedTexts = approvedChunks.map(c => c.chunk.text);
      const embeddings = approvedTexts.length > 0
        ? await generateBatchEmbeddings(approvedTexts)
        : [];

      // 8. Check for contradictions (for approved chunks only)
      const contradictionsDetected = [];
      for (let i = 0; i < approvedChunks.length; i++) {
        const { chunk, result } = approvedChunks[i];
        const embedding = embeddings[i];

        // Find similar existing chunks
        const similarChunks = await findPotentialContradictions(
          supabase,
          embedding,
          result.recommendedTags
        );

        if (similarChunks.length > 0) {
          const contradictionResult = await detectContradictions(
            chunk.text,
            similarChunks.map(sc => ({
              text: sc.text,
              source: sc.source
            }))
          );

          if (contradictionResult.hasContradiction) {
            contradictionsDetected.push(...contradictionResult.contradictions);
          }
        }
      }

      // 9. Insert approved chunks into knowledge base
      const chunksToInsert = approvedChunks.map((item, i) => ({
        chunk_text: item.chunk.text,
        embedding: embeddings[i],
        source_document_id: documentId,
        source_document_name: doc.title,
        source_url: doc.file_url,
        chunk_index: item.chunk.index,
        metadata: {
          tokenCount: item.chunk.tokenCount,
          startChar: item.chunk.startChar,
          endChar: item.chunk.endChar
        },
        topic_tags: item.result.recommendedTags,
        age_relevance: item.result.ageRelevance.filter(a => a !== 'all'),
        diagnosis_relevance: item.result.diagnosisRelevance,
        content_type: item.result.contentType,
        confidence_score: item.result.confidenceScore,
        quality_status: 'approved'
      }));

      if (chunksToInsert.length > 0) {
        await supabase.from('knowledge_base').insert(chunksToInsert);
      }

      // 10. Insert flagged chunks for review
      const flaggedToInsert = flaggedChunks.map(item => ({
        chunk_text: item.chunk.text,
        source_document_id: documentId,
        source_document_name: doc.title,
        source_url: doc.file_url,
        chunk_index: item.chunk.index,
        metadata: {
          tokenCount: item.chunk.tokenCount,
          reasoning: item.result.reasoning,
          qualityIssues: item.result.qualityIssues,
          valuableInsights: item.result.valuableInsights
        },
        topic_tags: item.result.recommendedTags,
        age_relevance: item.result.ageRelevance.filter(a => a !== 'all'),
        diagnosis_relevance: item.result.diagnosisRelevance,
        content_type: item.result.contentType,
        confidence_score: item.result.confidenceScore,
        quality_status: 'flagged'
      }));

      if (flaggedToInsert.length > 0) {
        await supabase.from('knowledge_base').insert(flaggedToInsert);
      }

      // 11. Update source document with results
      await supabase
        .from('source_documents')
        .update({
          processing_status: 'completed',
          chunks_generated: chunks.length,
          quality_check_status: contradictionsDetected.length > 0 ? 'needs_review' : 'passed',
          quality_check_summary: {
            totalChunks: chunks.length,
            autoApproved: approvedChunks.length,
            flaggedForReview: flaggedChunks.length,
            autoRejected: autoRejectedCount,
            avgConfidenceScore: (
              qualityResults.reduce((sum, r) => sum + r.confidenceScore, 0) /
              qualityResults.length
            ).toFixed(2)
          },
          contradictions_detected: contradictionsDetected,
          last_processed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      return NextResponse.json({
        success: true,
        summary: {
          totalChunks: chunks.length,
          autoApproved: approvedChunks.length,
          flaggedForReview: flaggedChunks.length,
          autoRejected: autoRejectedCount,
          contradictionsFound: contradictionsDetected.length
        }
      });

    } catch (processingError) {
      console.error('Processing error:', processingError);

      // Update document status to failed
      await supabase
        .from('source_documents')
        .update({
          processing_status: 'failed',
          processing_error: processingError.message
        })
        .eq('id', documentId);

      throw processingError;
    }

  } catch (error) {
    console.error('Process endpoint error:', error);
    return NextResponse.json(
      { error: 'Processing failed', details: error.message },
      { status: 500 }
    );
  }
}
```

#### 4.3 Semantic Search Endpoint

**File**: `app/api/knowledge-base/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/knowledge-base/embeddings';

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      filters = {},
      limit = 5,
      threshold = 0.75
    } = await request.json();

    // 1. Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search knowledge base
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_tags: filters.topic_tags || null,
      filter_age_relevance: filters.age_relevance || null
    });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({
      results: data,
      query,
      count: data.length
    });

  } catch (error) {
    console.error('Search endpoint error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

---

## 🤖 Agent Integration

### Phase 5: Automatic Context Injection (1-2 hours)

#### 5.1 Update Chat API Route

**File**: `app/api/chat/route.ts` (modifications)

Add RAG context retrieval before sending to agent:

```typescript
import { searchKnowledgeBase } from '@/lib/knowledge-base/search';

// In the POST handler, before calling the agent:
export async function POST(request: Request) {
  // ... existing code ...

  const userMessage = messages[messages.length - 1].content;

  // NEW: Retrieve relevant knowledge base chunks
  const relevantKnowledge = await searchKnowledgeBase(userMessage, {
    limit: 5,
    threshold: 0.75,
    filters: {
      age_relevance: session.child_age_range ? [session.child_age_range] : null
    }
  });

  // Build enhanced system prompt with KB context
  const enhancedSystemPrompt = buildSystemPromptWithKnowledge(
    baseSystemPrompt,
    relevantKnowledge
  );

  // ... continue with agent call using enhancedSystemPrompt ...
}

function buildSystemPromptWithKnowledge(
  basePrompt: string,
  knowledgeChunks: any[]
): string {
  if (knowledgeChunks.length === 0) {
    return basePrompt;
  }

  const knowledgeSection = `

# Research & Expert Guidance

The following evidence-based guidance is available to support your coaching:

${knowledgeChunks.map((chunk, i) => `
[Source ${i + 1}: ${chunk.source_document_name}]
${chunk.chunk_text}

Topics: ${chunk.topic_tags.join(', ')}
`).join('\n---\n')}

Use this guidance to inform your coaching, but remember:
- These are frameworks and strategies, not rigid rules
- Every child and family is unique
- Help the parent adapt these insights to their specific situation
- Don't just recite research - use it to deepen exploration
`;

  return basePrompt + knowledgeSection;
}
```

#### 5.2 Knowledge Base Search Helper

**File**: `lib/knowledge-base/search.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { generateEmbedding } from './embeddings';

export interface SearchFilters {
  topic_tags?: string[];
  age_relevance?: string[];
  diagnosis_relevance?: string[];
  content_type?: string;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  filters?: SearchFilters;
}

export interface KnowledgeChunk {
  id: string;
  chunk_text: string;
  source_document_name: string;
  source_url: string;
  topic_tags: string[];
  age_relevance: string[];
  similarity: number;
}

/**
 * Search knowledge base with semantic similarity
 */
export async function searchKnowledgeBase(
  query: string,
  options: SearchOptions = {}
): Promise<KnowledgeChunk[]> {
  const {
    limit = 5,
    threshold = 0.75,
    filters = {}
  } = options;

  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search via RPC function
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_tags: filters.topic_tags || null,
      filter_age_relevance: filters.age_relevance || null
    });

    if (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Knowledge base search failed:', error);
    return [];
  }
}

/**
 * Extract topics from user message for better filtering
 */
export function extractTopics(message: string): string[] {
  const topicKeywords = {
    eating: ['eat', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'snack'],
    sleep: ['sleep', 'bedtime', 'tired', 'nap', 'wake', 'insomnia'],
    school: ['school', 'teacher', 'homework', 'class', 'grade'],
    medication: ['medication', 'meds', 'pill', 'dose', 'prescription'],
    behavior: ['behavior', 'tantrum', 'meltdown', 'aggression', 'defiance'],
    social: ['friend', 'social', 'peer', 'play', 'relationship']
  };

  const lowerMessage = message.toLowerCase();
  const detectedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
}
```

---

## 📦 Dependencies to Install

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "jsdom": "^24.0.0",
    "youtube-transcript": "^1.0.6",
    "tiktoken": "^1.0.10"
  },
  "devDependencies": {
    "@types/pdf-parse": "^1.1.4",
    "@types/jsdom": "^21.1.6"
  }
}
```

Install:
```bash
npm install pdf-parse jsdom youtube-transcript tiktoken
npm install -D @types/pdf-parse @types/jsdom
```

---

## 💰 Cost Analysis

### One-Time Processing Costs

**Example: Processing 100 PDFs (~500 pages total)**

| Operation | Volume | Cost per Unit | Total Cost |
|-----------|--------|---------------|------------|
| Content extraction | 100 docs | Free | $0 |
| Chunking | 10,000 chunks | Free | $0 |
| AI quality filtering | 10,000 chunks | $0.01/chunk | $100 |
| Embedding generation | 5,000 approved chunks | $0.0001/1k tokens | $0.50 |
| Contradiction detection | 500 checks | $0.01/check | $5 |
| **Total** | | | **~$105.50** |

### Runtime Costs (Per 1000 User Messages)

| Operation | Volume | Cost per Unit | Total Cost |
|-----------|--------|---------------|------------|
| Query embedding | 1,000 queries | $0.0001/query | $0.10 |
| Vector search | 1,000 searches | Free (Postgres) | $0 |
| **Total** | | | **$0.10** |

**Effectively free at runtime** - embeddings are cached, search is database operation.

---

## ⏱️ Implementation Timeline

### Detailed Task Breakdown

| Phase | Task | Hours | Cumulative |
|-------|------|-------|------------|
| **Phase 1: Database** | | | |
| | Enable pgvector | 0.25 | 0.25 |
| | Create source_documents table | 0.5 | 0.75 |
| | Create knowledge_base table | 0.5 | 1.25 |
| | Create indexes & RLS policies | 0.5 | 1.75 |
| | Create search function | 0.5 | 2.25 |
| **Phase 2: AI Pipeline** | | | |
| | Content extractor (PDF, text) | 1.0 | 3.25 |
| | URL & YouTube extractors | 1.0 | 4.25 |
| | AI quality filter service | 1.5 | 5.75 |
| | Semantic chunking service | 1.0 | 6.75 |
| | Embedding generation | 0.5 | 7.25 |
| | Contradiction detector | 1.0 | 8.25 |
| **Phase 3: Admin UI** | | | |
| | Add Knowledge tab | 0.5 | 8.75 |
| | File upload component | 1.0 | 9.75 |
| | URL input component | 0.5 | 10.25 |
| | Processing queue display | 0.5 | 10.75 |
| | Review queue interface | 1.0 | 11.75 |
| | KB browser & filters | 1.0 | 12.75 |
| **Phase 4: API Endpoints** | | | |
| | Upload endpoint | 1.0 | 13.75 |
| | URL upload endpoint | 0.5 | 14.25 |
| | Processing worker | 2.0 | 16.25 |
| | Search endpoint | 0.5 | 16.75 |
| | Admin CRUD endpoints | 1.0 | 17.75 |
| **Phase 5: Integration** | | | |
| | Modify chat API route | 0.5 | 18.25 |
| | Add context injection | 0.5 | 18.75 |
| | Testing & debugging | 1.5 | 20.25 |
| | Documentation | 0.75 | 21.0 |

**Total Estimated Time: 18-24 hours** (with AI-assisted development)

---

## 🧪 Testing Strategy

### 1. Upload & Processing Tests

```typescript
// Test quality filter accuracy
const testChunks = [
  {
    text: "Break homework into 15-minute chunks using a visible timer.",
    expectedApproval: true,
    expectedConfidence: 0.8
  },
  {
    text: "Just try harder to focus and you'll do better.",
    expectedApproval: false,
    expectedConfidence: 0.2
  }
];
```

### 2. Search Relevance Tests

```typescript
// Test semantic search accuracy
const queries = [
  {
    query: "My child won't eat breakfast before school",
    expectedTopics: ['eating', 'morning-routine', 'school']
  },
  {
    query: "He melts down when homework time starts",
    expectedTopics: ['homework', 'emotional-regulation', 'transitions']
  }
];
```

### 3. Contradiction Detection Tests

```typescript
// Test contradiction detection
const scenarios = [
  {
    chunk1: "Always provide medication at the same time each day",
    chunk2: "Flexible medication timing is acceptable",
    expectContradiction: true
  }
];
```

---

## 📈 Success Metrics

### Quality Metrics
- **Auto-approval rate**: Target 60-70% (high quality)
- **Auto-rejection rate**: Target 20-30% (low quality)
- **Manual review rate**: Target 10-20% (medium quality)
- **Contradiction detection accuracy**: Target >85%

### Performance Metrics
- **Processing time**: <5 minutes per 50-page PDF
- **Search latency**: <500ms for semantic search
- **Embedding generation**: <100ms per chunk

### Usage Metrics
- **KB chunks in production**: Track growth over time
- **Search hit rate**: % of queries with relevant results
- **Admin review queue**: Keep <50 pending items

---

## 🚀 Deployment Checklist

### Before Launch
- [ ] Enable pgvector extension in production database
- [ ] Create Supabase Storage bucket: `knowledge-base-uploads`
- [ ] Set storage policies (admin-only upload)
- [ ] Run database migrations
- [ ] Test with sample PDFs
- [ ] Review flagged content workflow
- [ ] Verify contradiction detection
- [ ] Test agent integration end-to-end

### Production Configuration
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limits for upload endpoint
- [ ] Set up admin notifications for processing failures
- [ ] Document content upload guidelines for admins
- [ ] Create backup/restore procedures

---

## 🔮 Future Enhancements

### Phase 6: Advanced Features (Future)

1. **Source Citations**
   - Agent can cite specific sources: "According to Dr. Barkley's research..."
   - Users can click to view original content

2. **Content Versioning**
   - Track updates to knowledge base
   - Deprecate outdated guidance
   - Version control for chunks

3. **Multi-modal Support**
   - Extract images/diagrams from PDFs
   - Include visual aids in responses
   - Video timestamp referencing

4. **User Feedback Loop**
   - Parents rate helpfulness of advice
   - Track which KB chunks led to positive outcomes
   - Auto-prioritize high-performing content

5. **Smart Curation**
   - AI suggests content gaps
   - Automatic topic coverage analysis
   - Recommend new content to upload

6. **Collaborative Knowledge Base**
   - Multiple experts can review/approve
   - Discussion threads on flagged content
   - Contribution tracking

---

## 📚 References

- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [AI SDK - Embeddings](https://sdk.vercel.ai/docs/ai-sdk-core/embeddings)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

## 📝 Notes for Developer

### Key Design Decisions

1. **Why pgvector over Pinecone/Weaviate?**
   - Already using Supabase
   - No additional service to manage
   - Lower cost at our scale
   - RLS policies work seamlessly

2. **Why text-embedding-3-small?**
   - 1536 dimensions (good balance)
   - Cheaper than -large ($0.02 vs $0.13 per 1M tokens)
   - Sufficient accuracy for our use case
   - Faster processing

3. **Why AI quality filtering?**
   - Prevents knowledge base pollution
   - Saves admin review time
   - Maintains high quality automatically
   - Learns from contradiction detection

4. **Why automatic context injection vs tool call?**
   - Lower latency (no extra LLM round trip)
   - Simpler implementation
   - More reliable
   - Can add tool-based search later if needed

---

**Ready to start implementation?** Choose a phase to begin!
