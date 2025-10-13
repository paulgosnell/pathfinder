import { createProperToolsAgent } from '@/lib/agents/proper-tools-agent';

describe('Conversation Flows', () => {
  it('should handle complete morning routine conversation', async () => {
    const agent = createProperToolsAgent();
    const context = { 
      userId: 'test-user', 
      sessionId: 'test-session',
      childAge: '8'
    };

    // Step 1: Problem identification
    const step1 = await agent("My son won't get dressed for school", context);
    expect(step1.text).toContain('morning');

    // Step 2: Strategy request
    const step2 = await agent("What can I do to help him?", {
      ...context,
      previousStrategies: ['visual-chart']
    });
    
    const strategyTool = step2.toolResults?.find(r => r.toolName === 'retrieveStrategy');
    expect(strategyTool).toBeDefined();

    // Step 3: Goal setting
    const step3 = await agent("I want to try that approach", context);
    const goalTool = step3.toolResults?.find(r => r.toolName === 'setTherapeuticGoal');
    expect(goalTool).toBeDefined();
  });
});