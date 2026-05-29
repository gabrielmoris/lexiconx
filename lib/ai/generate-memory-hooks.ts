import { MemoryHookGeneratorResponse } from '@/types/MemoryHook';
import { Language, Word } from '@/types/Words';
import { MEMORY_HOOKS_PROMPTS } from './memory-hooks-prompts';
import { createAIClient } from './client';

const MODEL_NAME = process.env.AI_MODEL || 'gemini-2.0-flash';

function stripWordForPrompt(word: Word): {
  _id: string;
  word: string;
  definition: string;
  phoneticNotation?: string;
} {
  return {
    _id: word._id!,
    word: word.word,
    definition: word.definition,
    phoneticNotation: word.phoneticNotation || undefined,
  };
}

export async function generateMemoryHooks(
  words: Word[],
  learningLanguage: Language,
  userLanguage: Language
): Promise<MemoryHookGeneratorResponse> {
  try {
    if (!words || words.length === 0) {
      throw new Error('At least 1 word is required for memory hook generation');
    }

    const client = createAIClient();

    // Testing if english prompt works fine (so far is ok)
    const promptConfig = MEMORY_HOOKS_PROMPTS.English;
    if (!promptConfig) {
      throw new Error('Memory hooks prompt configuration not found');
    }

    const systemPrompt = promptConfig.systemPrompt();
    const strippedWords = words.map(stripWordForPrompt);
    const userPrompt = promptConfig.userPrompt(strippedWords, learningLanguage, userLanguage);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const result = await client.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.text;

    try {
      const parsedResponse = JSON.parse(responseText) as MemoryHookGeneratorResponse;

      if (!parsedResponse.hooks || !Array.isArray(parsedResponse.hooks)) {
        throw new Error('Response missing hooks array');
      }

      parsedResponse.hooks.forEach((hook, index) => {
        if (!hook.wordId || !hook.phoneticKeyword || !hook.bridgeSentence) {
          throw new Error(
            `Hook ${index + 1} missing required fields (wordId, phoneticKeyword, bridgeSentence)`
          );
        }
      });

      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', responseText);
      throw new Error(
        `Failed to parse memory hooks response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      );
    }
  } catch (error) {
    console.error('Error generating memory hooks:', error);
    throw new Error(
      `Failed to generate memory hooks: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
