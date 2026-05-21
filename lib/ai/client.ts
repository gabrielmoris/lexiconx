import { createGoogleClient, createNvidiaClient } from './client-generators';

const AI_PROVIDER_ENDPOINT = process.env.AI_PROVIDER_ENDPOINT;
const AI_PROVIDER_API_KEY = process.env.AI_PROVIDER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const AI_MODEL = process.env.AI_MODEL || 'meta/llama-3.3-70b-instruct';

export type AIProvider = 'google' | 'nvidia';

export interface AIGenerateContentParams {
  model: string;
  contents: string;
  config?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    responseMimeType?: string;
    systemInstruction?: string;
  };
}

export interface AIClient {
  generateContent(params: AIGenerateContentParams): Promise<{ text: string }>;
}

interface ProviderConfig {
  client: AIClient;
  model: string;
  name: AIProvider;
}

export class FallbackAIClient implements AIClient {
  private primary: ProviderConfig;
  private fallback?: ProviderConfig;

  constructor(primary: ProviderConfig, fallback?: ProviderConfig) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async generateContent(params: AIGenerateContentParams): Promise<{ text: string }> {
    try {
      const result = await this.primary.client.generateContent({
        ...params,
        model: this.primary.model,
      });
      return result;
    } catch (primaryError) {
      if (!this.fallback) {
        throw primaryError;
      }

      console.warn(
        `[AI Fallback] Primary provider "${this.primary.name}" failed, falling back to "${this.fallback.name}".`,
        `Error: ${primaryError instanceof Error ? primaryError.message : String(primaryError)}`
      );

      try {
        const result = await this.fallback.client.generateContent({
          ...params,
          model: this.fallback.model,
        });
        console.info(`[AI Fallback] Successfully recovered using "${this.fallback.name}".`);
        return result;
      } catch (fallbackError) {
        console.error(
          `[AI Fallback] Fallback provider "${this.fallback.name}" also failed.`,
          `Error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
        );
        throw primaryError;
      }
    }
  }
}

export function createAIClient(): AIClient {
  const nvidiaConfigured = !!(AI_PROVIDER_ENDPOINT && AI_PROVIDER_API_KEY);
  const geminiConfigured = !!GEMINI_API_KEY;

  if (nvidiaConfigured && geminiConfigured) {
    // Both configured: Gemini primary, Nvidia fallback
    const primary: ProviderConfig = {
      client: createGoogleClient(GEMINI_API_KEY!),
      model: GEMINI_MODEL,
      name: 'google',
    };
    const fallback: ProviderConfig = {
      client: createNvidiaClient({
        apiKey: AI_PROVIDER_API_KEY!,
        baseURL: AI_PROVIDER_ENDPOINT!,
      }),
      model: AI_MODEL,
      name: 'nvidia',
    };
    return new FallbackAIClient(primary, fallback);
  }

  if (geminiConfigured) {
    return new FallbackAIClient({
      client: createGoogleClient(GEMINI_API_KEY!),
      model: GEMINI_MODEL,
      name: 'google',
    });
  }

  if (nvidiaConfigured) {
    return new FallbackAIClient({
      client: createNvidiaClient({
        apiKey: AI_PROVIDER_API_KEY!,
        baseURL: AI_PROVIDER_ENDPOINT!,
      }),
      model: AI_MODEL,
      name: 'nvidia',
    });
  }

  throw new Error('No api keys provided!');
}
