import { describe, it, expect, vi } from 'vitest';
import { FallbackAIClient, AIClient, AIGenerateContentParams } from '@/lib/ai/client';

const defaultParams: AIGenerateContentParams = {
  model: 'consumer-model',
  contents: 'Test prompt',
  config: {
    temperature: 0.7,
    responseMimeType: 'application/json',
  },
};

function createMockClient(
  resolvedValue?: { text: string },
  rejectedError?: Error
): AIClient & { generateContent: ReturnType<typeof vi.fn> } {
  if (rejectedError) {
    return {
      generateContent: vi.fn().mockRejectedValue(rejectedError),
    };
  }
  return {
    generateContent: vi.fn().mockResolvedValue(resolvedValue || { text: '{"ok": true}' }),
  };
}

describe('FallbackAIClient', () => {
  describe('single provider (no fallback)', () => {
    it('returns result from primary when it succeeds', async () => {
      const mockClient = createMockClient({ text: '{"result": "primary"}' });
      const client = new FallbackAIClient({
        client: mockClient,
        model: 'primary-model',
        name: 'google',
      });

      const result = await client.generateContent(defaultParams);
      expect(result.text).toBe('{"result": "primary"}');
    });

    it('throws when primary fails and no fallback configured', async () => {
      const mockClient = createMockClient(undefined, new Error('429 Rate limit'));
      const client = new FallbackAIClient({
        client: mockClient,
        model: 'primary-model',
        name: 'google',
      });

      await expect(client.generateContent(defaultParams)).rejects.toThrow('429 Rate limit');
    });

    it('overrides model param with provider-specific model', async () => {
      const mockClient = createMockClient({ text: '{"ok": true}' });
      const client = new FallbackAIClient({
        client: mockClient,
        model: 'gemini-2.0-flash',
        name: 'google',
      });

      await client.generateContent(defaultParams);
      expect(mockClient.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gemini-2.0-flash' })
      );
    });
  });

  describe('with fallback configured', () => {
    it('returns primary result when primary succeeds', async () => {
      const primaryClient = createMockClient({ text: '{"result": "from-google"}' });
      const fallbackClientImpl = createMockClient({ text: '{"result": "from-nvidia"}' });

      const client = new FallbackAIClient(
        { client: primaryClient, model: 'gemini-2.0-flash', name: 'google' },
        { client: fallbackClientImpl, model: 'nvidia-model', name: 'nvidia' }
      );

      const result = await client.generateContent(defaultParams);
      expect(result.text).toBe('{"result": "from-google"}');
      expect(fallbackClientImpl.generateContent).not.toHaveBeenCalled();
    });

    it('falls back to secondary when primary fails', async () => {
      const primaryClient = createMockClient(undefined, new Error('429 Rate limit exceeded'));
      const fallbackClientImpl = createMockClient({ text: '{"result": "from-nvidia"}' });

      const client = new FallbackAIClient(
        { client: primaryClient, model: 'gemini-2.0-flash', name: 'google' },
        { client: fallbackClientImpl, model: 'nvidia-model', name: 'nvidia' }
      );

      const result = await client.generateContent(defaultParams);
      expect(result.text).toBe('{"result": "from-nvidia"}');
      expect(primaryClient.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gemini-2.0-flash' })
      );
      expect(fallbackClientImpl.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'nvidia-model' })
      );
    });

    it('throws primary error when both providers fail', async () => {
      const primaryClient = createMockClient(undefined, new Error('503 Service Unavailable'));
      const fallbackClientImpl = createMockClient(
        undefined,
        new Error('500 Internal Server Error')
      );

      const client = new FallbackAIClient(
        { client: primaryClient, model: 'gemini-2.0-flash', name: 'google' },
        { client: fallbackClientImpl, model: 'nvidia-model', name: 'nvidia' }
      );

      await expect(client.generateContent(defaultParams)).rejects.toThrow(
        '503 Service Unavailable'
      );
    });

    it('preserves all other params when overriding model', async () => {
      const fallbackClientImpl = createMockClient({ text: '{"ok": true}' });
      const primaryClient = createMockClient(undefined, new Error('fail'));

      const client = new FallbackAIClient(
        { client: primaryClient, model: 'gemini-2.0-flash', name: 'google' },
        { client: fallbackClientImpl, model: 'nvidia-model', name: 'nvidia' }
      );

      await client.generateContent(defaultParams);
      expect(fallbackClientImpl.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'nvidia-model',
          contents: defaultParams.contents,
          config: defaultParams.config,
        })
      );
    });

    it('logs warning when falling back', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const primaryClient = createMockClient(undefined, new Error('429 Rate limit'));
      const fallbackClientImpl = createMockClient({ text: '{"ok": true}' });

      const client = new FallbackAIClient(
        { client: primaryClient, model: 'gemini-2.0-flash', name: 'google' },
        { client: fallbackClientImpl, model: 'nvidia-model', name: 'nvidia' }
      );

      await client.generateContent(defaultParams);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AI Fallback]'),
        expect.stringContaining('Error')
      );
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully recovered'));

      warnSpy.mockRestore();
      infoSpy.mockRestore();
    });
  });
});
