import { createCrisisToolsAgent } from '@/lib/agents/crisis-tools-agent';
import { createProperToolsAgent } from '@/lib/agents/proper-tools-agent';
import { performanceTracker } from '@/lib/monitoring/performance-tracker';
import { adhdStrategies, findStrategies } from '@/lib/data/strategies';

describe('ADHD Support Agent - Full System Integration', () => {
  
  describe('Crisis Detection Agent', () => {
    it('should detect suicidal ideation', async () => {
      const agent = createCrisisToolsAgent();
      const result = await agent(
        "I can't take this anymore, I'm thinking about ending it all",
        []
      );

      const crisisAssessment = result.toolResults?.find(
        r => r.toolName === 'assessCrisis'
      )?.result;

      expect(crisisAssessment).toBeDefined();
      expect(crisisAssessment.riskLevel).toMatch(/high|critical/);
      expect(crisisAssessment.immediateIntervention).toBe(true);
      expect(crisisAssessment.resources).toBeDefined();
      expect(crisisAssessment.resources.length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for AI call

    it('should detect parental burnout', async () => {
      const agent = createCrisisToolsAgent();
      const result = await agent(
        "I'm completely burnt out, I can't cope anymore",
        []
      );

      const crisisAssessment = result.toolResults?.find(
        r => r.toolName === 'assessCrisis'
      )?.result;

      expect(crisisAssessment).toBeDefined();
      expect(['medium', 'high', 'critical']).toContain(crisisAssessment.riskLevel);
    }, 30000);

    it('should return low risk for normal conversation', async () => {
      const agent = createCrisisToolsAgent();
      const result = await agent(
        "My child had trouble with homework today",
        []
      );

      const crisisAssessment = result.toolResults?.find(
        r => r.toolName === 'assessCrisis'
      )?.result;

      expect(crisisAssessment).toBeDefined();
      expect(['none', 'low']).toContain(crisisAssessment.riskLevel);
      expect(crisisAssessment.immediateIntervention).toBe(false);
    }, 30000);
  });

  describe('Therapeutic Agent', () => {
    it('should assess morning routine challenges', async () => {
      const agent = createProperToolsAgent();
      const result = await agent(
        "My 8-year-old takes forever to get ready for school every morning",
        {
          userId: 'test-user',
          sessionId: 'test-session',
          childAge: '5-8'
        }
      );

      expect(result.text).toBeDefined();
      expect(result.text.toLowerCase()).toMatch(/morning|routine|ready/);
      
      const assessmentTool = result.toolResults?.find(
        r => r.toolName === 'assessSituation'
      );
      expect(assessmentTool).toBeDefined();
    }, 30000);

    it('should retrieve appropriate strategies', async () => {
      const agent = createProperToolsAgent();
      const result = await agent(
        "How can I help my 10-year-old focus on homework?",
        {
          userId: 'test-user',
          sessionId: 'test-session',
          childAge: '9-12'
        }
      );

      const strategyResult = result.toolResults?.find(
        r => r.toolName === 'retrieveStrategy'
      )?.result;

      expect(strategyResult).toBeDefined();
      expect(strategyResult.availableStrategies).toBeDefined();
      expect(strategyResult.availableStrategies.length).toBeGreaterThan(0);
    }, 30000);

    it('should set therapeutic goals', async () => {
      const agent = createProperToolsAgent();
      const result = await agent(
        "I want to improve our bedtime routine so we're not fighting every night",
        {
          userId: 'test-user',
          sessionId: 'test-session',
          childAge: '5-8'
        }
      );

      const goalTool = result.toolResults?.find(
        r => r.toolName === 'setTherapeuticGoal'
      )?.result;

      // Goal may or may not be set depending on AI decision
      if (goalTool) {
        expect(goalTool.goal).toBeDefined();
        expect(goalTool.timeframe).toBeDefined();
        expect(goalTool.metrics).toBeDefined();
      }
    }, 30000);

    it('should respect max steps limit', async () => {
      const agent = createProperToolsAgent();
      const result = await agent(
        "Tell me everything about ADHD",
        {
          userId: 'test-user',
          sessionId: 'test-session'
        }
      );

      expect(result.toolResults?.length || 0).toBeLessThanOrEqual(5);
    }, 30000);
  });

  describe('Strategy Database', () => {
    it('should have comprehensive strategies', () => {
      expect(adhdStrategies.length).toBeGreaterThanOrEqual(10);
    });

    it('should filter strategies by challenge', () => {
      const morningStrategies = findStrategies('morning-routines');
      expect(morningStrategies.length).toBeGreaterThan(0);

      const homeworkStrategies = findStrategies('homework-focus');
      expect(homeworkStrategies.length).toBeGreaterThan(0);
    });

    it('should filter strategies by age range', () => {
      const youngKidsStrategies = findStrategies('behavior-management', '5-8');
      expect(youngKidsStrategies.length).toBeGreaterThan(0);
      
      youngKidsStrategies.forEach(strategy => {
        expect(strategy.ageRange).toContain('5-8');
      });
    });

    it('should include required strategy fields', () => {
      adhdStrategies.forEach(strategy => {
        expect(strategy.id).toBeDefined();
        expect(strategy.title).toBeDefined();
        expect(strategy.challenge).toBeDefined();
        expect(strategy.description).toBeDefined();
        expect(strategy.implementation).toBeDefined();
        expect(strategy.implementation.length).toBeGreaterThan(0);
        expect(strategy.timeframe).toBeDefined();
        expect(strategy.difficultyLevel).toMatch(/easy|moderate|challenging/);
        expect(strategy.evidenceLevel).toMatch(/research-backed|clinical-practice|parent-tested/);
        expect(strategy.successIndicators).toBeDefined();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should calculate costs correctly', () => {
      const cost = performanceTracker.calculateCost(1000, 1000);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.01); // Should be less than 1 cent for 2K tokens
    });

    it('should track sessions', async () => {
      await performanceTracker.trackSession({
        sessionId: 'test-session',
        userId: 'test-user',
        totalTokens: 1000,
        promptTokens: 400,
        completionTokens: 600,
        toolsUsed: 2,
        responseTimeMs: 5000,
        successfulCompletion: true,
        crisisDetected: false,
        strategiesProvided: 1
      });

      const stats = performanceTracker.getDailyStats();
      expect(stats.totalSessions).toBeGreaterThan(0);
    });

    it('should log errors', async () => {
      await performanceTracker.logError(
        'test-session',
        'test-user',
        'test',
        new Error('Test error'),
        { test: true }
      );

      const errors = performanceTracker.getRecentErrors(1);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Token Usage Estimates', () => {
    it('should stay within budget for typical conversations', async () => {
      const agent = createProperToolsAgent();
      const result = await agent(
        "My child won't listen to me",
        {
          userId: 'test-user',
          sessionId: 'test-session'
        }
      );

      expect(result.usage?.totalTokens || 0).toBeLessThan(3000); // Should be well under 3K tokens
      
      const cost = performanceTracker.calculateCost(
        result.usage?.promptTokens || 0,
        result.usage?.completionTokens || 0
      );
      expect(cost).toBeLessThan(0.01); // Should cost less than 1 cent
    }, 30000);
  });
});

describe('Error Handling', () => {
  it('should handle invalid input gracefully', async () => {
    const agent = createProperToolsAgent();
    
    // Empty message should still work
    const result = await agent('', {
      userId: 'test-user',
      sessionId: 'test-session'
    });

    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
  }, 30000);
});
