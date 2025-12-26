export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function getContextStatus(tokens: number): 'low' | 'medium' | 'high' {
  if (tokens < 10000) return 'low';
  if (tokens < 50000) return 'medium';
  return 'high';
}

export async function generateClaudeMd(requirements: string): Promise<string> {
  // Simulated AI generation
  return `# Agent Configuration

## IDENTITY
You are an AI assistant specialized in ${requirements}.

## WORKFLOW
1. Understand the requirements
2. Plan the approach
3. Execute step by step
4. Verify results

## RULES
- Follow best practices
- Write clean code
- Test changes
- Document work
`;
}

export async function optimizeClaudeMd(content: string): Promise<{ suggestions: string[]; optimizedContent: string }> {
  return {
    suggestions: [
      'Consider removing redundant instructions',
      'Use shorter, more specific role descriptions',
      'Consolidate similar rules',
    ],
    optimizedContent: content,
  };
}
