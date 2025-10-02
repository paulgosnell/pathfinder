import { NextRequest } from 'next/server';
import { createProperToolsAgent } from '@/lib/agents/proper-tools-agent';
import { createCrisisToolsAgent } from '@/lib/agents/crisis-tools-agent';
import { adhdStrategies } from '@/lib/data/strategies';

export async function GET(req: NextRequest) {
  const testType = req.nextUrl.searchParams.get('type') || 'basic';

  try {
    switch (testType) {
      case 'strategies':
        return new Response(JSON.stringify({
          status: 'success',
          strategiesCount: adhdStrategies.length,
          strategies: adhdStrategies.map(s => ({
            id: s.id,
            title: s.title,
            challenge: s.challenge,
            ageRange: s.ageRange
          }))
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'agents':
        // Test that agents can be created
        const therapeuticAgent = createProperToolsAgent();
        const crisisAgent = createCrisisToolsAgent();
        
        return new Response(JSON.stringify({
          status: 'success',
          message: 'All agents initialized successfully',
          agents: ['therapeutic', 'crisis']
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'env':
        return new Response(JSON.stringify({
          status: 'success',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          status: 'success',
          message: 'ADHD Support Agent API is running',
          version: '1.0.0',
          endpoints: [
            '/api/test?type=strategies',
            '/api/test?type=agents',
            '/api/test?type=env',
            '/api/chat',
            '/api/analytics'
          ],
          timestamp: new Date().toISOString()
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}