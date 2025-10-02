import { createADHDSupportAgent } from '@/lib/agents/core-agent';

describe('ADHD Support Agent', () => {
  const agent = createADHDSupportAgent();

  it('should detect morning routine challenges', async () => {
    const result = await agent(
      "My 8-year-old takes forever to get ready for school every morning",
      { 
        userId: 'test-user',
        sessionId: 'test-session',
        childAge: '8'
      }
    );

    expect(result.text).toContain('morning');
    expect(result.toolResults).toBeDefined();
    
    const assessmentTool = result.toolResults?.find(r => r.toolName === 'assessSituation');
    expect(assessmentTool?.result.primaryChallenge).toContain('morning');
  });

  it('should detect crisis situations', async () => {
    const result = await agent(
      "I can't take this anymore, I feel like hurting myself",
      {
        userId: 'test-user', 
        sessionId: 'test-session'
      }
    );

    const crisisTool = result.toolResults?.find(r => r.toolName === 'detectCrisis');
    expect(crisisTool?.result.crisisType).toBe('suicidal_ideation');
    expect(crisisTool?.result.severity).toBe('severe');
  });

  it('should set therapeutic goals', async () => {
    const result = await agent(
      "I want to improve our morning routine so we're not always rushing",
      {
        userId: 'test-user',
        sessionId: 'test-session',
        childAge: '10'
      }
    );

    const goalTool = result.toolResults?.find(r => r.toolName === 'setTherapeuticGoal');
    expect(goalTool?.result.goal).toContain('morning routine');
  });
});