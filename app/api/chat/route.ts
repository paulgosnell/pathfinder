import { NextRequest } from 'next/server';
import { createCrisisToolsAgent } from '@/lib/agents/crisis-tools-agent';
import { createProperToolsAgent } from '@/lib/agents/proper-tools-agent';
import { createDiscoveryAgent } from '@/lib/agents/discovery-agent';
import { createPartialDiscoveryAgent } from '@/lib/agents/partial-discovery-agent';
import { sessionManager } from '@/lib/session/manager';
import { performanceTracker } from '@/lib/monitoring/performance-tracker';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServiceClient } from '@/lib/supabase/service-client';
import { calculateProfileCompleteness } from '@/lib/profile/completeness';
import { searchKnowledgeBase, extractTopics } from '@/lib/knowledge-base/search';

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

    // Get or create session
    let session = sessionId ? await sessionManager.getSession(sessionId) : null;
    if (!session) {
      // Default to check-in mode (casual conversation)
      const interactionMode = context?.interactionMode || 'check-in';
      const timeBudgetMinutes = context?.timeBudgetMinutes;
      const sessionType = context?.sessionType;  // NEW: explicit session type from frontend
      const forceNew = context?.forceNew || false;  // NEW: force new session (auto-close old ones)
      session = await sessionManager.createSession(userId, interactionMode, timeBudgetMinutes, undefined, sessionType, forceNew);
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

    // STEP 2: Get user profile (parent-level data)
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

    // STEP 2.5: Load ALL child profiles for this user
    console.log('👶 Loading child profiles...');
    const { data: childProfiles, error: childError } = await serviceClient
      .from('child_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false }); // Primary child first

    console.log(`   Found ${childProfiles?.length || 0} child profiles`);
    if (childError) {
      console.error('❌ Child profiles error:', childError);
    }
    if (childProfiles && childProfiles.length > 0) {
      const names = childProfiles.map(c => c.child_name).join(', ');
      console.log(`   Children: ${names}`);
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

    // STEP 4: Route to appropriate agent based on session type
    console.log(`🤖 Running agent for session type: ${session.sessionType}...`);

    let agentResult: any;
    let discoveryJustCompleted = false; // Track if discovery was completed this turn

    // Calculate Reality phase depth (non-crisis messages in current session)
    const realityDepth = conversationHistory?.filter(m =>
      m.role === 'assistant' && !m.content.includes('999') && !m.content.includes('crisis')
    ).length || 0;

    if (session.sessionType === 'discovery') {
      // Check if this is partial discovery (user has some data already) or full discovery
      console.log('   🔍 Checking profile completeness for discovery routing...');
      const profileCompleteness = await calculateProfileCompleteness(userId);
      const isPartialDiscovery = profileCompleteness.completionPercentage > 0 && profileCompleteness.completionPercentage < 100;

      console.log(`   📊 Profile completeness: ${profileCompleteness.completionPercentage}%`);
      console.log(`   🎯 Discovery mode: ${isPartialDiscovery ? 'PARTIAL (resume)' : 'FULL (start fresh)'}`);

      if (isPartialDiscovery) {
        // Route to Partial Discovery Agent - only ask for missing fields
        console.log('   🔄 Using Partial Discovery Agent (resume mode)');
        console.log(`   📋 Missing fields: ${profileCompleteness.missingFields.join(', ')}`);

        const partialDiscoveryAgent = createPartialDiscoveryAgent();

        agentResult = await partialDiscoveryAgent(message, {
          userId,
          sessionId: session.id,
          conversationHistory: conversationHistory || [],
          profileCompleteness,
          existingUserProfile: userProfile,
          existingChildProfiles: childProfiles || []
        });

        // Check if partial discovery was completed - ONLY if tool was called in THIS exchange
        const updateToolResult = agentResult.toolResults?.find((r: any) => r.toolName === 'updatePartialDiscoveryProfile');
        const toolWasCalledThisExchange = updateToolResult !== undefined;

        if (toolWasCalledThisExchange) {
          const toolReportedSuccess = (updateToolResult as any).result?.success;

          // Double-check database to verify completion
          const { data: profileCheck } = await supabase
            .from('user_profiles')
            .select('discovery_completed, discovery_completed_at')
            .eq('user_id', userId)
            .single();

          const discoveryActuallyCompleted = profileCheck?.discovery_completed === true;

          if (toolReportedSuccess || discoveryActuallyCompleted) {
            if (discoveryActuallyCompleted && !toolReportedSuccess) {
              console.log('⚠️  Partial discovery data saved but tool reported error - force-closing session anyway');
            } else {
              console.log('✅ Partial discovery completed successfully - marking session as complete');
            }

            await sessionManager.updateSession(session.id, {
              status: 'complete'
            });

            discoveryJustCompleted = true; // Set flag for frontend
          }
        }
      } else {
        // Route to Full Discovery Agent - starting from scratch
        console.log('   🧭 Using Full Discovery Agent (start fresh)');
        const discoveryAgent = createDiscoveryAgent();

        // Calculate discovery progress
        const exchangeCount = conversationHistory?.filter(m => m.role === 'assistant').length || 0;
        const hasChildBasics = conversationHistory?.some(m =>
          m.role === 'assistant' && (m.content.toLowerCase().includes('name') || m.content.toLowerCase().includes('age'))
        ) || false;
        const hasDiagnosis = conversationHistory?.some(m =>
          m.role === 'assistant' && m.content.toLowerCase().includes('diagnos')
        ) || false;
        const hasChallenges = conversationHistory?.some(m =>
          m.role === 'assistant' && m.content.toLowerCase().includes('challenge')
        ) || false;

        // More reliable family context detection - check if we've asked about family setup
        const hasFamilyContext = conversationHistory?.some(m =>
          m.role === 'assistant' && (
            m.content.toLowerCase().includes('family setup') ||
            m.content.toLowerCase().includes('single parent') ||
            m.content.toLowerCase().includes('co-parenting')
          )
        ) || false;

        // User has responded to family context question
        const familyContextAnswered = hasFamilyContext && conversationHistory?.some((m, idx) => {
          const prevMessage = idx > 0 ? conversationHistory[idx - 1] : null;
          return m.role === 'user' && prevMessage?.role === 'assistant' && (
            prevMessage.content.toLowerCase().includes('family setup') ||
            prevMessage.content.toLowerCase().includes('single parent') ||
            prevMessage.content.toLowerCase().includes('co-parenting')
          );
        }) || false;

        // Ready to save if we have basic info AND family context has been answered
        const readyToComplete = exchangeCount >= 8 && hasChildBasics && hasDiagnosis && hasChallenges && familyContextAnswered;

        console.log(`   📊 Discovery Progress: exchanges=${exchangeCount}, basics=${hasChildBasics}, diagnosis=${hasDiagnosis}, challenges=${hasChallenges}, familyContext=${familyContextAnswered}, ready=${readyToComplete}`);

        agentResult = await discoveryAgent(message, {
          userId,
          sessionId: session.id,
          conversationHistory: conversationHistory || [],
          discoveryProgress: {
            exchangeCount,
            hasChildBasics,
            hasDiagnosis,
            hasChallenges,
            hasContext: familyContextAnswered,
            readyToComplete
          }
        });

        // Check if discovery was completed - verify BOTH tool result AND database
        // (Tool might report failure but data was still saved - see bug report)
        const discoveryToolResult = agentResult.toolResults?.find((r: any) => r.toolName === 'updateDiscoveryProfile');
        const toolReportedSuccess = discoveryToolResult && (discoveryToolResult as any).result?.success;

        // CRITICAL FIX: Check database to see if discovery actually completed
        // even if tool reported an error (data might have been saved before error occurred)
        const { data: profileCheck } = await supabase
          .from('user_profiles')
          .select('discovery_completed, discovery_completed_at')
          .eq('user_id', userId)
          .single();

        const discoveryActuallyCompleted = profileCheck?.discovery_completed === true;

        if (toolReportedSuccess || discoveryActuallyCompleted) {
          if (discoveryActuallyCompleted && !toolReportedSuccess) {
            console.log('⚠️  Discovery data saved but tool reported error - force-closing session anyway');
          } else {
            console.log('✅ Discovery completed successfully - marking session as complete');
          }

          await sessionManager.updateSession(session.id, {
            status: 'complete'
          });

          discoveryJustCompleted = true; // Set flag for frontend
        }
      }
    } else {
      // Route to Standard Coaching Agent (for all other session types)
      console.log(`   🧠 Using Standard Coaching Agent (${session.sessionType})`);

      // STEP 4.5: Search knowledge base for relevant research/guidance
      console.log('📚 Searching knowledge base for relevant content...');
      let knowledgeBaseChunks = [];
      try {
        // Extract topics from user message
        const detectedTopics = extractTopics(message);
        console.log(`   Detected topics: ${detectedTopics.join(', ') || 'none'}`);

        // Determine age relevance from child profiles
        const ageRelevance = childProfiles && childProfiles.length > 0
          ? childProfiles.map((c: any) => c.child_age_range).filter(Boolean)
          : undefined;

        // Search knowledge base
        knowledgeBaseChunks = await searchKnowledgeBase(message, {
          limit: 5,
          threshold: 0.75,
          filters: {
            topic_tags: detectedTopics.length > 0 ? detectedTopics : undefined,
            age_relevance: ageRelevance
          }
        });

        console.log(`   Found ${knowledgeBaseChunks.length} relevant knowledge chunks`);
        if (knowledgeBaseChunks.length > 0) {
          console.log(`   Top result: ${knowledgeBaseChunks[0].source_document_name} (similarity: ${knowledgeBaseChunks[0].similarity.toFixed(2)})`);
        }
      } catch (err) {
        console.error('❌ Knowledge base search error:', err);
        // Continue without knowledge base context
      }

      const therapeuticAgent = createProperToolsAgent();
      console.log(`   Agent context: ${conversationHistory?.length || 0} messages in history, ${knowledgeBaseChunks.length} KB chunks`);

      agentResult = await therapeuticAgent(message, {
        userId: userId,
        sessionId: session.id,
        interactionMode: session.interactionMode, // NEW: Pass interaction mode to determine prompt
        conversationHistory: conversationHistory || [],
        userProfile: userProfile ? {
          childAgeRange: userProfile.child_age_range,
          commonTriggers: userProfile.common_triggers || [],
          triedSolutions: userProfile.tried_solutions || [],
          successfulStrategies: userProfile.successful_strategies || [],
          failedStrategies: userProfile.failed_strategies || [],
          parentStressLevel: userProfile.parent_stress_level,
          familyContext: userProfile.family_context,
          supportNetwork: userProfile.support_network || [],
        } : undefined,
        // NEW: Pass ALL child profiles to agent
        childProfiles: childProfiles?.map(child => ({
          childName: child.child_name,
          childAge: child.child_age,
          childAgeRange: child.child_age_range,
          diagnosisStatus: child.diagnosis_status,
          diagnosisDetails: child.diagnosis_details,
          mainChallenges: child.main_challenges || [],
          commonTriggers: child.common_triggers || [],
          schoolType: child.school_type,
          gradeLevel: child.grade_level,
          hasIEP: child.has_iep,
          has504Plan: child.has_504_plan,
          medicationStatus: child.medication_status,
          therapyStatus: child.therapy_status,
          triedSolutions: child.tried_solutions || [],
          successfulStrategies: child.successful_strategies || [],
          failedStrategies: child.failed_strategies || [],
          strengths: child.strengths || [],
          interests: child.interests || [],
          isPrimary: child.is_primary,
        })) || [],
        // Add coaching state with time tracking (only used in coaching mode)
        sessionState: session.interactionMode === 'coaching' ? {
          currentPhase: session.currentPhase || 'goal',
          realityExplorationDepth: realityDepth,
          emotionsReflected: session.emotionsReflected || false,
          exceptionsExplored: session.exceptionsExplored || false,
          readyForOptions: session.readyForOptions || false,
          timeBudgetMinutes: session.timeBudgetMinutes,
          timeElapsedMinutes: session.timeElapsedMinutes,
          timeExtensionOffered: session.timeExtensionOffered
        } : undefined,
        // NEW: Pass knowledge base chunks (research/expert guidance)
        knowledgeBaseChunks: knowledgeBaseChunks.length > 0 ? knowledgeBaseChunks.map((chunk: any) => ({
          text: chunk.chunk_text,
          source: chunk.source_document_name,
          url: chunk.source_url,
          tags: chunk.topic_tags,
          contentType: chunk.content_type,
          similarity: chunk.similarity
        })) : undefined
      });
    }

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
      sessionCompleted: discoveryJustCompleted, // NEW: Tell frontend if discovery just completed
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
    console.error('❌ Error stack:', (error as Error).stack);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));

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
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
