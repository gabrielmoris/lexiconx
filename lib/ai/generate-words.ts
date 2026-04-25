import { Language, Word, WordsGeneratorResponse } from "@/types/Words";
import { WORDS_PROMPTS } from "./words-prompts";
import { createAIClient } from "./client";

const MODEL_NAME = process.env.AI_MODEL || "gemini-2.5-flash";

export async function generateWords(
  words: Word[],
  level: number,
  learningLanguage: Language,
  userLanguage: Language,
): Promise<WordsGeneratorResponse> {
  try {
    if (level < 1 || level > 100) {
      throw new Error("Level must be between 1 and 100");
    }

    const client = createAIClient();

    const promptConfig = WORDS_PROMPTS[userLanguage];
    if (!promptConfig) {
      throw new Error(`Unsupported user language: ${userLanguage}`);
    }

    const systemPrompt = promptConfig.systemPrompt();
    const userPrompt = promptConfig.userPrompt(words, level, learningLanguage, userLanguage);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // TODO: Separate the response_format  and add it to the options here
    const result = await client.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text;

    try {
      const parsedResponse = JSON.parse(responseText) as WordsGeneratorResponse;

      if (!parsedResponse.words || !Array.isArray(parsedResponse.words)) {
        throw new Error("Response missing quizzes array");
      }

      parsedResponse.words.forEach((word, index) => {
        if (!word.definition || !word.language || !word.phoneticNotation) {
          throw new Error(`Quiz ${index + 1} missing required fields (dfinition, language, proneticNotation)`);
        }
      });

      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Response text:", responseText);
      throw new Error(`Failed to parse quiz response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error("Error generating words:", error);
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : String(error)}`);
  }
}
