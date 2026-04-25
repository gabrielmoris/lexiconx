import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { AIClient, AIGenerateContentParams } from "./client";

export function createNvidiaClient(options: { apiKey: string; baseURL: string }): AIClient {
  const client = new OpenAI({
    apiKey: options.apiKey,
    baseURL: options.baseURL,
  });

  return {
    generateContent: async (params: AIGenerateContentParams): Promise<{ text: string }> => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (params.config?.systemInstruction) {
        messages.push({
          role: "system",
          content: params.config.systemInstruction,
        });
      }

      messages.push({
        role: "user",
        content: params.contents,
      });

      const isJsonResponse = params.config?.responseMimeType?.includes("json");

      const completionOptions: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
        model: params.model,
        messages,
        temperature: params.config?.temperature ?? 0.7,
        top_p: params.config?.topP ?? 0.9,
      };

      if (isJsonResponse) {
        (completionOptions as { response_format?: { type: string } }).response_format = { type: "json_object" };
      }

      const response = await client.chat.completions.create(completionOptions);

      return { text: response.choices[0]?.message?.content || "" };
    },
  };
}

export function createGoogleClient(apiKey: string): AIClient {
  const genAI = new GoogleGenAI({ apiKey });

  return {
    generateContent: async (params: AIGenerateContentParams): Promise<{ text: string }> => {
      const result = await genAI.models.generateContent({
        model: params.model,
        contents: params.contents,
        config: {
          temperature: params.config?.temperature ?? 0.7,
          topK: params.config?.topK ?? 40,
          topP: params.config?.topP ?? 0.9,
          responseMimeType: params.config?.responseMimeType ?? "application/json",
          systemInstruction: params.config?.systemInstruction,
        },
      });
      return { text: result.text || "" };
    },
  };
}
