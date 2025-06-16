// Updated Gemini function with improved prompting
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

// Multilingual prompts with level-based complexity
const QUIZ_PROMPTS = {
  english: {
    systemPrompt: `You are an expert language learning quiz generator. Your task is to create engaging, educational quizzes that help users practice vocabulary in context.

CRITICAL REQUIREMENTS:
1. Generate exactly 3 quiz items
2. Each quiz must use 3-4 words from the provided vocabulary list
3. Sentence complexity and question difficulty must match the user's proficiency level (1-100)
4. All questions must be answerable from the sentence content
5. Provide exactly 4 answer choices per question, with only 1 correct answer
6. Include phonetic notation for the target language
7. Provide accurate English translation

LEVEL-BASED COMPLEXITY GUIDELINES:
- Levels 1-25 (Beginner): Simple sentences (8-12 words), basic grammar, straightforward questions about facts
- Levels 26-50 (Intermediate): Moderate sentences (12-18 words), compound sentences, questions about relationships and implications  
- Levels 51-75 (Advanced): Complex sentences (18-25 words), multiple clauses, analytical questions
- Levels 76-100 (Expert): Sophisticated sentences (25+ words), advanced grammar, nuanced comprehension questions

QUESTION TYPES BY LEVEL:
- Beginner: "What/Where/When/Who" factual questions
- Intermediate: "Why/How" reasoning questions, cause-effect relationships
- Advanced: Inference, implication, and contextual meaning questions
- Expert: Abstract concepts, cultural nuances, literary analysis

FORMAT: Respond with valid JSON only, no additional text.`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
Generate 3 quiz items using these ${targetLanguage} vocabulary words:
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

User Level: ${level}/100
Target Language: ${targetLanguage}
Instructions Language: English

Requirements:
- Create sentences at complexity level ${level}/100
- Use 3-4 different vocabulary words per sentence
- Generate 2 questions per sentence
- Questions must be in English
- Answers must be in English
- Include accurate English translations
- Match question difficulty to user level

JSON Format:
{
  "quizzes": [
    {
      "sentence": "sentence in ${targetLanguage}",
      "phoneticNotation": "phonetic notation",
      "translation": "English translation",
      "usedWords": [array of word objects used in this sentence],
      "questions": [
        {
          "question": "Question in English?",
          "answers": [
            {"sentence": "Answer option in English", "isCorrect": true/false},
            {"sentence": "Answer option in English", "isCorrect": true/false},
            {"sentence": "Answer option in English", "isCorrect": true/false},
            {"sentence": "Answer option in English", "isCorrect": true/false}
          ]
        }
      ]
    }
  ]
}`,
  },

  spanish: {
    systemPrompt: `Eres un generador experto de cuestionarios para el aprendizaje de idiomas. Tu tarea es crear cuestionarios atractivos y educativos que ayuden a los usuarios a practicar vocabulario en contexto.

REQUISITOS CRÍTICOS:
1. Genera exactamente 3 elementos de cuestionario
2. Cada cuestionario debe usar 3-4 palabras de la lista de vocabulario proporcionada
3. La complejidad de las oraciones y la dificultad de las preguntas deben coincidir con el nivel de competencia del usuario (1-100)
4. Todas las preguntas deben ser respondibles desde el contenido de la oración
5. Proporciona exactamente 4 opciones de respuesta por pregunta, con solo 1 respuesta correcta
6. Incluye notación fonética para el idioma objetivo
7. Proporciona traducción precisa al español

DIRECTRICES DE COMPLEJIDAD POR NIVEL:
- Niveles 1-25 (Principiante): Oraciones simples (8-12 palabras), gramática básica, preguntas directas sobre hechos
- Niveles 26-50 (Intermedio): Oraciones moderadas (12-18 palabras), oraciones compuestas, preguntas sobre relaciones e implicaciones
- Niveles 51-75 (Avanzado): Oraciones complejas (18-25 palabras), múltiples cláusulas, preguntas analíticas
- Niveles 76-100 (Experto): Oraciones sofisticadas (25+ palabras), gramática avanzada, preguntas de comprensión matizada

TIPOS DE PREGUNTAS POR NIVEL:
- Principiante: Preguntas factuales "Qué/Dónde/Cuándo/Quién"
- Intermedio: Preguntas de razonamiento "Por qué/Cómo", relaciones causa-efecto
- Avanzado: Inferencia, implicación y preguntas de significado contextual
- Experto: Conceptos abstractos, matices culturales, análisis literario

FORMATO: Responde solo con JSON válido, sin texto adicional.`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
Genera 3 elementos de cuestionario usando estas palabras de vocabulario en ${targetLanguage}:
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

Nivel del Usuario: ${level}/100
Idioma Objetivo: ${targetLanguage}
Idioma de Instrucciones: Español

Requisitos:
- Crear oraciones con nivel de complejidad ${level}/100
- Usar 2-4 palabras de vocabulario diferentes por oración
- Generar al menos 2 preguntas por oración
- Las preguntas deben estar en español
- Las respuestas deben estar en español
- Incluir traducciones precisas al español
- Ajustar la dificultad de las preguntas al nivel del usuario

Formato JSON:
{
  "quizzes": [
    {
      "sentence": "oración en ${targetLanguage}",
      "phoneticNotation": "notación fonética",
      "translation": "traducción al español",
      "usedWords": [array de objetos de palabras usadas en esta oración],
      "questions": [
        {
          "question": "¿Pregunta en español?",
          "answers": [
            {"sentence": "Opción de respuesta en español", "isCorrect": true/false},
            {"sentence": "Opción de respuesta en español", "isCorrect": true/false},
            {"sentence": "Opción de respuesta en español", "isCorrect": true/false},
            {"sentence": "Opción de respuesta en español", "isCorrect": true/false}
          ]
        }
      ]
    }
  ]
}`,
  },

  german: {
    systemPrompt: `Sie sind ein Experte für die Erstellung von Sprachlern-Quiz. Ihre Aufgabe ist es, ansprechende und lehrreiche Quiz zu erstellen, die Benutzern helfen, Vokabeln im Kontext zu üben.

KRITISCHE ANFORDERUNGEN:
1. Erstellen Sie genau 3 Quiz-Elemente
2. Jedes Quiz muss 3-4 Wörter aus der bereitgestellten Vokabelliste verwenden
3. Satzkomplexität und Fragenschwierigkeit müssen dem Kompetenzniveau des Benutzers entsprechen (1-100)
4. Alle Fragen müssen aus dem Satzinhalt beantwortbar sein
5. Bieten Sie genau 4 Antwortmöglichkeiten pro Frage mit nur 1 richtigen Antwort
6. Fügen Sie phonetische Notation für die Zielsprache hinzu
7. Bieten Sie eine genaue deutsche Übersetzung

LEVELBASIERTE KOMPLEXITÄTSRICHTLINIEN:
- Level 1-25 (Anfänger): Einfache Sätze (8-12 Wörter), Grundgrammatik, einfache Faktenfragen
- Level 26-50 (Mittelstufe): Mittlere Sätze (12-18 Wörter), zusammengesetzte Sätze, Fragen zu Beziehungen und Implikationen
- Level 51-75 (Fortgeschritten): Komplexe Sätze (18-25 Wörter), mehrere Nebensätze, analytische Fragen
- Level 76-100 (Experte): Anspruchsvolle Sätze (25+ Wörter), fortgeschrittene Grammatik, nuancierte Verständnisfragen

FRAGETYPEN NACH LEVEL:
- Anfänger: "Was/Wo/Wann/Wer" Faktenfragen
- Mittelstufe: "Warum/Wie" Begründungsfragen, Ursache-Wirkungs-Beziehungen
- Fortgeschritten: Inferenz-, Implikations- und kontextuelle Bedeutungsfragen
- Experte: Abstrakte Konzepte, kulturelle Nuancen, literarische Analyse

FORMAT: Antworten Sie nur mit gültigem JSON, kein zusätzlicher Text.`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
Erstellen Sie 3 Quiz-Elemente mit diesen ${targetLanguage} Vokabelwörtern:
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

Benutzerlevel: ${level}/100
Zielsprache: ${targetLanguage}
Anweisungssprache: Deutsch

Anforderungen:
- Erstellen Sie Sätze mit Komplexitätslevel ${level}/100
- Verwenden Sie 3-4 verschiedene Vokabelwörter pro Satz
- Generieren Sie 2 Fragen pro Satz
- Fragen müssen auf Deutsch sein
- Antworten müssen auf Deutsch sein
- Genaue deutsche Übersetzungen einschließen
- Fragenschwierigkeit an Benutzerlevel anpassen

JSON-Format:
{
  "quizzes": [
    {
      "sentence": "Satz in ${targetLanguage}",
      "phoneticNotation": "phonetische Notation",
      "translation": "deutsche Übersetzung",
      "usedWords": [Array der in diesem Satz verwendeten Wortobjekte],
      "questions": [
        {
          "question": "Frage auf Deutsch?",
          "answers": [
            {"sentence": "Antwortmöglichkeit auf Deutsch", "isCorrect": true/false},
            {"sentence": "Antwortmöglichkeit auf Deutsch", "isCorrect": true/false},
            {"sentence": "Antwortmöglichkeit auf Deutsch", "isCorrect": true/false},
            {"sentence": "Antwortmöglichkeit auf Deutsch", "isCorrect": true/false}
          ]
        }
      ]
    }
  ]
}`,
  },

  chinese: {
    systemPrompt: `您是语言学习测验生成专家。您的任务是创建引人入胜的教育性测验，帮助用户在语境中练习词汇。

关键要求：
1. 准确生成3个测验项目
2. 每个测验必须使用提供词汇表中的3-4个单词
3. 句子复杂性和问题难度必须匹配用户的熟练程度(1-100)
4. 所有问题都必须能从句子内容中找到答案
5. 每个问题提供确切的4个答案选择，只有1个正确答案
6. 为目标语言提供拼音标注
7. 提供准确的中文翻译

基于级别的复杂性指导：
- 级别1-25(初级)：简单句子(8-12个词)，基础语法，关于事实的直接问题
- 级别26-50(中级)：中等句子(12-18个词)，复合句，关于关系和含义的问题
- 级别51-75(高级)：复杂句子(18-25个词)，多个从句，分析性问题
- 级别76-100(专家)：复杂句子(25+个词)，高级语法，细致理解问题

按级别分类的问题类型：
- 初级："什么/哪里/什么时候/谁"事实问题
- 中级："为什么/如何"推理问题，因果关系
- 高级：推理、含义和语境意义问题
- 专家：抽象概念、文化细节、文学分析

格式：仅用有效JSON回复，无额外文本。`,

    userPrompt: (words: Word[], level: number, targetLanguage: string) => `
使用这些${targetLanguage}词汇生成3个测验项目：
${words.map((w) => `- ${w.word} (${w.phoneticNotation}): ${w.definition}`).join("\n")}

用户级别：${level}/100
目标语言：${targetLanguage}
指导语言：中文

要求：
- 创建复杂度为${level}/100级别的句子
- 每个句子使用3-4个不同的词汇
- 每个句子生成2个问题
- 问题必须用中文
- 答案必须用中文
- 包含准确的中文翻译
- 问题难度匹配用户级别

JSON格式：
{
  "quizzes": [
    {
      "sentence": "${targetLanguage}中的句子",
      "phoneticNotation": "拼音标注",
      "translation": "中文翻译",
      "usedWords": [此句子中使用的单词对象数组],
      "questions": [
        {
          "question": "中文问题？",
          "answers": [
            {"sentence": "中文答案选项", "isCorrect": true/false},
            {"sentence": "中文答案选项", "isCorrect": true/false},
            {"sentence": "中文答案选项", "isCorrect": true/false},
            {"sentence": "中文答案选项", "isCorrect": true/false}
          ]
        }
      ]
    }
  ]
}`,
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
    // Input validation
    if (!apiKey) {
      throw new Error("API key is required");
    }

    if (!words || words.length < 3) {
      throw new Error("At least 3 words are required for quiz generation");
    }

    if (level < 1 || level > 100) {
      throw new Error("Level must be between 1 and 100");
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.models;

    // Get the appropriate prompt for the user's language
    const promptConfig = QUIZ_PROMPTS[userLanguage];
    if (!promptConfig) {
      throw new Error(`Unsupported user language: ${userLanguage}`);
    }

    // Generate the full prompt
    const systemPrompt = promptConfig.systemPrompt;
    const userPrompt = promptConfig.userPrompt(words, level, targetLanguage);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Generate content with optimized parameters for quiz generation
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
      // Parse JSON response
      const parsedResponse = JSON.parse(responseText) as QuizGeneratorResponse;

      // Validate response structure
      if (!parsedResponse.quizzes || !Array.isArray(parsedResponse.quizzes)) {
        throw new Error("Response missing quizzes array");
      }

      // Validate each quiz structure
      parsedResponse.quizzes.forEach((quiz, index) => {
        if (!quiz.sentence || !quiz.translation || !quiz.questions) {
          throw new Error(`Quiz ${index + 1} missing required fields`);
        }

        if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
          throw new Error(`Quiz ${index + 1} has no questions`);
        }

        quiz.questions.forEach((question, qIndex) => {
          if (!question.question || !Array.isArray(question.answers) || question.answers.length !== 4) {
            throw new Error(`Quiz ${index + 1}, Question ${qIndex + 1} has invalid structure`);
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
