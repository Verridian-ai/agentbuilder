// AI Service Proxy - OpenRouter API integration
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
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || 
      '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';

    const { action, messages, model = 'anthropic/claude-3.5-sonnet', code, prompt } = await req.json();

    if (action === 'chat' || action === 'complete') {
      if (!messages && !prompt) {
        throw new Error('Messages or prompt is required');
      }

      const requestMessages = messages || [{ role: 'user', content: prompt }];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agent-builder.app',
          'X-Title': 'Agent Builder Platform'
        },
        body: JSON.stringify({
          model,
          messages: requestMessages,
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
          model: data.model,
          usage: data.usage,
          finishReason: data.choices?.[0]?.finish_reason
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'analyze-code') {
      if (!code) {
        throw new Error('Code is required for analysis');
      }

      const analysisPrompt = `Analyze the following code and provide:
1. A brief summary of what it does
2. Potential improvements or issues
3. Best practices suggestions

Code:
\`\`\`
${code}
\`\`\``;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agent-builder.app',
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
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
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

    if (action === 'generate-docs') {
      if (!code) {
        throw new Error('Code is required for documentation');
      }

      const docsPrompt = `Generate comprehensive documentation for the following code including:
1. Overview and purpose
2. Function/method descriptions with parameters and return values
3. Usage examples
4. Any important notes or caveats

Code:
\`\`\`
${code}
\`\`\``;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agent-builder.app',
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
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
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

    if (action === 'models') {
      // Return available models
      return new Response(JSON.stringify({
        success: true,
        data: {
          models: [
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
            { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
            { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta' }
          ]
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'AI_SERVICE_ERROR', message: error.message }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
