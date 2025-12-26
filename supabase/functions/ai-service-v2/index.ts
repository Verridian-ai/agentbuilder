// AI Service Proxy - OpenRouter API integration for code analysis and chat
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || 
  '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';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, messages, model, code, prompt, language } = body;

    // Chat completion
    if (action === 'chat') {
      if (!messages || !Array.isArray(messages)) {
        throw new Error('Messages array is required');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agent-builder-platform.run.app',
          'X-Title': 'Agent Builder Platform'
        },
        body: JSON.stringify({
          model: model || 'anthropic/claude-3.5-sonnet',
          messages,
          max_tokens: 4096,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return new Response(JSON.stringify({
        success: true,
        data: {
          content: data.choices?.[0]?.message?.content || '',
          role: 'assistant',
          model: data.model,
          usage: data.usage,
          finishReason: data.choices?.[0]?.finish_reason
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Code analysis
    if (action === 'analyze') {
      if (!code) {
        throw new Error('Code is required for analysis');
      }

      const analysisPrompt = `Analyze the following ${language || 'code'} and provide:

1. **Summary**: Brief description of what the code does
2. **Quality Assessment**: Code quality score (1-10) with reasoning
3. **Issues Found**: List any bugs, security issues, or problems
4. **Improvements**: Specific suggestions to improve the code
5. **Best Practices**: Which best practices are followed/missing

Code to analyze:
\`\`\`${language || ''}
${code}
\`\`\`

Provide a structured, actionable analysis.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agent-builder-platform.run.app',
          'X-Title': 'Agent Builder Platform'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: analysisPrompt }],
          max_tokens: 2048,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();

      return new Response(JSON.stringify({
        success: true,
        data: {
          analysis: data.choices?.[0]?.message?.content || '',
          model: data.model,
          usage: data.usage
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate documentation
    if (action === 'generate-docs') {
      if (!code) {
        throw new Error('Code is required for documentation');
      }

      const docsPrompt = `Generate comprehensive documentation for the following ${language || 'code'}:

\`\`\`${language || ''}
${code}
\`\`\`

Include:
1. **Overview**: What the code does and its purpose
2. **API Reference**: All functions/methods with parameters and return types
3. **Usage Examples**: Practical code examples
4. **Configuration**: Any configuration options
5. **Notes**: Important caveats or considerations

Format as clean Markdown.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agent-builder-platform.run.app',
          'X-Title': 'Agent Builder Platform'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: docsPrompt }],
          max_tokens: 3000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Documentation generation failed: ${response.status}`);
      }

      const data = await response.json();

      return new Response(JSON.stringify({
        success: true,
        data: {
          documentation: data.choices?.[0]?.message?.content || '',
          model: data.model,
          usage: data.usage
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate code
    if (action === 'generate') {
      if (!prompt) {
        throw new Error('Prompt is required for code generation');
      }

      const generatePrompt = `Generate ${language || 'TypeScript'} code for the following requirement:

${prompt}

Requirements:
- Write clean, production-ready code
- Include proper TypeScript types if applicable
- Add helpful comments
- Follow best practices
- Make it complete and runnable

Provide only the code without additional explanation.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agent-builder-platform.run.app',
          'X-Title': 'Agent Builder Platform'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: generatePrompt }],
          max_tokens: 4096,
          temperature: 0.5
        })
      });

      if (!response.ok) {
        throw new Error(`Code generation failed: ${response.status}`);
      }

      const data = await response.json();

      return new Response(JSON.stringify({
        success: true,
        data: {
          code: data.choices?.[0]?.message?.content || '',
          model: data.model,
          usage: data.usage
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // List available models
    if (action === 'models') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          models: [
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', capabilities: ['chat', 'code', 'analysis'] },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', capabilities: ['chat', 'code', 'analysis'] },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', capabilities: ['chat', 'code'] },
            { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', capabilities: ['chat', 'code', 'vision'] },
            { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google', capabilities: ['chat', 'code'] },
            { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta', capabilities: ['chat'] }
          ]
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error(`Invalid action: ${action}`);

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: { 
        code: 'AI_SERVICE_ERROR', 
        message: error.message 
      }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
