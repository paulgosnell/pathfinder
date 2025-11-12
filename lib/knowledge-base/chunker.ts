import { encoding_for_model } from 'tiktoken';

// Initialize tokenizer lazily to avoid initialization overhead
let tokenizer: ReturnType<typeof encoding_for_model> | null = null;

function getTokenizer() {
  if (!tokenizer) {
    tokenizer = encoding_for_model('gpt-4o');
  }
  return tokenizer;
}

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
        const chunkText = currentChunk.join('\n\n');
        chunks.push(createChunk(chunkText, chunkIndex++, charPosition - chunkText.length));
        currentChunk = [];
        currentTokenCount = 0;
      }

      // Split large paragraph by sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        const sentenceTokens = countTokens(sentence);

        if (currentTokenCount + sentenceTokens > maxChunkSize && currentChunk.length > 0) {
          const chunkText = currentChunk.join(' ');
          chunks.push(createChunk(chunkText, chunkIndex++, charPosition - chunkText.length));

          // Add overlap from previous chunk
          const overlapText = getLastNTokens(chunkText, overlapSize);
          currentChunk = [overlapText];
          currentTokenCount = countTokens(overlapText);
        }

        currentChunk.push(sentence);
        currentTokenCount += sentenceTokens;
      }
    } else {
      // Normal paragraph handling
      if (currentTokenCount + paragraphTokens > maxChunkSize && currentChunk.length > 0) {
        const chunkText = currentChunk.join('\n\n');
        chunks.push(createChunk(chunkText, chunkIndex++, charPosition - chunkText.length));

        // Add overlap
        const overlapText = getLastNTokens(chunkText, overlapSize);
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
    const chunkText = currentChunk.join('\n\n');
    chunks.push(createChunk(chunkText, chunkIndex++, charPosition - chunkText.length));
  }

  return chunks;
}

function countTokens(text: string): number {
  return getTokenizer().encode(text).length;
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
  const tokens = getTokenizer().encode(text);
  const lastTokens = tokens.slice(-n);
  return new TextDecoder().decode(getTokenizer().decode(lastTokens));
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
