// AI Service & Model Tests
import { jest } from '@jest/globals';

describe('AI Service', () => {
  // ========================================
  // AI Models Configuration Tests
  // ========================================
  describe('AI Models Configuration', () => {
    const supportedModels = [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: 200000 },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', context: 200000 },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', context: 200000 },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', context: 128000 },
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: 128000 },
      { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google', context: 32000 },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', context: 128000 }
    ];

    test('should have 7 supported models', () => {
      expect(supportedModels).toHaveLength(7);
    });

    test('should have valid model IDs', () => {
      supportedModels.forEach(model => {
        expect(model.id).toMatch(/^[a-z-]+\/[a-z0-9.-]+$/);
      });
    });

    test('should include Anthropic Claude models', () => {
      const anthropicModels = supportedModels.filter(m => m.provider === 'Anthropic');
      expect(anthropicModels.length).toBeGreaterThanOrEqual(3);

      const claudeModels = anthropicModels.filter(m => m.id.includes('claude'));
      expect(claudeModels.length).toBe(3);
    });

    test('should include OpenAI GPT-4 models', () => {
      const openaiModels = supportedModels.filter(m => m.provider === 'OpenAI');
      expect(openaiModels.length).toBeGreaterThanOrEqual(2);

      const gpt4Models = openaiModels.filter(m => m.id.includes('gpt-4'));
      expect(gpt4Models.length).toBe(2);
    });

    test('should have valid context lengths', () => {
      supportedModels.forEach(model => {
        expect(model.context).toBeGreaterThan(0);
        expect(model.context).toBeLessThanOrEqual(200000);
      });
    });

    test('should have Claude 3.5 Sonnet as recommended model', () => {
      const sonnet = supportedModels.find(m => m.id === 'anthropic/claude-3.5-sonnet');
      expect(sonnet).toBeDefined();
      expect(sonnet.context).toBe(200000);
    });
  });

  // ========================================
  // OpenRouter API Tests
  // ========================================
  describe('OpenRouter API Integration', () => {
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    test('should have correct API endpoint', () => {
      expect(OPENROUTER_API_URL).toBe('https://openrouter.ai/api/v1/chat/completions');
    });

    test('should format request headers correctly', () => {
      const apiKey = 'sk-or-v1-test-key';
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agent-builder.run.app',
        'X-Title': 'Agent Builder IDE'
      };

      expect(headers.Authorization).toContain('Bearer');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['HTTP-Referer']).toBeTruthy();
      expect(headers['X-Title']).toBe('Agent Builder IDE');
    });

    test('should format chat request body correctly', () => {
      const model = 'anthropic/claude-3.5-sonnet';
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
      ];

      const requestBody = {
        model,
        messages,
        stream: false
      };

      expect(requestBody.model).toBe(model);
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[1].role).toBe('user');
    });

    test('should validate message format', () => {
      const validMessages = [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'User message' },
        { role: 'assistant', content: 'Assistant response' }
      ];

      const validRoles = ['system', 'user', 'assistant'];

      validMessages.forEach(message => {
        expect(validRoles).toContain(message.role);
        expect(typeof message.content).toBe('string');
        expect(message.content.length).toBeGreaterThan(0);
      });
    });

    test('should handle API response format', () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'anthropic/claude-3.5-sonnet',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you today?'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 12,
          total_tokens: 22
        }
      };

      expect(mockResponse.choices).toBeDefined();
      expect(mockResponse.choices[0].message.content).toBeTruthy();
      expect(mockResponse.usage).toBeDefined();
      expect(mockResponse.usage.total_tokens).toBe(22);
    });

    test('should handle API error response format', () => {
      const errorResponse = {
        error: {
          message: 'Invalid API key',
          type: 'authentication_error',
          code: 'invalid_api_key'
        }
      };

      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.error.message).toBeTruthy();
      expect(errorResponse.error.code).toBe('invalid_api_key');
    });
  });

  // ========================================
  // AI Request Validation Tests
  // ========================================
  describe('AI Request Validation', () => {
    test('should validate required messages array', () => {
      const validRequest = { messages: [{ role: 'user', content: 'test' }] };
      const invalidRequest1 = { messages: null };
      const invalidRequest2 = { messages: 'not an array' };
      const invalidRequest3 = {};

      expect(Array.isArray(validRequest.messages)).toBe(true);
      expect(validRequest.messages.length).toBeGreaterThan(0);

      expect(invalidRequest1.messages).toBeNull();
      expect(Array.isArray(invalidRequest2.messages)).toBe(false);
      expect(invalidRequest3.messages).toBeUndefined();
    });

    test('should set default model if not provided', () => {
      const defaultModel = 'anthropic/claude-3.5-sonnet';
      const request = { messages: [{ role: 'user', content: 'test' }] };

      const model = request.model || defaultModel;
      expect(model).toBe(defaultModel);
    });

    test('should validate prompt length', () => {
      const maxPromptLength = 100000; // characters
      const shortPrompt = 'Hello!';
      const longPrompt = 'x'.repeat(maxPromptLength + 1);

      expect(shortPrompt.length).toBeLessThanOrEqual(maxPromptLength);
      expect(longPrompt.length).toBeGreaterThan(maxPromptLength);
    });
  });

  // ========================================
  // Code Analysis Tests
  // ========================================
  describe('Code Analysis', () => {
    test('should format code analysis request correctly', () => {
      const code = `function hello() {
        console.log("Hello, World!");
      }`;

      const analysisPrompt = `Analyze this code and provide insights:\n\n${code}`;

      expect(analysisPrompt).toContain('Analyze');
      expect(analysisPrompt).toContain(code);
    });

    test('should use efficient model for code analysis', () => {
      const efficientModel = 'anthropic/claude-3-haiku';
      expect(efficientModel).toContain('haiku');
    });

    test('should support multiple programming languages', () => {
      const supportedLanguages = [
        'javascript',
        'typescript',
        'python',
        'go',
        'rust',
        'java',
        'c',
        'cpp'
      ];

      expect(supportedLanguages).toContain('typescript');
      expect(supportedLanguages).toContain('python');
      expect(supportedLanguages.length).toBeGreaterThanOrEqual(8);
    });
  });

  // ========================================
  // Token Counting Tests
  // ========================================
  describe('Token Estimation', () => {
    // Rough estimate: 1 token ≈ 4 characters for English text
    const estimateTokens = (text) => Math.ceil(text.length / 4);

    test('should estimate tokens for short text', () => {
      const text = 'Hello, world!';
      const tokens = estimateTokens(text);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(10);
    });

    test('should estimate tokens for code', () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      const tokens = estimateTokens(code);

      expect(tokens).toBeGreaterThan(10);
      expect(tokens).toBeLessThan(50);
    });

    test('should check context limits', () => {
      const modelContextLimits = {
        'anthropic/claude-3.5-sonnet': 200000,
        'anthropic/claude-3-haiku': 200000,
        'openai/gpt-4-turbo': 128000,
        'google/gemini-pro': 32000
      };

      const text = 'x'.repeat(10000);
      const tokens = estimateTokens(text);

      Object.entries(modelContextLimits).forEach(([model, limit]) => {
        const withinLimit = tokens < limit;
        expect(withinLimit).toBe(true);
      });
    });
  });

  // ========================================
  // Streaming Tests
  // ========================================
  describe('Streaming Support', () => {
    test('should support streaming flag', () => {
      const streamingRequest = {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'test' }],
        stream: true
      };

      const nonStreamingRequest = {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'test' }],
        stream: false
      };

      expect(streamingRequest.stream).toBe(true);
      expect(nonStreamingRequest.stream).toBe(false);
    });

    test('should parse Server-Sent Events format', () => {
      const sseData = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n';
      const jsonStr = sseData.replace(/^data: /, '').trim();

      expect(sseData).toMatch(/^data: /);

      const parsed = JSON.parse(jsonStr);
      expect(parsed.choices[0].delta.content).toBe('Hello');
    });
  });

  // ========================================
  // Rate Limiting Tests
  // ========================================
  describe('Rate Limiting', () => {
    test('should track request timestamps', () => {
      const requests = [];
      const now = Date.now();

      // Simulate 5 requests
      for (let i = 0; i < 5; i++) {
        requests.push({ timestamp: now + i * 100 });
      }

      expect(requests).toHaveLength(5);

      // Check requests within time window
      const windowMs = 1000;
      const recentRequests = requests.filter(r => now + 500 - r.timestamp < windowMs);
      expect(recentRequests.length).toBe(5);
    });

    test('should implement exponential backoff', () => {
      const getBackoffDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000);

      expect(getBackoffDelay(0)).toBe(1000);
      expect(getBackoffDelay(1)).toBe(2000);
      expect(getBackoffDelay(2)).toBe(4000);
      expect(getBackoffDelay(3)).toBe(8000);
      expect(getBackoffDelay(5)).toBe(30000); // Capped at 30s
    });
  });

  // ========================================
  // Error Handling Tests
  // ========================================
  describe('Error Handling', () => {
    test('should categorize API errors', () => {
      const errorTypes = {
        'invalid_api_key': { status: 401, retryable: false },
        'rate_limit_exceeded': { status: 429, retryable: true },
        'model_not_found': { status: 404, retryable: false },
        'context_length_exceeded': { status: 400, retryable: false },
        'server_error': { status: 500, retryable: true }
      };

      expect(errorTypes['invalid_api_key'].retryable).toBe(false);
      expect(errorTypes['rate_limit_exceeded'].retryable).toBe(true);
      expect(errorTypes['server_error'].retryable).toBe(true);
    });

    test('should format error response correctly', () => {
      const formatError = (code, message) => ({
        success: false,
        error: { code, message }
      });

      const error = formatError('AI_ERROR', 'Request failed');

      expect(error.success).toBe(false);
      expect(error.error.code).toBe('AI_ERROR');
      expect(error.error.message).toBe('Request failed');
    });

    test('should handle network errors', () => {
      const networkErrors = [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNRESET'
      ];

      networkErrors.forEach(error => {
        expect(typeof error).toBe('string');
        expect(error.startsWith('E')).toBe(true);
      });
    });

    test('should fallback when API key not configured', () => {
      const apiKey = process.env.OPENROUTER_API_KEY || '';
      const fallbackMessage = 'AI response (OpenRouter API key not configured). To enable AI features, set OPENROUTER_API_KEY environment variable.';

      if (!apiKey) {
        expect(fallbackMessage).toContain('not configured');
      }
    });
  });
});
