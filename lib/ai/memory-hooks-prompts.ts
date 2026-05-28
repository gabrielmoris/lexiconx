import { Language } from '@/types/Words';

type PromptWord = { _id: string; word: string; definition: string; phoneticNotation?: string };

export const MEMORY_HOOKS_PROMPTS = {
  English: {
    systemPrompt: () =>
      `You are an expert language teacher specializing in the Keyword Method mnemonic technique (Atkinson, 1975). Your task is to create memory hooks for vocabulary words that a learner is struggling with. Each memory hook consists of a PHONETIC KEYWORD and a BRIDGE SENTENCE.

THE KEYWORD METHOD:
1. PHONETIC KEYWORD: A word in the learner's native language that sounds similar to the target word. It must be a common, concrete, imageable word.
2. BRIDGE SENTENCE: A vivid sentence that connects the phonetic keyword to the word's meaning. It should create a memorable mental image.

CRITICAL REQUIREMENTS:
- The phonetic keyword MUST sound similar to the target word (not its meaning).
- The bridge sentence MUST connect the KEYWORD to the MEANING of the target word.
- The bridge sentence should be vivid, visual, and easy to remember.
- For Chinese words, use the pinyin pronunciation to find the phonetic keyword.
- Keep bridge sentences short (max 15 words).
- Bridge sentences should be in the user's native language.

OUTPUT FORMAT REQUIREMENTS:
- Respond with ONLY valid JSON.
- No additional text, explanations, or comments.
- Follow the exact structure provided in the user prompt.`,

    userPrompt: (words: PromptWord[], learningLanguage: Language, userLanguage: Language) =>
      `VOCABULARY WORDS NEEDING MEMORY HOOKS:
 ${words
   .map(
     w =>
       `- ID: ${w._id} | Word: "${w.word}" | Meaning: "${w.definition}"${w.phoneticNotation ? ` | Pronunciation: ${w.phoneticNotation}` : ''}`
   )
   .join('\n')}

 TARGET LANGUAGE: ${learningLanguage}
 INSTRUCTIONS LANGUAGE: ${userLanguage}

 MANDATORY JSON STRUCTURE - FOLLOW EXACTLY:
 {
 "hooks": [
 {
 "wordId": "the _id of the word",
 "phoneticKeyword": "a word in ${userLanguage} that sounds like the target word",
 "bridgeSentence": "a vivid sentence connecting the keyword to the meaning"
 }
 ]
 }

 VALIDATION CHECKLIST - VERIFY BEFORE RESPONDING:
 ✓ One hook per word provided.
 ✓ Phonetic keyword sounds similar to the TARGET WORD (not its meaning).
 ✓ Bridge sentence connects the KEYWORD to the MEANING.
 ✓ Bridge sentences are vivid, short, and easy to visualize.
 ✓ All wordId values match the provided word IDs exactly.`,
  },
};
