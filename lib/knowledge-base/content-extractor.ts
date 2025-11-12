import * as pdf from 'pdf-parse';
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

  const text = transcript.map((item: any) => item.text).join(' ');

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
