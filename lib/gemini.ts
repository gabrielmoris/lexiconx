import { GoogleGenAI } from "@google/genai";

// Define the model name
const MODEL_NAME = "gemini-2.0-flash-001";

// Interface for the sentence generator response
export interface SentenceGeneratorResponse {
  sentence: string;
  usedWords: string[];
  missingWords: string[];
}

/**
 * Generates a sentence using provided words with Gemini
 * @param apiKey - The Google Generative AI API key
 * @param words - Array of words to include in the sentence
 * @param additionalContext - Optional context or requirements for the sentence
 * @returns A promise that resolves to a SentenceGeneratorResponse object
 */
export async function generateSentenceWithWords(apiKey: string, words: string[], additionalContext?: string): Promise<SentenceGeneratorResponse> {
  try {
    // Input validation
    if (!apiKey) {
      throw new Error("API key is required");
    }

    if (!words || words.length === 0) {
      throw new Error("At least one word is required");
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.models;

    // Format the prompt
    const wordsList = words.join(", ");
    let prompt = `Create a single interesting and creative sentence that includes the following words: ${wordsList}.`;

    if (additionalContext) {
      prompt += ` ${additionalContext}`;
    }

    prompt += "\n\nRespond with JSON in the following format exactly, and nothing else:\n";
    prompt += "{\n";
    prompt += '  "sentence": "Your generated sentence here",\n';
    prompt += '  "usedWords": ["word1", "word2", ...],\n';
    prompt += '  "missingWords": ["word3", ...]\n';
    prompt += "}\n\n";
    prompt +=
      "Include in 'usedWords' all words from the provided list that you managed to include in the sentence. Include in 'missingWords' any words you couldn't fit naturally into the sentence.";

    // Generate content
    const result = await model.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text || "";

    try {
      // Parse JSON response
      const parsedResponse = JSON.parse(responseText) as SentenceGeneratorResponse;

      // Validate response format
      if (!parsedResponse.sentence) {
        throw new Error("Response missing sentence field");
      }

      if (!Array.isArray(parsedResponse.usedWords)) {
        parsedResponse.usedWords = [];
      }

      if (!Array.isArray(parsedResponse.missingWords)) {
        parsedResponse.missingWords = [];
      }

      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);

      // Try to extract just the sentence as a fallback
      const sentence = responseText.trim();
      return {
        sentence,
        usedWords: words.filter((word) => sentence.toLowerCase().includes(word.toLowerCase())),
        missingWords: words.filter((word) => !sentence.toLowerCase().includes(word.toLowerCase())),
      };
    }
  } catch (error) {
    console.error("Error generating sentence with Gemini:", error);
    throw new Error("Failed to generate sentence: " + (error instanceof Error ? error.message : String(error)));
  }
}
