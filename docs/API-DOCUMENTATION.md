# API Documentation

Complete API reference for the ADHD Support Agent system.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

Most endpoints are currently unauthenticated for ease of access. User authentication via NextAuth is optional.

---

## Chat API

### POST `/api/chat`

Main endpoint for conversing with the AI agent.

**Request Body:**
```json
{
  "message": "My child won't do homework",
  "context": {
    "userId": "uuid-optional",
    "sessionId": "uuid-optional"
  }
}
```

**Response:**
```json
{
  "message": "I understand homework time can be really challenging...",
  "strategies": [
    {
      "id": "homework-focus-1",
      "title": "Pomodoro Technique",
      "challenge": "homework-focus",
      "ageRange": ["9-12", "13-17"],
      "description": "...",
      "implementation": ["Step 1", "Step 2"],
      "timeframe": "1-2 weeks",
      "difficultyLevel": "easy",
      "evidenceLevel": "research-backed",
      "successIndicators": ["..."]
    }
  ],
  "sessionId": "uuid",
  "userId": "uuid"
}
```

**Response Codes:**
- `200` - Success
- `400` - Invalid request (missing message)
- `429` - Rate limit exceeded
- `500` - Server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help with morning routines",
    "context": {}
  }'
```

---

## Analytics API

### GET `/api/analytics`

Retrieve system analytics and performance metrics.

**Request:** None

**Response:**
```json
{
  "summary": {
    "totalSessionsAllTime": 150,
    "totalCrisesDetected": 5,
    "averageTokensPerSession": 1200,
    "crisisRate": "3.33%"
  },
  "today": {
    "totalSessions": 10,
    "totalTokens": 12000,
    "totalCost": 0.015,
    "averageResponseTime": 5234,
    "successRate": 1.0,
    "strategiesProvided": 8
  },
  "costEstimates": {
    "todayCost": "$0.0150",
    "projectedMonthlyCost": "$0.45",
    "averageCostPerSession": "$0.0015"
  },
  "performance": {
    "averageResponseTime": "5234ms",
    "successRate": "100.0%",
    "strategiesProvidedToday": 8
  },
  "recentErrors": [],
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

**Response Codes:**
- `200` - Success
- `500` - Server error

**Example:**
```bash
curl http://localhost:3000/api/analytics
```

---

## Test API

### GET `/api/test`

System health check and diagnostics.

**Query Parameters:**
- `type` (optional): `strategies` | `agents` | `env`

**Response:**
```json
{
  "status": "ok",
  "message": "ADHD Support Agent API is running",
  "endpoints": [
    { "path": "/api/chat", "method": "POST", "description": "Main chat endpoint" },
    { "path": "/api/analytics", "method": "GET", "description": "Performance analytics" },
    { "path": "/api/test", "method": "GET", "description": "Health check" }
  ],
  "version": "1.0.0"
}
```

**With `?type=strategies`:**
```json
{
  "status": "ok",
  "strategies": {
    "total": 16,
    "challenges": ["morning-routines", "homework-focus", ...],
    "ageRanges": ["5-8", "9-12", "13-17"],
    "list": [...]
  }
}
```

**Response Codes:**
- `200` - Success
- `500` - Server error

**Example:**
```bash
curl http://localhost:3000/api/test?type=strategies
```

---

## Voice API

### POST `/api/voice/speech-to-text`

Convert audio to text using ElevenLabs.

**Requires:** `ELEVENLABS_API_KEY` environment variable

**Request:**
- Content-Type: `multipart/form-data`
- Body: Audio file (WAV, MP3, etc.)

**Response:**
```json
{
  "text": "My child won't focus on homework",
  "success": true
}
```

**Response Codes:**
- `200` - Success
- `400` - No audio file provided
- `503` - Voice service not configured

**Example:**
```bash
curl -X POST http://localhost:3000/api/voice/speech-to-text \
  -F "audio=@recording.wav"
```

---

### POST `/api/voice/text-to-speech`

Convert text to speech using ElevenLabs.

**Requires:** `ELEVENLABS_API_KEY` environment variable

**Request Body:**
```json
{
  "text": "I understand homework time can be challenging..."
}
```

**Response:**
- Content-Type: `audio/mpeg`
- Body: Audio stream (MP3)

**Response Codes:**
- `200` - Success (audio stream)
- `400` - No text provided
- `503` - Voice service not configured

**Example:**
```bash
curl -X POST http://localhost:3000/api/voice/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello there"}' \
  --output response.mp3
```

---

## Authentication API

### POST `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "securepassword123",
  "consentGiven": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully"
}
```

**Response Codes:**
- `200` - Success
- `400` - Invalid input or user already exists
- `500` - Server error

---

### POST `/api/auth/login`

Sign in to an existing account.

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "parent@example.com"
  }
}
```

**Response Codes:**
- `200` - Success
- `401` - Invalid credentials
- `500` - Server error

---

### POST `/api/auth/logout`

Sign out of the current session.

**Request:** None (uses session cookie)

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

**Response Codes:**
- `200` - Success

---

### POST `/api/auth/reset-password`

Request a password reset email.

**Request Body:**
```json
{
  "email": "parent@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Response Codes:**
- `200` - Success
- `400` - Invalid email
- `500` - Server error

---

## Profile API

### GET `/api/profile`

Get the current user's profile.

**Authentication Required:** Yes

**Response:**
```json
{
  "id": "uuid",
  "email": "parent@example.com",
  "child_age_range": "9-12",
  "support_system_strength": "moderate",
  "created_at": "2025-09-30T12:00:00.000Z"
}
```

**Response Codes:**
- `200` - Success
- `401` - Not authenticated
- `500` - Server error

---

### PUT `/api/profile`

Update the current user's profile.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "child_age_range": "9-12",
  "support_system_strength": "strong"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Response Codes:**
- `200` - Success
- `401` - Not authenticated
- `400` - Invalid input
- `500` - Server error

---

## Rate Limiting

All API endpoints are rate-limited:

- **Standard routes**: 60 requests per minute
- **API routes**: 20 requests per minute

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
```

When rate limited:
```json
{
  "error": "Too Many Requests",
  "message": "Please slow down and try again in a moment.",
  "retryAfter": 60
}
```

---

## Error Responses

All API endpoints follow a consistent error format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": "Optional additional context"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error (server-side issue)
- `503` - Service Unavailable (dependency down)

---

## Webhooks

Currently not implemented. Future versions may support:
- Session completion notifications
- Crisis detection alerts
- Analytics reports

---

## SDK / Client Libraries

No official SDK yet. Use standard HTTP clients:

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello', context: {} })
});
const data = await response.json();
```

**Python:**
```python
import requests

response = requests.post(
    'http://localhost:3000/api/chat',
    json={'message': 'Hello', 'context': {}}
)
data = response.json()
```

---

## Changelog

### v1.0.0 (2025-09-30)
- Initial API release
- Chat, analytics, voice, auth endpoints
- Rate limiting and security headers
- GDPR compliance features

---

## Support

For API support:
- GitHub Issues: (repository link)
- Documentation: See README.md and other docs/

---

**Last Updated:** September 30, 2025  
**API Version:** 1.0.0

