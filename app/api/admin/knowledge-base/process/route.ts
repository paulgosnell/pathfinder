import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractContent } from '@/lib/knowledge-base/content-extractor';
import { chunkDocument } from '@/lib/knowledge-base/chunker';
import { batchEvaluateQuality } from '@/lib/knowledge-base/quality-filter';
import { generateBatchEmbeddings } from '@/lib/knowledge-base/embeddings';
import { detectContradictions, findPotentialContradictions } from '@/lib/knowledge-base/contradiction-detector';

// Allow up to 5 minutes for processing large documents
export const maxDuration = 300;

// Create server-side client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    const supabase = getSupabaseAdmin();

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
      let file: File;
      let text: string;
      let metadata: any;

      if (doc.file_type === 'url' || doc.file_type === 'youtube') {
        // For URLs, pass the URL directly to extractor
        const result = await extractContent(doc.file_url, doc.file_type);
        text = result.text;
        metadata = result.metadata;
      } else {
        // For files, download from storage
        const fileResponse = await fetch(doc.file_url);
        const fileBlob = await fileResponse.blob();
        file = new File([fileBlob], doc.file_name);
        const result = await extractContent(file, doc.file_type);
        text = result.text;
        metadata = result.metadata;
      }

      // 4. Chunk the document
      const chunks = chunkDocument(text);

      // 5. AI quality evaluation (batch process)
      const qualityResults = await batchEvaluateQuality(
        chunks.map((c, i) => ({ text: c.text, index: i })),
        `${doc.title}${doc.author ? ` by ${doc.author}` : ''}`
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
        embedding: `[${embeddings[i].join(',')}]`, // Format as PostgreSQL array
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
        embedding: null, // Will generate embedding when approved
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

    } catch (processingError: any) {
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

  } catch (error: any) {
    console.error('Process endpoint error:', error);
    return NextResponse.json(
      { error: 'Processing failed', details: error.message },
      { status: 500 }
    );
  }
}
