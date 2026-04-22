import OpenAI from "openai";
import { AIClient, AIGenerateContentParams } from "./client";

export class NvidiaAIClient implements AIClient {
  private client: OpenAI;

  constructor(options: { apiKey: string; baseURL: string }) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL,
    });
  }

  async generateContent(params: AIGenerateContentParams): Promise<{ text: string }> {
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
      top_p: params.config?.topP ?? 0.95,
    };

    if (isJsonResponse) {
      (completionOptions as { response_format?: { type: string } }).response_format = { type: "json_object" };
    }

    const response = await this.client.chat.completions.create(completionOptions);

    return { text: response.choices[0]?.message?.content || "" };
  }
}
