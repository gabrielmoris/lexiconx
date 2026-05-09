import { QuizGeneratorResponse } from '@/types/Quiz';
import { Language, Word } from '@/types/Words';
import { QUIZ_PROMPTS } from './quiz-prompts';
import { createAIClient } from './client';

const MODEL_NAME = process.env.AI_MODEL || 'gemini-2.5-flash';

function stripWordForPrompt(word: Word): Pick<Word, '_id' | 'word' | 'definition'> {
  return {
    _id: word._id,
    word: word.word,
    definition: word.definition,
  };
}

export async function generateQuizWithWords(
  words: Word[],
  level: number,
  learningLanguage: Language,
  userLanguage: Language
): Promise<QuizGeneratorResponse> {
  try {
    if (!words || words.length < 3) {
      throw new Error('At least 3 words are required for quiz generation');
    }

    if (level < 1 || level > 100) {
      throw new Error('Level must be between 1 and 100');
    }

    const client = createAIClient();

    const promptConfig = QUIZ_PROMPTS[learningLanguage];
    if (!promptConfig) {
      throw new Error(`Unsupported user language: ${userLanguage}`);
    }

    const systemPrompt = promptConfig.systemPrompt(userLanguage, learningLanguage);
    const strippedWords = words.map(stripWordForPrompt);
    const userPrompt = promptConfig.userPrompt(
      strippedWords,
      level,
      learningLanguage,
      userLanguage
    );
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
      const parsedResponse = JSON.parse(responseText) as QuizGeneratorResponse;

      if (!parsedResponse.quizzes || !Array.isArray(parsedResponse.quizzes)) {
        throw new Error('Response missing quizzes array');
      }

      // Validate quiz structure
      parsedResponse.quizzes.forEach((quiz, index) => {
        if (!quiz.sentence || !quiz.translation || !quiz.questions || !quiz.phoneticNotation) {
          throw new Error(
            `Quiz ${index + 1} missing required fields (sentence, translation, questions, phoneticNotation)`
          );
        }

        if (
          !Array.isArray(quiz.questions) ||
          quiz.questions.length < 3 ||
          quiz.questions.length > 5
        ) {
          throw new Error(
            `Quiz ${index + 1} must have between 3 and 5 questions, but has ${quiz.questions.length}`
          );
        }

        quiz.questions.forEach((question, qIndex) => {
          if (
            !question.question ||
            !Array.isArray(question.options) ||
            question.options.length < 4 ||
            question.options.length > 5
          ) {
            throw new Error(
              `Quiz ${index + 1}, Question ${qIndex + 1} has an invalid number of answer choices (expected 4-5) or missing 'question' field`
            );
          }

          if (!Array.isArray(question.usedWords) || question.usedWords.length === 0) {
            throw new Error(
              `Quiz ${index + 1}, Question ${qIndex + 1} must have a non-empty 'usedWords' array`
            );
          }

          const correctAnswers = question.options.filter(a => a.isCorrect);
          if (correctAnswers.length !== 1) {
            throw new Error(
              `Quiz ${index + 1}, Question ${qIndex + 1} must have exactly one correct answer`
            );
          }
        });
      });

      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', responseText);
      throw new Error(
        `Failed to parse quiz response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      );
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error(
      `Failed to generate quiz: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
