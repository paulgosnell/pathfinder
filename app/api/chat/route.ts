import { NextRequest } from 'next/server';
import { createCrisisToolsAgent } from '@/lib/agents/crisis-tools-agent';
import { createProperToolsAgent } from '@/lib/agents/proper-tools-agent';
import { sessionManager } from '@/lib/session/manager';
import { performanceTracker } from '@/lib/monitoring/performance-tracker';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';

const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'kill myself',
  'hurt myself',
  'self-harm',
  'self harm',
  'hurt my child',
  'hurt my kid',
  'hurt my son',
  'hurt my daughter',
  'kill my child',
  'kill my kid',
  'can\'t cope anymore',
  'can\'t do this anymore',
  'ending it',
  'take my life',
  'overdose',
  'emergency',
  'call 999',
  'call 911',
  'crisis',
  'panic attack',
  'i\'m done',
  'i am done'
];

const CRISIS_REGEX = [
  /(kill|hurt) (myself|my\s+(child|kid|son|daughter))/i,
  /(end|ending) (it|my life)/i,
  /(take|took) (my|the) (life|lives)/i,
  /(i\s*(?:just)?\s*can\'t\s*(?:do|cope)\s*this\s*anymore)/i,
  /(i\s*want\s*to\s*(?:die|disappear))/i
];

function shouldRunCrisisAssessment(message: string, session: { crisisLevel?: string } | null) {
  if (!message) return false;

  // If already in crisis mode, stay there
  if (session?.crisisLevel && ['high', 'critical'].includes(session.crisisLevel)) {
    return true;
  }

  const normalized = message.toLowerCase();

  // Check keywords
  if (CRISIS_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    return true;
  }

  // Check regex patterns
  if (CRISIS_REGEX.some(regex => regex.test(message))) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let sessionId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await req.json();
    const { message, context } = body;
    
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        message: "I didn't receive your message properly. Could you please try again?"
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract user ID and session ID
    userId = context?.userId;
    sessionId = context?.sessionId;

    // Check for authenticated user - REQUIRED
    const supabase = await createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return new Response(JSON.stringify({
        message: "Authentication required. Please sign in to continue."
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    userId = authUser.id;
    
    // Ensure user record exists
    const serviceClient = createServiceClient();
    const { error: userError } = await serviceClient
      .from('users')
      .upsert({
        id: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (userError) {
      console.error('Failed to ensure user exists:', userError);
      throw new Error(`User creation failed: ${userError.message}`);
    }

    // Get or create session (with time budget if provided)
    let session = sessionId ? await sessionManager.getSession(sessionId) : null;
    if (!session) {
      const timeBudgetMinutes = context?.timeBudgetMinutes || 50;
      session = await sessionManager.createSession(userId, timeBudgetMinutes);
      sessionId = session.id;
    }

    // STEP 1: Crisis Detection (if needed)
    const shouldRunCrisisCheck = shouldRunCrisisAssessment(message, session);

    if (shouldRunCrisisCheck) {
      console.log('🚨 Running crisis detection...');
      const crisisAgent = createCrisisToolsAgent();
      const crisisResult = await crisisAgent(message, []);
      
      const crisisToolResult = crisisResult?.toolResults?.find(
        result => result.toolName === 'assessCrisis'
      );

      // Access the result value from the tool execution
      const crisisAssessment = crisisToolResult ? (crisisToolResult as any).result as {
        riskLevel: string;
        resources?: any;
        urgency?: string
      } | undefined : undefined;

      if (crisisAssessment && ['high', 'critical'].includes(crisisAssessment.riskLevel)) {
        console.log(`🆘 CRISIS DETECTED: ${crisisAssessment.riskLevel}`);
        
        // Update session
        await sessionManager.updateSession(session.id, { 
          crisisLevel: crisisAssessment.riskLevel 
        });

        // Track and return
        await performanceTracker.trackSession({
          sessionId: session.id,
          userId: userId,
          totalTokens: crisisResult.usage?.totalTokens || 0,
          promptTokens: (crisisResult.usage as any)?.promptTokens || 0,
          completionTokens: (crisisResult.usage as any)?.completionTokens || 0,
          toolsUsed: crisisResult.toolResults?.length || 0,
          responseTimeMs: Date.now() - startTime,
          successfulCompletion: true,
          crisisDetected: true,
          strategiesProvided: 0
        });

        return new Response(JSON.stringify({
          message: crisisResult.text,
          crisis: true,
          resources: crisisAssessment.resources,
          sessionId: session.id,
          urgency: crisisAssessment.urgency
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      console.log('✅ No crisis indicators detected');
    }

    // STEP 2: Get user profile
    console.log('👤 Loading user profile...');
    const { data: userProfile } = await serviceClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Create profile if doesn't exist
    if (!userProfile) {
      await serviceClient
        .from('user_profiles')
        .insert({
          user_id: userId,
          parent_stress_level: 'unknown'
        });
    }

    // STEP 3: Get conversation history (load for active sessions too)
    console.log('📚 Loading conversation history...');
    console.log(`   Session ID: ${session.id}`);

    const { data: conversationHistory, error: historyError } = await serviceClient
      .from('agent_conversations')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(50); // Increased limit for full session context

    console.log(`   Found ${conversationHistory?.length || 0} previous messages`);
    if (historyError) {
      console.error('❌ Conversation history error:', historyError);
    }
    if (conversationHistory && conversationHistory.length > 0) {
      console.log(`   Sample: ${conversationHistory[0].role}: ${conversationHistory[0].content.substring(0, 50)}...`);
    }

    // STEP 4: Run main coaching agent
    console.log('🤖 Running ADHD coaching agent...');

    const therapeuticAgent = createProperToolsAgent();
    console.log(`   Agent context: ${conversationHistory?.length || 0} messages in history`);

    // Calculate Reality phase depth (non-crisis messages in current session)
    const realityDepth = conversationHistory?.filter(m =>
      m.role === 'assistant' && !m.content.includes('999') && !m.content.includes('crisis')
    ).length || 0;

    const agentResult = await therapeuticAgent(message, {
      userId: userId,
      sessionId: session.id,
      conversationHistory: conversationHistory || [],
      userProfile: userProfile ? {
        childAgeRange: userProfile.child_age_range,
        commonTriggers: userProfile.common_triggers || [],
        triedSolutions: userProfile.tried_solutions || [],
        successfulStrategies: userProfile.successful_strategies || [],
        failedStrategies: userProfile.failed_strategies || [],
        parentStressLevel: userProfile.parent_stress_level,
      } : undefined,
      // Add coaching state with time tracking
      sessionState: {
        currentPhase: session.currentPhase || 'goal',
        realityExplorationDepth: realityDepth,
        emotionsReflected: session.emotionsReflected || false,
        exceptionsExplored: session.exceptionsExplored || false,
        readyForOptions: session.readyForOptions || false,
        timeBudgetMinutes: session.timeBudgetMinutes,
        timeElapsedMinutes: session.timeElapsedMinutes,
        timeExtensionOffered: session.timeExtensionOffered
      }
    });

    console.log(`   Agent result received: ${agentResult ? 'success' : 'failed'}`);
    if (agentResult?.text) {
      console.log(`   Response length: ${agentResult.text.length} characters`);
    }

    // STEP 5: Update session state based on conversation depth
    console.log('📊 Updating coaching session state...');

    // Increment reality exploration depth (each exchange counts)
    const newRealityDepth = realityDepth + 1;

    // Check if we've had enough exploration to move to Options
    // Adapt minimum depth based on parent's available time
    const minRealityDepth =
      session.timeBudgetMinutes === 5 ? 2 :   // 5 mins: 1-2 exchanges (quick check-in)
      session.timeBudgetMinutes === 15 ? 6 :  // 15 mins: 5-7 exchanges (brief session)
      session.timeBudgetMinutes === 30 ? 9 :  // 30 mins: 8-12 exchanges (standard session)
      10;                                      // 50 mins: 10-15+ exchanges (full exploration)
    const canMoveToOptions = newRealityDepth >= minRealityDepth;

    // Estimate time elapsed (rough approximation: 2 minutes per exchange)
    const estimatedTimeElapsed = Math.min(
      session.timeBudgetMinutes,
      Math.floor((newRealityDepth * 2) + 1) // +1 for initial setup time
    );

    // Update session with new coaching state and time tracking
    await sessionManager.updateSession(session.id, {
      realityExplorationDepth: newRealityDepth,
      readyForOptions: canMoveToOptions,
      // Keep current phase unless explicitly changed
      currentPhase: session.currentPhase || 'reality',
      timeElapsedMinutes: estimatedTimeElapsed
    });

    console.log(`   Reality depth: ${newRealityDepth} exchanges`);
    console.log(`   Ready for Options: ${canMoveToOptions ? 'Yes' : `No (minimum ${minRealityDepth} exchanges for ${session.timeBudgetMinutes}-min session)`}`);
    console.log(`   Time elapsed: ~${estimatedTimeElapsed}/${session.timeBudgetMinutes} minutes`);

    // STEP 6: Save conversation to database (using service client to bypass RLS)
    console.log('💾 Saving conversation to database...');
    const { error: saveError } = await serviceClient.from('agent_conversations').insert([
      {
        session_id: session.id,
        role: 'user',
        content: message
      },
      {
        session_id: session.id,
        role: 'assistant',
        content: agentResult.text
      }
    ]);

    if (saveError) {
      console.error('❌ Failed to save conversation:', saveError);
    } else {
      console.log('✅ Conversation saved successfully');
    }

    // STEP 7: Track performance
    const responseTime = Date.now() - startTime;
    await performanceTracker.trackSession({
      sessionId: session.id,
      userId: userId,
      totalTokens: agentResult.usage?.totalTokens || 0,
      promptTokens: (agentResult.usage as any)?.promptTokens || 0,
      completionTokens: (agentResult.usage as any)?.completionTokens || 0,
      toolsUsed: 0,
      responseTimeMs: responseTime,
      successfulCompletion: true,
      crisisDetected: false,
      strategiesProvided: 0
    });

    console.log(`✅ Response completed in ${responseTime}ms`);

    // Return response
    return new Response(JSON.stringify({
      message: agentResult.text,
      sessionId: session.id,
      usage: {
        totalTokens: agentResult.usage?.totalTokens,
        cost: performanceTracker.calculateCost(
          (agentResult.usage as any)?.promptTokens || 0,
          (agentResult.usage as any)?.completionTokens || 0
        )
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ API error:', error);
    
    // Log error
    if (sessionId && userId) {
      await performanceTracker.logError(
        sessionId,
        userId,
        'api',
        error as Error,
        { endpoint: '/api/chat', timestamp: new Date().toISOString() }
      ).catch(console.error);
    }

    return new Response(JSON.stringify({
      message: "I'm experiencing some technical difficulties. Please try again in a moment.",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
