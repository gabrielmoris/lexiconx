// Updated Gemini function with improved prompting - FIXED VERSION
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.0-flash-001";

export interface Word {
  _id: string;
  userId: string;
  word: string;
  definition: string;
  phoneticNotation: string;
  language: string;
  tags: string[];
  lastReviewed: Date | null;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface QuizAnswer {
  sentence: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
}

export interface Quiz {
  sentence: string;
  phoneticNotation: string;
  translation: string;
  usedWords: Word[];
  questions: QuizQuestion[];
}

export interface QuizGeneratorResponse {
  quizzes: Quiz[];
}

// Multilingual prompts with level-based complexity - FIXED VERSION
const QUIZ_PROMPTS = {
  english: {
    systemPrompt: `You are an expert language learning quiz generator. Your task is to create engaging, educational quizzes that help users practice vocabulary in context.

CRITICAL REQUIREMENTS:
1. Generate exactly 4 quiz items (4 sentences with questions)
2. Each quiz must use 2-4 words from the provided vocabulary list
3. Each quiz item must have 3-5 questions about that sentence (VARY the number - don't make all quiz items have the same number of questions!)
4. Sentence complexity, sentence length and question difficulty must match the user's proficiency level (1-100)
5. All questions must be answerable from the sentence content
6. Provide between 2 and 5 answer choices per question, with only 1 correct answer
7. Include phonetic notation for the target language
8. Provide accurate English translation
9. IMPORTANT: Mix the number of questions per quiz item for variety (e.g., first quiz might have 3 questions, second might have 5, third might have 4, etc.)

LEVEL-BASED COMPLEXITY GUIDELINES:
- Levels 1-10 (Beginner): Simple sentences (8-12 words), basic grammar, straightforward questions about facts
- Levels 11-20 (Beginner-Intermediate): Simple sentences (10-14 words), basic grammar, slightly more detailed factual questions
- Levels 21-30 (Intermediate): Moderate sentences (12-18 words), compound sentences, questions about relationships and implications
- Levels 31-40 (Intermediate-Advanced): Moderate sentences (15-20 words), more complex compound sentences, basic implications
- Levels 41-50 (Advanced): Complex sentences (18-25 words), multiple clauses, analytical questions
- Levels 51-60 (Advanced-Expert): Complex sentences (20-28 words), multiple dependent clauses, deeper inference and nuanced contextual meaning
- Levels 61-70 (Expert): Sophisticated sentences (25+ words), advanced grammar, nuanced comprehension questions, abstract concepts
- Levels 71-80 (Expert-Mastery): Highly sophisticated sentences (30+ words), intricate structures, complex abstract concepts, intertextual connections
- Levels 81-90 (Near-Native): Prose mimicking native speaker complexity, advanced rhetorical analysis, philosophical implications, fine distinctions in meaning
- Levels 91-100 (Native/Mastery): Complete mastery of all grammatical forms and stylistic variations, deep cultural/historical context, nuanced subtext, highly academic/specialized analysis

QUESTION TYPES BY LEVEL:
- Levels 1-20 (Beginner/Beginner-Intermediate): "What/Where/When/Who" factual questions
- Levels 21-40 (Intermediate/Intermediate-Advanced): "Why/How" reasoning questions, cause-effect relationships, basic implications
- Levels 41-60 (Advanced/Advanced-Expert): Inference, implication, and contextual meaning questions, deeper inference and nuanced contextual meaning
- Levels 61-100 (Expert/Expert-Mastery/Near-Native/Native-Mastery): Abstract concepts, cultural nuances, literary analysis, complex abstract concepts, intertextual connections, advanced rhetorical analysis, philosophical implications, fine distinctions in meaning, deep cultural/historical context, nuanced subtext, highly academic/specialized analysis

FORMAT: Respond with valid JSON only, no additional text.`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
Generate 4 quiz items using these ${targetLanguage} vocabulary words:
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

User Level: ${level}/100
Target Language: ${targetLanguage}
Instructions Language: English

Requirements:
- Create sentences at complexity level ${level}/100
- Use 2-4 different vocabulary words per sentence
- Generate 3-5 questions per sentence
- Questions must be in English
- Answers must be in English
- Include accurate English translations
- Match question difficulty to user level

JSON Format (IMPORTANT - Follow this structure, but vary the number of questions per quiz from 3-5):
{
  "quizzes": [
    {
      "sentence": "sentence in ${targetLanguage}",
      "phoneticNotation": "phonetic notation",
      "translation": "English translation",
      "usedWords": [array of word objects used in this sentence],
      "questions": [
        // Generate 3-5 questions per quiz item - vary the number!
        // Example showing 4 questions (you can generate 3, 4, or 5):
        {
          "question": "Question about the sentence?",
          "answers": [
            {"sentence": "Answer option", "isCorrect": true},
            {"sentence": "Answer option", "isCorrect": false},
            {"sentence": "Answer option", "isCorrect": false}
          ]
        },
        {
          "question": "Another question?",
          "answers": [
            {"sentence": "Answer option", "isCorrect": false},
            {"sentence": "Answer option", "isCorrect": true},
            {"sentence": "Answer option", "isCorrect": false},
            {"sentence": "Answer option", "isCorrect": false}
          ]
        },
        {
          "question": "Third question?",
          "answers": [
            {"sentence": "Answer option", "isCorrect": true},
            {"sentence": "Answer option", "isCorrect": false}
          ]
        },
        {
          "question": "Fourth question?",
          "answers": [
            {"sentence": "Answer option", "isCorrect": false},
            {"sentence": "Answer option", "isCorrect": false},
            {"sentence": "Answer option", "isCorrect": true},
            {"sentence": "Answer option", "isCorrect": false},
            {"sentence": "Answer option", "isCorrect": false}
          ]
        }
      ]
    }
  ]
}

IMPORTANT: Each quiz item should have a DIFFERENT number of questions (between 3-5). Don't make them all the same!`,
  },

  spanish: {
    systemPrompt: `Eres un generador experto de cuestionarios para el aprendizaje de idiomas. Tu tarea es crear cuestionarios atractivos y educativos que ayuden a los usuarios a practicar vocabulario en contexto.

REQUISITOS CRÍTICOS:
1. Genera exactamente 4 elementos de cuestionario (4 oraciones con preguntas)
2. Cada cuestionario debe usar 2-4 palabras de la lista de vocabulario proporcionada
3. Cada elemento del cuestionario debe tener 3-5 preguntas sobre esa oración
4. La complejidad de la oración, la longitud de la oración y la dificultad de la pregunta deben coincidir con el nivel de dominio del usuario (1-100)
5. Todas las preguntas deben ser respondibles a partir del contenido de la oración
6. Proporciona entre 2 y 5 opciones de respuesta por pregunta, con solo 1 respuesta correcta
7. Incluye la notación fonética para el idioma objetivo
8. Proporciona una traducción precisa al español

FORMATO: Responde solo con JSON válido, sin texto adicional.`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
Genera 4 elementos de cuestionario usando estas palabras de vocabulario en ${targetLanguage}:
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

Nivel de usuario: ${level}/100
Idioma objetivo: ${targetLanguage}
Idioma de las instrucciones: Español

Requisitos:
- Crea oraciones con un nivel de complejidad ${level}/100
- Usa 2-4 palabras de vocabulario diferentes por oración
- Genera 3-5 preguntas por oración
- Las preguntas deben estar en español
- Las respuestas deben estar en español
- Incluye traducciones precisas al español
- Haz coincidir la dificultad de la pregunta con el nivel del usuario

Formato JSON (IMPORTANTE - Sigue esta estructura, pero varía el número de preguntas por cuestionario de 3-5):
{
  "quizzes": [
    {
      "sentence": "oración en ${targetLanguage}",
      "phoneticNotation": "notación fonética",
      "translation": "traducción al español",
      "usedWords": [array de objetos de palabras usados en esta oración],
      "questions": [
        // Genera 3-5 preguntas por elemento del cuestionario - ¡varía el número!
        // Ejemplo mostrando 3 preguntas (puedes generar 3, 4 o 5):
        {
          "question": "¿Pregunta sobre la oración?",
          "answers": [
            {"sentence": "Opción de respuesta", "isCorrect": true},
            {"sentence": "Opción de respuesta", "isCorrect": false},
            {"sentence": "Opción de respuesta", "isCorrect": false}
          ]
        },
        {
          "question": "¿Otra pregunta?",
          "answers": [
            {"sentence": "Opción de respuesta", "isCorrect": false},
            {"sentence": "Opción de respuesta", "isCorrect": true},
            {"sentence": "Opción de respuesta", "isCorrect": false},
            {"sentence": "Opción de respuesta", "isCorrect": false}
          ]
        },
        {
          "question": "¿Tercera pregunta?",
          "answers": [
            {"sentence": "Opción de respuesta", "isCorrect": true},
            {"sentence": "Opción de respuesta", "isCorrect": false}
          ]
        }
      ]
    }
  ]
}

IMPORTANTE: Cada elemento del cuestionario debe tener un número DIFERENTE de preguntas (entre 3-5). ¡No hagas que todos tengan el mismo número!`,
  },

  german: {
    systemPrompt: `Du bist ein Experte für die Erstellung von Sprachlern-Quizfragen. Deine Aufgabe ist es, ansprechende, lehrreiche Quizfragen zu erstellen, die Benutzern helfen, Vokabeln im Kontext zu üben.

KRITISCHE ANFORDERUNGEN:
1. Erstelle genau 4 Quizfragen (4 Sätze mit Fragen)
2. Jedes Quiz muss 2-4 Wörter aus der angegebenen Vokabelliste verwenden
3. Jeder Quizbereich muss 3-5 Fragen zu diesem Satz haben
4. Die Komplexität des Satzes, die Satzlänge und die Schwierigkeit der Frage müssen dem Sprachniveau des Benutzers (1-100) entsprechen
5. Alle Fragen müssen anhand des Satzinhalts beantwortbar sein
6. Gib pro Frage zwischen 2 und 5 Antwortmöglichkeiten an, wobei nur 1 Antwort korrekt ist
7. Füge die phonetische Notation für die Zielsprache hinzu
8. Gib eine genaue deutsche Übersetzung an

FORMAT: Antworte nur mit gültigem JSON, kein zusätzlicher Text.`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
Generiere 4 Quizfragen mit diesen ${targetLanguage} Vokabeln:
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

Benutzerlevel: ${level}/100
Zielsprache: ${targetLanguage}
Anweisungssprache: Deutsch

Anforderungen:
- Erstelle Sätze mit dem Komplexitätsgrad ${level}/100
- Verwende 2-4 verschiedene Vokabeln pro Satz
- Erstelle 3-5 Fragen pro Satz
- Fragen müssen auf Deutsch sein
- Antworten müssen auf Deutsch sein
- Füge genaue deutsche Übersetzungen hinzu
- Passe die Schwierigkeit der Frage an das Benutzerlevel an

JSON-Format (WICHTIG - Folge dieser Struktur, aber variiere die Anzahl der Fragen pro Quiz von 3-5):
{
  "quizzes": [
    {
      "sentence": "Satz auf ${targetLanguage}",
      "phoneticNotation": "phonetische Notation",
      "translation": "Deutsche Übersetzung",
      "usedWords": [Array von Wortobjekten, die in diesem Satz verwendet werden],
      "questions": [
        // Erstelle 3-5 Fragen pro Quizbereich - variiere die Anzahl!
        // Beispiel mit 5 Fragen (du kannst 3, 4 oder 5 erstellen):
        {
          "question": "Frage über den Satz?",
          "answers": [
            {"sentence": "Antwortoption", "isCorrect": true},
            {"sentence": "Antwortoption", "isCorrect": false},
            {"sentence": "Antwortoption", "isCorrect": false}
          ]
        },
        {
          "question": "Weitere Frage?",
          "answers": [
            {"sentence": "Antwortoption", "isCorrect": false},
            {"sentence": "Antwortoption", "isCorrect": true},
            {"sentence": "Antwortoption", "isCorrect": false},
            {"sentence": "Antwortoption", "isCorrect": false}
          ]
        },
        {
          "question": "Dritte Frage?",
          "answers": [
            {"sentence": "Antwortoption", "isCorrect": true},
            {"sentence": "Antwortoption", "isCorrect": false}
          ]
        },
        {
          "question": "Vierte Frage?",
          "answers": [
            {"sentence": "Antwortoption", "isCorrect": false},
            {"sentence": "Antwortoption", "isCorrect": true}
          ]
        },
        {
          "question": "Fünfte Frage?",
          "answers": [
            {"sentence": "Antwortoption", "isCorrect": true},
            {"sentence": "Antwortoption", "isCorrect": false},
            {"sentence": "Antwortoption", "isCorrect": false}
          ]
        }
      ]
    }
  ]
}

WICHTIG: Jeder Quizbereich sollte eine ANDERE Anzahl von Fragen haben (zwischen 3-5). Mache sie nicht alle gleich!`,
  },

  chinese: {
    systemPrompt: `你是一个专业的语言学习测验生成器。你的任务是创建引人入胜的教育测验，帮助用户在上下文中练习词汇。

关键要求:
1. 严格生成 4 个测验项目 (4 个句子配问题)
2. 每个测验必须使用所提供词汇列表中的 2-4 个单词
3. 每个测验项目必须有 3-5 个关于该句子的问题
4. 句子复杂性、句子长度和问题难度必须与用户的熟练程度 (1-100) 相匹配
5. 所有问题都必须能从句子内容中找到答案
6. 每个问题提供 2 到 5 个答案选项，只有 1 个正确答案
7. 包含目标语言的语音标注
8. 提供准确的中文翻译

格式: 只返回有效的 JSON, 不包含任何额外文本。`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
使用这些 ${targetLanguage} 词汇生成 4 个测验项目:
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

用户等级: ${level}/100
目标语言: ${targetLanguage}
指令语言: 中文

要求:
- 创建复杂性等级为 ${level}/100 的句子
- 每个句子使用 2-4 个不同的词汇
- 每个句子生成 3-5 个问题
- 问题必须是中文
- 答案必须是中文
- 包含准确的中文翻译
- 问题难度与用户等级匹配

JSON 格式 (重要 - 遵循此结构，但每个测验的问题数量在3-5之间变化):
{
  "quizzes": [
    {
      "sentence": "用 ${targetLanguage} 写的句子",
      "phoneticNotation": "语音标注",
      "translation": "中文翻译",
      "usedWords": [此句子中使用的单词对象数组],
      "questions": [
        // 每个测验项目生成3-5个问题 - 变化数量！
        // 示例显示3个问题（你可以生成3、4或5个）:
        {
          "question": "关于句子的问题?",
          "answers": [
            {"sentence": "答案选项", "isCorrect": true},
            {"sentence": "答案选项", "isCorrect": false},
            {"sentence": "答案选项", "isCorrect": false}
          ]
        },
        {
          "question": "另一个问题?",
          "answers": [
            {"sentence": "答案选项", "isCorrect": false},
            {"sentence": "答案选项", "isCorrect": true},
            {"sentence": "答案选项", "isCorrect": false},
            {"sentence": "答案选项", "isCorrect": false}
          ]
        },
        {
          "question": "第三个问题?",
          "answers": [
            {"sentence": "答案选项", "isCorrect": true},
            {"sentence": "答案选项", "isCorrect": false}
          ]
        }
      ]
    }
  ]
}

重要: 每个测验项目应该有不同数量的问题（3-5个之间）。不要让它们都相同！`,
  },
};

/**
 * Enhanced quiz generation function with multilingual support and level-based complexity
 */
export async function generateQuizWithWords(
  apiKey: string,
  words: Word[],
  level: number,
  targetLanguage: string,
  userLanguage: "english" | "spanish" | "german" | "chinese"
): Promise<QuizGeneratorResponse> {
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

    const promptConfig = QUIZ_PROMPTS[userLanguage];
    if (!promptConfig) {
      throw new Error(`Unsupported user language: ${userLanguage}`);
    }

    const systemPrompt = promptConfig.systemPrompt;
    const userPrompt = promptConfig.userPrompt(words, level, targetLanguage);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // optimized parameters
    const result = await model.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        temperature: 0.7, // Balanced creativity and consistency
        maxOutputTokens: 4096, // Increased for complex multilingual content
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text || "";

    try {
      const parsedResponse = JSON.parse(responseText) as QuizGeneratorResponse;

      if (!parsedResponse.quizzes || !Array.isArray(parsedResponse.quizzes)) {
        throw new Error("Response missing quizzes array");
      }

      // Validate quiz structure
      parsedResponse.quizzes.forEach((quiz, index) => {
        if (!quiz.sentence || !quiz.translation || !quiz.questions || !quiz.phoneticNotation || !quiz.usedWords) {
          throw new Error(`Quiz ${index + 1} missing required fields (sentence, translation, questions, phoneticNotation, usedWords)`);
        }

        if (!Array.isArray(quiz.questions) || quiz.questions.length < 3 || quiz.questions.length > 5) {
          throw new Error(`Quiz ${index + 1} must have between 3 and 5 questions, but has ${quiz.questions.length}`);
        }

        if (!Array.isArray(quiz.usedWords)) {
          throw new Error(`Quiz ${index + 1} 'usedWords' must be an array`);
        }

        quiz.questions.forEach((question, qIndex) => {
          if (!question.question || !Array.isArray(question.answers) || question.answers.length < 2 || question.answers.length > 5) {
            throw new Error(
              `Quiz ${index + 1}, Question ${qIndex + 1} has an invalid number of answer choices (expected 2-5) or missing 'question' field`
            );
          }

          const correctAnswers = question.answers.filter((a) => a.isCorrect);
          if (correctAnswers.length !== 1) {
            throw new Error(`Quiz ${index + 1}, Question ${qIndex + 1} must have exactly one correct answer`);
          }
        });
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
