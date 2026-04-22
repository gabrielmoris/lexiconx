import { createGoogleClient, createNvidiaClient } from "./client-generators";

const AI_PROVIDER_ENDPOINT = process.env.AI_PROVIDER_ENDPOINT;
const AI_PROVIDER_API_KEY = process.env.AI_PROVIDER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type AIProvider = "google" | "nvidia";

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

function isCustomProviderConfigured(): boolean {
  return !!(AI_PROVIDER_ENDPOINT && AI_PROVIDER_API_KEY);
}

export function getAIProvider(): AIProvider {
  return isCustomProviderConfigured() ? "nvidia" : "google";
}

export function createAIClient(): AIClient {
  if (isCustomProviderConfigured()) {
    return createNvidiaClient({
      apiKey: AI_PROVIDER_API_KEY!,
      baseURL: AI_PROVIDER_ENDPOINT!,
    });
  }

  if (GEMINI_API_KEY) {
    return createGoogleClient(GEMINI_API_KEY);
  }

  throw new Error("No api keys provided!");
}
