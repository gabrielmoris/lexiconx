# AI Generation

## Architecture

The AI subsystem uses a **dual-provider pattern** with automatic fallback:

1. If `AI_PROVIDER_ENDPOINT` + `AI_PROVIDER_API_KEY` are set → uses **Nvidia provider** (custom endpoint)
2. Otherwise, if `GEMINI_API_KEY` is set → uses **Google Gemini**
3. If neither → throws error

Provider selection happens in `lib/ai/client.ts` via `getAIProvider()` and `createAIClient()`.

## Model Config

- Model name: `process.env.AI_MODEL` (defaults to `gemini-2.5-flash`)
- Generation config: `temperature: 0.7`, `topK: 40`, `topP: 0.9`
- Response format: `responseMimeType: "application/json"` — all AI output must be valid JSON

## Prompt Structure

Prompts live in `lib/ai/` and are organized by function:

- `quiz-prompts.ts` — Quiz generation prompts in 5 languages
- `words-prompts.ts` — Word generation prompts
- `generate-quiz.ts` — Quiz generation logic + JSON validation
- `generate-words.ts` — Word generation logic + JSON validation
- `client.ts` — AI client factory
- `client-generators.ts` — Provider-specific client implementations

### Quiz Prompts (`QUIZ_PROMPTS`)

The `QUIZ_PROMPTS` object is keyed by **learning language** (`Language` type):

```typescript
export const QUIZ_PROMPTS = {
 English: { systemPrompt, userPrompt },
 Español: { systemPrompt, userPrompt },
 Deutsch: { systemPrompt, userPrompt },
 中文: { systemPrompt, userPrompt },
 русский: { systemPrompt, userPrompt },
};
```

Each prompt has:
- `systemPrompt(userLanguage, learningLanguage)` — Rules, constraints, level-based complexity guidelines
- `userPrompt(words, level, learningLanguage, userLanguage)` — Vocabulary input, generation params, JSON schema

### Level-Based Complexity

The system prompt includes 10 level tiers (1–100) that control:
- Sentence length (8–12 words at level 1, up to 30+ at level 80+)
- Grammar complexity
- Question type (factual → analytical → abstract)
- Answer language (user language at low levels → learning language at high levels)

## Quiz JSON Schema

The AI must return this exact structure:

```json
{
 "quizzes": [
 {
 "sentence": "string (learning language only, no phonetics)",
 "phoneticNotation": "string (full phonetic notation)",
 "translation": "string (user language translation)",
 "usedWords": ["string (Word _id values)"],
 "language": "string (learning language)",
 "questions": [
 {
 "question": "string",
 "options": [
 {
 "answer": "string",
 "isCorrect": boolean,
 "translation": "string (user language)",
 "phoneticNotation": "string (if answer is in learning language)"
 }
 ]
 }
 ]
 }
 ]
}
```

### Structural constraints

- Exactly 4 quiz items per generation
- Each quiz uses 2–4 vocabulary words
- Each quiz has 3–5 questions
- Each question has 3–5 options with exactly 1 correct answer
- Correct answer position in `options` array must be randomized
- `usedWords` is an **array of string IDs** (not full Word objects)
- `_id` values in `usedWords` must be copied exactly from input — no modification

## Validation in `generate-quiz.ts`

After parsing JSON, the code validates:
- `quizzes` array exists and is non-empty
- Each quiz has `sentence`, `translation`, `questions`, `phoneticNotation`, `usedWords`
- `questions` array length between 2 and 5
- `usedWords` is an array
- Each question has `question` field, `options` array with 2–5 items
- Exactly 1 `isCorrect: true` per question

## API Routes

- `POST /api/ai-quiz` — Generates quiz from user's due words
- `POST /api/ai-words` — Generates new vocabulary words

Both routes:
1. Validate session + required fields
2. `await connectDB()`
3. Look up user by `session.user.email`
4. Fetch words (overdue for review + new words)
5. Call AI generation function
6. Return result as JSON

## Modifying Prompts

When editing prompts in `quiz-prompts.ts` or `words-prompts.ts`:

- All 5 language versions must stay in sync — changes to English must be applied to Español, Deutsch, 中文, русский
- The JSON schema in the user prompt must match `types/Quiz.ts` / `types/Words.ts`
- Do not change field names in the JSON structure without updating the corresponding TypeScript types
- Test with `pnpm test` after any prompt change
