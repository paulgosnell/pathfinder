import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for security headers and rate limiting
 * Runs on all requests before they reach your pages/API routes
 */

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute
const MAX_REQUESTS_PER_WINDOW_API = 20; // 20 API calls per minute

/**
 * Rate limiting function
 */
function rateLimit(ip: string, limit: number): { limited: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  // Reset if window expired
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { limited: false, remaining: limit - 1 };
  }

  // Increment count
  userLimit.count++;

  // Check if limit exceeded
  if (userLimit.count > limit) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: limit - userLimit.count };
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of Array.from(rateLimitMap.entries())) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Apply stricter rate limiting to API routes
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const limit = isApiRoute ? MAX_REQUESTS_PER_WINDOW_API : MAX_REQUESTS_PER_WINDOW;

  // Check rate limit
  const { limited, remaining } = rateLimit(ip, limit);

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());

  // If rate limited, return 429
  if (limited) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Please slow down and try again in a moment.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // Security Headers
  const securityHeaders = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable browser XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy (disable unnecessary features)
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
    
    // Content Security Policy (adjusted for voice mode with ElevenLabs & LiveKit)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:", // blob: and data: needed for AudioWorklet
      "worker-src 'self' blob:", // AudioWorklet support
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.elevenlabs.io https://*.elevenlabs.io wss://*.elevenlabs.io wss://*.livekit.cloud https://*.livekit.cloud",
      "media-src 'self' blob: https://*.elevenlabs.io",
    ].join('; '),
    
    // HSTS (Strict-Transport-Security) - only in production with HTTPS
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    }),
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

