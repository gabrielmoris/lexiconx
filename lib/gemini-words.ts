import { Language, Word, WordsGeneratorResponse } from "@/types/Words";
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.0-flash-001";

// The word must have this structure
// word: string;
// definition: string;
// phoneticNotation: string;
// language:  languageToLearn

const QUIZ_PROMPTS = {
  English: {
    systemPrompt: (userLanguage: Language, learningLanguage: Language) =>
      `You are an expert languages teacher. your task is to choose the most adecuate words to help the users to learn taking in account the user level from 0 to 100 and the words the user already know. You MUST follow ALL requirements exactly to ensure consistent, reliable output.
        CRITICAL STRUCTURAL REQUIREMENTS - THESE ARE NON-NEGOTIABLE:
    `,
    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => ``,
  },
  Español: {
    systemPrompt: (userLanguage: Language, learningLanguage: Language) => ``,
    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => ``,
  },
  Deutsch: {
    systemPrompt: (userLanguage: Language, learningLanguage: Language) => ``,
    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => ``,
  },
  中文: {
    systemPrompt: (userLanguage: Language, learningLanguage: Language) => ``,
    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => ``,
  },
  русский: {
    systemPrompt: (userLanguage: Language, learningLanguage: Language) => ``,
    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => ``,
  },
};

export async function generateWords(
  apiKey: string,
  words: Word[],
  level: number,
  learningLanguage: Language,
  userLanguage: Language
): Promise<WordsGeneratorResponse> {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    if (!words || words.length < 3) {
      throw new Error("At least 3 words are required for quiz generation");
    }

    if (level < 1 || level > 100) {
      throw new Error("Level must be between 1 and 100");
    }

    // Initialize the Google GENAI client
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.models;

    const promptConfig = QUIZ_PROMPTS[learningLanguage];
    if (!promptConfig) {
      throw new Error(`Unsupported user language: ${userLanguage}`);
    }

    const systemPrompt = promptConfig.systemPrompt(userLanguage, learningLanguage);
    const userPrompt = promptConfig.userPrompt(words, level, learningLanguage, userLanguage);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // optimized parameters
    const result = await model.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        temperature: 0.7, // Balanced creativity and consistency
        maxOutputTokens: 8192, // Increased for complex multilingual content
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
      parsedResponse.words.forEach((wrd, index) => {});

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
