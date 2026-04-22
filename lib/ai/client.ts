import { GoogleGenAI } from "@google/genai";
import { NvidiaAIClient } from "./nvidiaAiClient";

const AI_PROVIDER_ENDPOINT = process.env.AI_PROVIDER_ENDPOINT;
const AI_PROVIDER_API_KEY = process.env.AI_PROVIDER_API_KEY;

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

export function createAIClient(apiKey: string): AIClient {
  if (isCustomProviderConfigured() && AI_PROVIDER_API_KEY && AI_PROVIDER_ENDPOINT) {
    return new NvidiaAIClient({
      apiKey: AI_PROVIDER_API_KEY,
      baseURL: AI_PROVIDER_ENDPOINT,
    });
  }
  return new GoogleAIClient(apiKey);
}

class GoogleAIClient implements AIClient {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateContent(params: AIGenerateContentParams): Promise<{ text: string }> {
    const result = await this.genAI.models.generateContent({
      model: params.model,
      contents: params.contents,
      config: {
        temperature: params.config?.temperature ?? 0.7,
        topK: params.config?.topK ?? 40,
        topP: params.config?.topP ?? 0.95,
        responseMimeType: params.config?.responseMimeType ?? "text/plain",
        systemInstruction: params.config?.systemInstruction,
      },
    });
    return { text: result.text || "" };
  }
}
