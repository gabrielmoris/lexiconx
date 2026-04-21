import { Language, Word, WordsGeneratorResponse } from "@/types/Words";
import { GoogleGenAI } from "@google/genai";
import { WORDS_PROMPTS } from "./words-prompts";

const MODEL_NAME = "gemini-2.5-flash";

export async function generateWords(
  apiKey: string,
  words: Word[],
  level: number,
  learningLanguage: Language,
  userLanguage: Language,
): Promise<WordsGeneratorResponse> {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    if (level < 1 || level > 100) {
      throw new Error("Level must be between 1 and 100");
    }

    // Initialize the Google GENAI client
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.models;

    const promptConfig = WORDS_PROMPTS[userLanguage];
    if (!promptConfig) {
      throw new Error(`Unsupported user language: ${userLanguage}`);
    }

    const systemPrompt = promptConfig.systemPrompt();
    const userPrompt = promptConfig.userPrompt(words, level, learningLanguage, userLanguage);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // optimized parameters
    const result = await model.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text || "";

    try {
      const parsedResponse = JSON.parse(responseText) as WordsGeneratorResponse;

      if (!parsedResponse.words || !Array.isArray(parsedResponse.words)) {
        throw new Error("Response missing quizzes array");
      }

      // Validate quiz structure
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
    console.error("Error generating quiz with Gemini:", error);
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : String(error)}`);
  }
}
