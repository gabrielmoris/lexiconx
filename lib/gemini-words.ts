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
    systemPrompt: () =>
      `You are an expert language teacher. Your task is to select and generate new vocabulary words that are appropriate for a user's current proficiency level and are not already known to them. You MUST follow ALL requirements exactly to ensure consistent, reliable output.

        CRITICAL STRUCTURAL REQUIREMENTS - THESE ARE NON-NEGOTIABLE:
        1. Generate EXACTLY 5 new word items (no more, no less).
        2. You MUST NOT generate any words that are present in the 'knownWords' list provided by the user.

        LEVEL-BASED COMPLEXITY GUIDELINES:
        - Levels 1-10 (Beginner): Generate very simple, foundational words (e.g., common nouns, basic verbs, essential greetings). These are typically the first words a person learns in the language.
        - Levels 11-20 (Beginner-Intermediate): Generate basic, commonly used words (e.g., everyday objects, simple actions, common adjectives).
        - Levels 21-30 (Intermediate): Generate more advanced words that are still in common use (e.g., words related to daily routines, simple emotions, common activities).
        - Levels 31-40 (Intermediate-Advanced): Generate more advanced words, including those with slightly more abstract meanings or related to broader topics (e.g., words for expressing opinions, describing processes, common professional terms).
        - Levels 41-50 (Advanced): Generate words suitable for discussing more complex topics, often including words with multiple meanings or nuanced usage. These may include words used in more complex sentence structures.
        - Levels 51-60 (Advanced-Expert): Generate words required for deeper inference and understanding nuanced contextual meaning. These words might be found in more complex sentences with multiple dependent clauses.
        - Levels 61-70 (Expert): Generate sophisticated words used for abstract concepts and nuanced comprehension, suitable for advanced grammar and more complex discussions.
        - Levels 71-80 (Expert-Mastery): Generate highly sophisticated words for intricate structures, complex abstract concepts, and intertextual connections. These words are often found in advanced prose.
        - Levels 81-90 (Near-Native): Generate words that mimic native speaker complexity, including those used for advanced rhetorical analysis, philosophical implications, and fine distinctions in meaning.
        - Levels 91-100 (Native/Mastery): Generate words demonstrating complete mastery of all grammatical forms and stylistic variations, including those related to deep cultural/historical context, nuanced subtext, and highly academic/specialized analysis.

        OUTPUT FORMAT REQUIREMENTS:
        - Respond with ONLY valid JSON.
        - No additional text, explanations, or comments.
        - Follow the exact structure provided in the user prompt.
        - Ensure all required fields are present and correctly formatted.`,

    userPrompt: (knownWords: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
        VOCABULARY GENERATION PARAMETERS:
        - User Level: ${level}/100
        - Target Language: ${learningLanguage}
        - Instructions Language: ${userLanguage}
        - Known Words (words to avoid generating): ${knownWords.map((w) => `"${w.word}"`).join(", ") || "None"}

        MANDATORY JSON STRUCTURE - FOLLOW EXACTLY:
        {
          "words": [
            {
              "word": "word in ${learningLanguage}",
              "definition": "translation in ${userLanguage}",
              "phoneticNotation": "phonetic notation for the word",
              "language": "${learningLanguage}"
            },
            // ... exactly 4 more word items following the same structure
          ]
        }

        VALIDATION CHECKLIST - VERIFY BEFORE RESPONDING:
        ✓ Exactly 4 new word items generated.
        ✓ No generated words are present in the 'knownWords' list.
        ✓ Word complexity matches level ${level}/100.
        ✓ All required fields (word, definition, phoneticNotation, language) are present and correctly formatted for each new word.
        `,
  },
  Español: {
    systemPrompt: () =>
      `Eres un profesor de idiomas experto. Tu tarea es seleccionar y generar nuevas palabras de vocabulario que sean apropiadas para el nivel de competencia actual del usuario y que no sean conocidas por él. DEBES seguir EXACTAMENTE TODOS los requisitos para asegurar una salida consistente y fiable.

        REQUISITOS ESTRUCTURALES CRÍTICOS - ESTOS NO SON NEGOCIABLES:
        1. Genera EXACTAMENTE 5 elementos de nuevas palabras (ni más, ni menos).
        2. NO DEBES generar ninguna palabra que esté presente en la lista 'knownWords' proporcionada por el usuario.

        DIRECTRICES DE COMPLEJIDAD BASADAS EN EL NIVEL:
        - Niveles 1-10 (Principiante): Genera palabras muy simples y fundamentales (ej., sustantivos comunes, verbos básicos, saludos esenciales). Estas son típicamente las primeras palabras que una persona aprende en el idioma.
        - Niveles 11-20 (Principiante-Intermedio): Genera palabras básicas y de uso común (ej., objetos cotidianos, acciones simples, adjetivos comunes).
        - Niveles 21-30 (Intermedio): Genera palabras más avanzadas que todavía son de uso común (ej., palabras relacionadas con rutinas diarias, emociones simples, actividades comunes).
        - Niveles 31-40 (Intermedio-Avanzado): Genera palabras más avanzadas, incluyendo aquellas con significados ligeramente más abstractos o relacionadas con temas más amplios (ej., palabras para expresar opiniones, describir procesos, términos profesionales comunes).
        - Niveles 41-50 (Avanzado): Genera palabras adecuadas para discutir temas más complejos, a menudo incluyendo palabras con múltiples significados o uso matizado. Estas pueden incluir palabras utilizadas en estructuras de oraciones más complejas.
        - Niveles 51-60 (Avanzado-Experto): Genera palabras requeridas para una inferencia más profunda y una comprensión del significado contextual matizado. Estas palabras podrían encontrarse en oraciones más complejas con múltiples cláusulas dependientes.
        - Niveles 61-70 (Experto): Genera palabras sofisticadas utilizadas para conceptos abstractos y comprensión matizada, adecuadas para gramática avanzada y discusiones más complejas.
        - Niveles 71-80 (Experto-Dominio): Genera palabras altamente sofisticadas para estructuras intrincadas, conceptos abstractos complejos y conexiones intertextuales. Estas palabras se encuentran a menudo en prosa avanzada.
        - Niveles 81-90 (Casi nativo): Genera palabras que imitan la complejidad de un hablante nativo, incluyendo aquellas utilizadas para análisis retórico avanzado, implicaciones filosóficas y finas distinciones de significado.
        - Niveles 91-100 (Nativo/Dominio): Genera palabras que demuestran un dominio completo de todas las formas gramaticales y variaciones estilísticas, incluyendo aquellas relacionadas con el contexto cultural/histórico profundo, el subtexto matizado y el análisis altamente académico/especializado.

        REQUISITOS DEL FORMATO DE SALIDA:
        - Responde SOLO con JSON válido.
        - Sin texto adicional, explicaciones o comentarios.
        - Sigue la estructura exacta proporcionada en el prompt del usuario.
        - Asegúrate de que todos los campos requeridos estén presentes y formateados correctamente.`,

    userPrompt: (knownWords: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
        PARÁMETROS DE GENERACIÓN DE VOCABULARIO:
        - Nivel del Usuario: ${level}/100
        - Idioma Objetivo: ${learningLanguage}
        - Idioma de las Instrucciones: ${userLanguage}
        - Palabras Conocidas (palabras a evitar generar): ${knownWords.map((w) => `"${w.word}"`).join(", ") || "Ninguna"}

        ESTRUCTURA JSON OBLIGATORIA - SIGUE EXACTAMENTE:
        {
          "words": [
            {
              "word": "palabra en ${learningLanguage}",
              "definition": "traducción en ${userLanguage}",
              "phoneticNotation": "notación fonética de la palabra",
              "language": "${learningLanguage}"
            },
            // ... exactamente 4 elementos de palabras más siguiendo la misma estructura
          ]
        }

        LISTA DE VERIFICACIÓN DE VALIDACIÓN - VERIFICA ANTES DE RESPONDER:
        ✓ Exactamente 4 elementos de palabras nuevas generados.
        ✓ Ninguna de las palabras generadas está presente en la lista 'knownWords'.
        ✓ La complejidad de la palabra coincide con el nivel ${level}/100.
        ✓ Todos los campos requeridos (word, definition, phoneticNotation, language) están presentes y correctamente formateados para cada nueva palabra.
        `,
  },
  Deutsch: {
    systemPrompt: () =>
      `Sie sind ein erfahrener Sprachlehrer. Ihre Aufgabe ist es, neue Vokabeln auszuwählen und zu generieren, die für das aktuelle Sprachniveau eines Benutzers geeignet sind und ihm noch nicht bekannt sind. Sie MÜSSEN ALLE Anforderungen genau befolgen, um eine konsistente, zuverlässige Ausgabe zu gewährleisten.

        KRITISCHE STRUKTURELLE ANFORDERUNGEN - DIESE SIND NICHT VERHANDELBAR:
        1. Generieren Sie GENAU 5 neue Wortelemente (nicht mehr, nicht weniger).
        2. Sie DÜRFEN KEINE Wörter generieren, die in der vom Benutzer bereitgestellten Liste 'knownWords' vorhanden sind.

        EBENENBASIERTE KOMPLEXITÄTSRICHTLINIEN:
        - Stufen 1-10 (Anfänger): Generieren Sie sehr einfache, grundlegende Wörter (z.B. gängige Substantive, grundlegende Verben, essentielle Begrüßungen). Dies sind typischerweise die ersten Wörter, die eine Person in der Sprache lernt.
        - Stufen 11-20 (Anfänger-Mittelstufe): Generieren Sie grundlegende, häufig verwendete Wörter (z.B. Alltagsgegenstände, einfache Handlungen, gängige Adjektive).
        - Stufen 21-30 (Mittelstufe): Generieren Sie fortgeschrittenere Wörter, die noch gebräuchlich sind (z.B. Wörter im Zusammenhang mit täglichen Routinen, einfachen Emotionen, gängigen Aktivitäten).
        - Stufen 31-40 (Mittelstufe-Fortgeschritten): Generieren Sie fortgeschrittenere Wörter, einschließlich solcher mit etwas abstrakteren Bedeutungen oder Bezug zu breiteren Themen (z.B. Wörter zum Ausdruck von Meinungen, Beschreibung von Prozessen, gängige Fachbegriffe).
        - Stufen 41-50 (Fortgeschritten): Generieren Sie Wörter, die für die Diskussion komplexerer Themen geeignet sind, oft einschließlich Wörtern mit mehreren Bedeutungen oder nuanciertem Gebrauch. Dies können Wörter sein, die in komplexeren Satzstrukturen verwendet werden.
        - Stufen 51-60 (Fortgeschritten-Experte): Generieren Sie Wörter, die für tiefere Schlussfolgerungen und das Verständnis nuancierter kontextueller Bedeutungen erforderlich sind. Diese Wörter könnten in komplexeren Sätzen mit mehreren abhängigen Nebensätzen gefunden werden.
        - Stufen 61-70 (Experte): Generieren Sie anspruchsvolle Wörter, die für abstrakte Konzepte und nuanciertes Verständnis verwendet werden, geeignet für fortgeschrittene Grammatik und komplexere Diskussionen.
        - Stufen 71-80 (Experte-Meisterschaft): Generieren Sie hoch anspruchsvolle Wörter für komplexe Strukturen, komplexe abstrakte Konzepte und intertextuelle Verbindungen. Diese Wörter sind oft in fortgeschrittener Prosa zu finden.
        - Stufen 81-90 (Nahezu muttersprachlich): Generieren Sie Wörter, die die Komplexität eines Muttersprachlers nachahmen, einschließlich solcher, die für fortgeschrittene rhetorische Analyse, philosophische Implikationen und feine Bedeutungsunterschiede verwendet werden.
        - Stufen 91-100 (Muttersprachlich/Meisterschaft): Generieren Sie Wörter, die die vollständige Beherrschung aller grammatischen Formen und stilistischen Variationen demonstrieren, einschließlich solcher, die sich auf tiefen kulturellen/historischen Kontext, nuancierten Subtext und hochakademische/spezialisierte Analyse beziehen.

        ANFORDERUNGEN AN DAS AUSGABEFORMAT:
        - Antworten Sie NUR mit gültigem JSON.
        - Kein zusätzlicher Text, Erklärungen oder Kommentare.
        - Befolgen Sie die genaue Struktur, die im Benutzer-Prompt angegeben ist.
        - Stellen Sie sicher, dass alle erforderlichen Felder vorhanden und korrekt formatiert sind.`,

    userPrompt: (knownWords: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
        PARAMETER FÜR DIE VOKABELGENERIERUNG:
        - Benutzerlevel: ${level}/100
        - Zielsprache: ${learningLanguage}
        - Anweisungssprache: ${userLanguage}
        - Bekannte Wörter (zu vermeidende Wörter): ${knownWords.map((w) => `"${w.word}"`).join(", ") || "Keine"}

        OBLIGATORISCHE JSON-STRUKTUR - GENAU BEFOLGEN:
        {
          "words": [
            {
              "word": "Wort in ${learningLanguage}",
              "definition": "Übersetzung in ${userLanguage}",
              "phoneticNotation": "phonetische Notation des Wortes",
              "language": "${learningLanguage}"
            },
            // ... genau 4 weitere Wortelemente nach derselben Struktur
          ]
        }

        VALIDIERUNGSCHECKLISTE - VOR DEM ANTWORTEN PRÜFEN:
        ✓ Genau 4 neue Wortelemente generiert.
        ✓ Keine der generierten Wörter ist in der Liste 'knownWords' vorhanden.
        ✓ Die Wortkomplexität stimmt mit Level ${level}/100 überein.
        ✓ Alle erforderlichen Felder (word, definition, phoneticNotation, language) sind vorhanden und für jedes neue Wort korrekt formatiert.
        `,
  },
  中文: {
    systemPrompt: () =>
      `您是一位专业的语言教师。您的任务是选择并生成适合用户当前熟练程度且用户尚未掌握的新词汇。您必须严格遵守所有要求，以确保输出的一致性和可靠性。

        关键结构要求 - 这些是不可协商的：
        1. 严格生成 5 个新词汇项（不多不少）。
        2. 您绝不能生成用户提供的“knownWords”列表中已有的任何单词。

        基于级别的复杂性指南：
        - 级别 1-10（初级）：生成非常简单、基础的词汇（例如，常用名词、基本动词、基本问候语）。这些通常是人们在学习该语言时首先学会的词汇。
        - 级别 11-20（初级-中级）：生成基本的、常用词汇（例如，日常物品、简单动作、常用形容词）。
        - 级别 21-30（中级）：生成更高级但仍常用词汇（例如，与日常生活、简单情感、常见活动相关的词汇）。
        - 级别 31-40（中级-高级）：生成更高级的词汇，包括那些具有略微抽象含义或与更广泛主题相关的词汇（例如，表达观点、描述过程、常见专业术语的词汇）。
        - 级别 41-50（高级）：生成适合讨论更复杂主题的词汇，通常包括具有多重含义或细微用法的词汇。这些可能包括在更复杂句子结构中使用的词汇。
        - 级别 51-60（高级-专家）：生成需要更深层次推断和理解细微语境含义的词汇。这些词汇可能出现在包含多个从句的更复杂句子中。
        - 级别 61-70（专家）：生成用于抽象概念和细致理解的复杂词汇，适用于高级语法和更复杂的讨论。
        - 71-80 级（专家-精通）：生成用于复杂结构、复杂抽象概念和文本间联系的高度复杂词汇。这些词汇通常出现在高级散文中。
        - 81-90 级（接近母语）：生成模仿母语者复杂性的词汇，包括用于高级修辞分析、哲学含义和细微意义区分的词汇。
        - 91-100 级（母语/精通）：生成展示对所有语法形式和文体变体完全掌握的词汇，包括与深层文化/历史背景、细微潜台词和高度学术/专业分析相关的词汇。

        输出格式要求：
        - 只响应有效的 JSON。
        - 没有额外的文本、解释或评论。
        - 遵循用户提示中提供的确切结构。
        - 确保所有必填字段都存在并格式正确。`,

    userPrompt: (knownWords: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
        词汇生成参数：
        - 用户级别：${level}/100
        - 目标语言：${learningLanguage}
        - 指令语言：${userLanguage}
        - 已知词汇（要避免生成的词汇）：${knownWords.map((w) => `"${w.word}"`).join(", ") || "无"}

        强制性 JSON 结构 - 严格遵守：
        {
          "words": [
            {
              "word": "用${learningLanguage}表示的单词",
              "definition": "用${userLanguage}表示的翻译",
              "phoneticNotation": "单词的音标",
              "language": "${learningLanguage}"
            },
            // ... 严格按照相同结构再来 4 个单词项
          ]
        }

        验证清单 - 响应前请核实：
        ✓ 严格生成了 4 个新词汇项。
        ✓ 没有生成的词汇出现在“knownWords”列表中。
        ✓ 词汇复杂度与级别 ${level}/100 匹配。
        ✓ 每个新词汇的所有必填字段（word, definition, phoneticNotation, language）都存在且格式正确。
        `,
  },
  русский: {
    systemPrompt: () =>
      `Вы — опытный преподаватель языков. Ваша задача — выбирать и генерировать новые словарные слова, которые соответствуют текущему уровню владения языком пользователя и еще не известны ему. Вы ДОЛЖНЫ строго следовать ВСЕМ требованиям, чтобы обеспечить последовательный и надежный вывод.

        КРИТИЧЕСКИЕ СТРУКТУРНЫЕ ТРЕБОВАНИЯ - ЭТИ ТРЕБОВАНИЯ НЕОБСУЖДАЕМЫ:
        1. Сгенерируйте ТОЧНО 5 новых словарных единиц (не больше, не меньше).
        2. Вы НЕ ДОЛЖНЫ генерировать слова, которые присутствуют в списке 'knownWords', предоставленном пользователем.

        РЕКОМЕНДАЦИИ ПО СЛОЖНОСТИ В ЗАВИСИМОСТИ ОТ УРОВНЯ:
        - Уровни 1-10 (Начинающий): Генерируйте очень простые, базовые слова (например, общие существительные, основные глаголы, основные приветствия). Это, как правило, первые слова, которые человек изучает в языке.
        - Уровни 11-20 (Начинающий-Средний): Генерируйте базовые, часто используемые слова (например, повседневные предметы, простые действия, общие прилагательные).
        - Уровни 21-30 (Средний): Генерируйте более продвинутые слова, которые все еще часто используются (например, слова, связанные с повседневными рутинами, простыми эмоциями, общими видами деятельности).
        - Уровни 31-40 (Средний-Продвинутый): Генерируйте более продвинутые слова, включая те, которые имеют несколько более абстрактные значения или связаны с более широкими темами (например, слова для выражения мнений, описания процессов, общие профессиональные термины).
        - Уровни 41-50 (Продвинутый): Генерируйте слова, подходящие для обсуждения более сложных тем, часто включая слова с несколькими значениями или нюансами использования. Это могут быть слова, используемые в более сложных синтаксических конструкциях.
        - Уровни 51-60 (Продвинутый-Эксперт): Генерируйте слова, необходимые для более глубокого вывода и понимания тонких контекстуальных значений. Эти слова могут встречаться в более сложных предложениях с несколькими зависимыми придаточными предложениями.
        - Уровни 61-70 (Эксперт): Генерируйте сложные слова, используемые для абстрактных понятий и нюансированного понимания, подходящие для продвинутой грамматики и более сложных дискуссий.
        - Уровни 71-80 (Эксперт-Мастерство): Генерируйте высокосложные слова для сложных структур, сложных абстрактных понятий и интертекстуальных связей. Эти слова часто встречаются в продвинутой прозе.
        - Уровни 81-90 (Почти носитель языка): Генерируйте слова, имитирующие сложность носителя языка, включая те, которые используются для продвинутого риторического анализа, философских следствий и тонких различий в значении.
        - Уровни 91-100 (Носитель языка/Мастерство): Генерируйте слова, демонстрирующие полное владение всеми грамматическими формами и стилистическими вариациями, включая те, которые связаны с глубоким культурно-историческим контекстом, тонкими подтекстами и высокоакадемическим/специализированным анализом.

        ТРЕБОВАНИЯ К ФОРМАТУ ВЫВОДА:
        - Отвечайте ТОЛЬКО действительным JSON.
        - Без дополнительного текста, объяснений или комментариев.
        - Следуйте точной структуре, указанной в запросе пользователя.
        - Убедитесь, что все обязательные поля присутствуют и правильно отформатированы.`,

    userPrompt: (knownWords: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
        ПАРАМЕТРЫ ГЕНЕРАЦИИ СЛОВАРЯ:
        - Уровень пользователя: ${level}/100
        - Целевой язык: ${learningLanguage}
        - Язык инструкций: ${userLanguage}
        - Известные слова (слова, которые следует избегать генерировать): ${knownWords.map((w) => `"${w.word}"`).join(", ") || "Нет"}

        ОБЯЗАТЕЛЬНАЯ СТРУКТУРА JSON - СТРОГО СЛЕДОВАТЬ:
        {
          "words": [
            {
              "word": "слово на ${learningLanguage}",
              "definition": "перевод на ${userLanguage}",
              "phoneticNotation": "фонетическая транскрипция слова",
              "language": "${learningLanguage}"
            },
            // ... ровно 4 дополнительных словарных единицы, следующих той же структуре
          ]
        }

        КОНТРОЛЬНЫЙ СПИСОК ВАЛИДАЦИИ - ПРОВЕРЬТЕ ПЕРЕД ОТВЕТОМ:
        ✓ Сгенерировано ровно 4 новых словарных единицы.
        ✓ Ни одно из сгенерированных слов не присутствует в списке 'knownWords'.
        ✓ Сложность слова соответствует уровню ${level}/100.
        ✓ Все обязательные поля (word, definition, phoneticNotation, language) присутствуют и правильно отформатированы для каждого нового слова.
        `,
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

    const systemPrompt = promptConfig.systemPrompt();
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
