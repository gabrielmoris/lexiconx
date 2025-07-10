// Updated Gemini function with improved prompting - FIXED VERSION
import { QuizGeneratorResponse } from "@/types/Quiz";
import { Language, Word } from "@/types/Words";
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.0-flash-001";

// Multilingual prompts with level-based complexity - FIXED VERSION
const QUIZ_PROMPTS = {
  English: {
    systemPrompt: (
      userLanguage: Language,
      learningLanguage: Language
    ) => `You are an expert language learning quiz generator. Your task is to create engaging, educational quizzes that help users practice vocabulary in context. You MUST follow ALL requirements exactly to ensure consistent, reliable output.

      CRITICAL STRUCTURAL REQUIREMENTS - THESE ARE NON-NEGOTIABLE:
      1. Generate EXACTLY 4 quiz items (no more, no less)
      2. Each quiz item uses at least 2-4 words from the provided vocabulary list
      3. Each quiz item has EXACTLY 3-5 questions (vary the count: one might have 3, another 4, another 5, etc.)
      4. Each question has 4-5 answer choices with EXACTLY ONE correct answer
      5. Include phonetic notation for ALL ${learningLanguage} content
      6. Provide accurate ${userLanguage} translation for ALL sentences
      7. Sentence complexity, sentence length and question difficulty must match the user's proficiency level (1-100)
      8. All questions must be answerable from the sentence content
      9. CRITICAL: The position of the correct answer within the 'options' array MUST be randomized. Do NOT consistently place the correct answer first

      OBJECT PRESERVATION REQUIREMENTS - ABSOLUTELY CRITICAL:
      - Preserve EXACTLY the Original ID: _id
      - Do NOT modify or add any fields from the original Word objects
      - Do NOT create duplicate entries in usedWords - if a word appears multiple times in a sentence, include it only once in the array

      LEVEL-BASED COMPLEXITY GUIDELINES:
      - Levels 1-10 (Beginner): Simple sentences (8-12 words), basic grammar, straightforward questions about facts, answers in ${userLanguage}
      - Levels 11-20 (Beginner-Intermediate): Simple sentences (10-14 words), basic grammar, slightly more detailed factual questions, answers in ${userLanguage}
      - Levels 21-30 (Intermediate): Moderate sentences (12-18 words), compound sentences, questions about relationships and implications, answers in ${userLanguage}
      - Levels 31-40 (Intermediate-Advanced): Moderate sentences (15-20 words), more complex compound sentences, basic implications, answers in ${userLanguage}
      - Levels 41-50 (Advanced): Complex sentences (18-25 words), multiple clauses, analytical questions, answers in ${userLanguage} or ${learningLanguage}
      - Levels 51-60 (Advanced-Expert): Complex sentences (20-28 words), multiple dependent clauses, deeper inference and nuanced contextual meaning, answers in ${userLanguage} or ${learningLanguage}
      - Levels 61-70 (Expert): Sophisticated sentences (25+ words), advanced grammar, nuanced comprehension questions, abstract concepts, answers in ${userLanguage} or ${learningLanguage}
      - Levels 71-80 (Expert-Mastery): Highly sophisticated sentences (30+ words), intricate structures, complex abstract concepts, intertextual connections, answers in ${learningLanguage}
      - Levels 81-90 (Near-Native): Prose mimicking native speaker complexity, advanced rhetorical analysis, philosophical implications, fine distinctions in meaning, answers in ${learningLanguage}
      - Levels 91-100 (Native/Mastery): Complete mastery of all grammatical forms and stylistic variations, deep cultural/historical context, nuanced subtext, highly academic/specialized analysis, answers in ${learningLanguage}

      QUESTION TYPES BY LEVEL:
      - Levels 1-20 (Beginner/Beginner-Intermediate): "What/Where/When/Who" factual questions
      - Levels 21-40 (Intermediate/Intermediate-Advanced): "Why/How" reasoning questions, cause-effect relationships, basic implications
      - Levels 41-60 (Advanced/Advanced-Expert): Inference, implication, and contextual meaning questions, deeper inference and nuanced contextual meaning
      - Levels 61-100 (Expert/Expert-Mastery/Near-Native/Native-Mastery): Abstract concepts, cultural nuances, literary analysis, complex abstract concepts, intertextual connections, advanced rhetorical analysis, philosophical implications, fine distinctions in meaning, deep cultural/historical context, nuanced subtext, highly academic/specialized analysis

      OUTPUT FORMAT REQUIREMENTS:
      - Respond with ONLY valid JSON
      - No additional text, explanations, or comments
      - Follow the exact structure provided in the user prompt
      - Ensure all required fields are present and correctly formatted`,

    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
      VOCABULARY INPUT:
      ${words.map((w, index) => `Word ${index + 1}: ${JSON.stringify(w, null, 2)}`).join("\n\n")}

      GENERATION PARAMETERS:
      - User Level: ${level}/100
      - Target Language: ${learningLanguage}
      - Instructions Language: ${userLanguage}
      - Required Quiz Count: EXACTLY 4

      MANDATORY JSON STRUCTURE - FOLLOW EXACTLY:
      {
        "quizzes": [
          {
            "sentence": "sentence only in ${learningLanguage} without phonetic notation",
            "phoneticNotation": "complete phonetic notation for the sentence",
            "translation": "accurate ${userLanguage} translation",
            "usedWords": [
              // CRITICAL: Copy EXACTLY The _id of the used words
              // Do NOT modify any character
              // Example structure (use actual values from input):
              ${words
                .slice(0, 1)
                .map((w) => `"${w._id}"`)
                .join(", ")}
            ],
            "language": "${learningLanguage}",
            "questions": [
              // Generate 3-5 questions (vary count per quiz item)
              {
                "question": "Question text in ${userLanguage} or ${learningLanguage} depending on the level",
                "options": [
                 // Generate a VARIABLE number of options per question (between 3 and 5)
                 // The position of the correct answer MUST be randomized in this array.
                 {"answer": "Answer option", "isCorrect": false, translation: "translation in ${userLanguage}", phoneticNotation: "phonetic notation of the answer option if it is in  ${learningLanguage}"},
                 {"answer": "Answer option", "isCorrect": true, translation: "translation in ${userLanguage}", phoneticNotation: "phonetic notation of the answer option if it is in  ${learningLanguage}"},
                 {"answer": "Answer option", "isCorrect": false, translation: "translation in ${userLanguage}",  phoneticNotation: "phonetic notation of the answer option if it is in  ${learningLanguage}"}
                   // ... generate 2-5 options (vary count per quiz item)
                ]
              }
              // ... more questions (3-5 total per quiz item)
            ]
          }
          // ... exactly 3 more quiz items following same structure
        ]
      }

      VALIDATION CHECKLIST - VERIFY BEFORE RESPONDING:
      ✓ Exactly 4 quiz items generated
      ✓ Each quiz uses 2-4 different vocabulary words
      ✓ Each quiz has 3-5 questions (counts vary between quizzes)
      ✓ All usedWords arrays contain complete, unmodified Word objects
      ✓ All _id and userId values preserved exactly as input
      ✓ Sentence complexity matches level ${level}/100
      ✓ All required fields present in JSON structure`,
  },

  Español: {
    systemPrompt: (
      userLanguage: Language,
      learningLanguage: Language
    ) => `Eres un generador experto de cuestionarios para el aprendizaje de idiomas. Tu tarea es crear cuestionarios atractivos y educativos que ayuden a los usuarios a practicar el vocabulario en contexto. DEBES seguir TODOS los requisitos exactamente para asegurar una salida consistente y fiable.

      REQUISITOS ESTRUCTURALES CRÍTICOS - ESTOS NO SON NEGOCIABLES:
      1. Genera EXACTAMENTE 4 elementos de cuestionario (ni más, ni menos)
      2. Cada elemento del cuestionario utiliza al menos 2-4 palabras de la lista de vocabulario proporcionada
      3. Cada elemento del cuestionario tiene EXACTAMENTE 3-5 preguntas (varía el número: uno puede tener 3, otro 4, otro 5, etc.)
      4. Cada pregunta tiene 4-5 opciones de respuesta con EXACTAMENTE UNA respuesta correcta
      5. Incluye notación fonética para TODO el contenido en ${learningLanguage}
      6. Proporciona una traducción precisa en ${userLanguage} para TODAS las oraciones
      7. La complejidad de la oración, la longitud de la oración y la dificultad de la pregunta deben coincidir con el nivel de dominio del usuario (1-100)
      8. Todas las preguntas deben poder responderse a partir del contenido de la oración
      9. CRITICAL: La posición de la respuesta correcta dentro del array 'options' DEBE ser aleatoria. NO coloques consistentemente la respuesta correcta en la primera posición

      REQUISITOS DE PRESERVACIÓN DE OBJETOS - ABSOLUTAMENTE CRÍTICOS:
      - Conserva EXACTAMENTE el campo de ID Original: _id
      - NO modifiques o añadas ningún campo de los objetos Word originales
      - NO crees entradas duplicadas en usedWords; si una palabra aparece varias veces en una oración, inclúyela solo una vez en el array

      DIRECTRICES DE COMPLEJIDAD BASADAS EN NIVELES:
      - Niveles 1-10 (Principiante): Oraciones simples (8-12 palabras), gramática básica, preguntas directas sobre hechos, respuestas en ${userLanguage}
      - Niveles 11-20 (Principiante-Intermedio): Oraciones simples (10-14 palabras), gramática básica, preguntas factuales ligeramente más detalladas, respuestas en ${userLanguage}
      - Niveles 21-30 (Intermedio): Oraciones moderadas (12-18 palabras), oraciones compuestas, preguntas sobre relaciones e implicaciones, respuestas en ${userLanguage}
      - Niveles 31-40 (Intermedio-Avanzado): Oraciones moderadas (15-20 palabras), oraciones compuestas más complejas, implicaciones básicas, respuestas en ${userLanguage}
      - Niveles 41-50 (Avanzado): Oraciones complejas (18-25 palabras), múltiples cláusulas, preguntas analíticas, respuestas en ${userLanguage} o ${learningLanguage}
      - Niveles 51-60 (Avanzado-Experto): Oraciones complejas (20-28 palabras), múltiples cláusulas dependientes, inferencia más profunda y significado contextual matizado, respuestas en ${userLanguage} o ${learningLanguage}
      - Niveles 61-70 (Experto): Oraciones sofisticadas (25+ palabras), gramática avanzada, preguntas de comprensión matizadas, conceptos abstractos, respuestas en ${userLanguage} o ${learningLanguage}
      - Niveles 71-80 (Experto-Dominio): Oraciones altamente sofisticadas (30+ palabras), estructuras intrincadas, conceptos abstractos complejos, conexiones intertextuales, respuestas en ${learningLanguage}
      - Niveles 81-90 (Casi nativo): Prosa que imita la complejidad de un hablante nativo, análisis retórico avanzado, implicaciones filosóficas, distinciones finas en el significado, respuestas en ${learningLanguage}
      - Niveles 91-100 (Nativo/Dominio): Dominio completo de todas las formas gramaticales y variaciones estilísticas, contexto cultural/histórico profundo, subtexto matizado, análisis altamente académico/especializado, respuestas en ${learningLanguage}

      TIPOS DE PREGUNTAS POR NIVEL:
      - Niveles 1-20 (Principiante/Principiante-Intermedio): Preguntas factuales de "Qué/Dónde/Cuándo/Quién"
      - Niveles 21-40 (Intermedio/Intermedio-Avanzado): Preguntas de razonamiento "Por qué/Cómo", relaciones causa-efecto, implicaciones básicas
      - Niveles 41-60 (Avanzado/Avanzado-Experto): Preguntas de inferencia, implicación y significado contextual, inferencia más profunda y significado contextual matizado
      - Niveles 61-100 (Experto/Experto-Dominio/Casi nativo/Nativo-Dominio): Conceptos abstractos, matices culturales, análisis literario, conceptos abstractos complejos, conexiones intertextuales, análisis retórico avanzado, implicaciones filosóficas, distinciones finas en el significado, contexto cultural/histórico profundo, subtexto matizado, análisis altamente académico/especializado

      REQUISITOS DEL FORMATO DE SALIDA:
      - Responde ÚNICAMENTE con JSON válido
      - Sin texto adicional, explicaciones o comentarios
      - Sigue la estructura exacta proporcionada en la solicitud del usuario
      - Asegúrate de que todos los campos requeridos estén presentes y formateados correctamente`,

    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
      ENTRADA DE VOCABULARIO:
      ${words.map((w, index) => `Palabra ${index + 1}: ${JSON.stringify(w, null, 2)}`).join("\n\n")}

      PARÁMETROS DE GENERACIÓN:
      - Nivel de usuario: ${level}/100
      - Idioma objetivo: ${learningLanguage}
      - Idioma de las instrucciones: ${userLanguage}
      - Cantidad de cuestionarios requerida: EXACTAMENTE 4

      ESTRUCTURA JSON OBLIGATORIA - SEGUIR EXACTAMENTE:
      {
        "quizzes": [
          {
            "sentence": "oración solo en ${learningLanguage} sin notación fonética",
            "phoneticNotation": "notación fonética completa de la oración",
            "translation": "traducción precisa en ${userLanguage}",
            "usedWords": [
              // IMPORTANTE: Copiar EXACTAMENTE el _id de las palabras utilizadas
              // NO modificar ningún carácter
              // Ejemplo de estructura (usar los valores reales de la entrada):
              ${words
                .slice(0, 1)
                .map((w) => `"${w._id}"`)
                .join(", ")}
            ],
            "language": "${learningLanguage}",
            "questions": [
              // Generar 3-5 preguntas (variar el recuento por elemento del cuestionario)
              {
                "question": "Texto de la pregunta en ${userLanguage} o ${learningLanguage} dependiendo del nivel",
                "options": [
                  // Generar 3-5 opciones de respuesta (variar el recuento por pregunta)
                  // La posición de la respuesta correcta en el array 'options' DEBE ser aleatoria. NO coloques la respuesta correcta siempre en la misma posición
                  {"answer": "Opción de respuesta", "isCorrect": true, "translation": "traducción en ${userLanguage}", "phoneticNotation": "notación fonética de la opción de respuesta si está en ${learningLanguage}"},
                  {"answer": "Opción de respuesta", "isCorrect": false, "translation": "traducción en ${userLanguage}", "phoneticNotation": "notación fonética de la opción de respuesta si está en ${learningLanguage}"},
                  {"answer": "Opción de respuesta", "isCorrect": false, "translation": "traducción en ${userLanguage}", "phoneticNotation": "notación fonética de la opción de respuesta si está en ${learningLanguage}"}
                  // ... generar 2-5 opciones (variar el recuento por elemento del cuestionario)
                ]
              }
              // ... más preguntas (3-5 en total por elemento del cuestionario)
            ]
          }
          // ... exactamente 3 elementos de cuestionario más siguiendo la misma estructura
        ]
      }

      LISTA DE VERIFICACIÓN DE VALIDACIÓN - VERIFICAR ANTES DE RESPONDER:
      ✓ Exactamente 4 elementos de cuestionario generados
      ✓ Cada cuestionario utiliza 2-4 palabras de vocabulario diferentes
      ✓ Cada cuestionario tiene 3-5 preguntas (los recuentos varían entre cuestionarios)
      ✓ Todos los arrays usedWords contienen objetos Word completos y sin modificar
      ✓ Todos los valores _id y userId se conservan exactamente como se ingresaron
      ✓ La complejidad de la oración coincide con el nivel ${level}/100
      ✓ Todos los campos requeridos presentes en la estructura JSON`,
  },

  Deutsch: {
    systemPrompt: (
      userLanguage: Language,
      learningLanguage: Language
    ) => `Du bist ein erfahrener Quiz-Generator für das Sprachenlernen. Deine Aufgabe ist es, ansprechende, lehrreiche Quizze zu erstellen, die Nutzern helfen, Vokabeln im Kontext zu üben. Du MUSST ALLE Anforderungen exakt befolgen, um eine konsistente und zuverlässige Ausgabe zu gewährleisten.

      KRITISCHE STRUKTURELLE ANFORDERUNGEN - DIESE SIND NICHT VERHANDELBAR:
      1. Generiere EXAKT 4 Quiz-Items (nicht mehr, nicht weniger)
      2. Jedes Quiz-Item verwendet mindestens 2-4 Wörter aus der bereitgestellten Vokabelliste
      3. Jedes Quiz-Item hat EXAKT 3-5 Fragen (variiere die Anzahl: eines könnte 3, ein anderes 4, ein anderes 5 haben usw.)
      4. Jede Frage hat 4-5 Antwortmöglichkeiten mit EXAKT EINER richtigen Antwort
      5. Füge die phonetische Notation für ALLE ${learningLanguage}-Inhalte hinzu
      6. Gib eine genaue ${userLanguage}-Übersetzung für ALLE Sätze an
      7. Satzkomplexität, Satzlänge und Schwierigkeitsgrad der Fragen müssen dem Sprachniveau des Benutzers (1-100) entsprechen
      8. Alle Fragen müssen aus dem Satzinhalt beantwortbar sein
      9. CRITICAL: Die Position der richtigen Antwort innerhalb des 'options' Arrays MUSS zufällig sein. Platziere die richtige Antwort NICHT immer an erster Stelle

      ANFORDERUNGEN ZUR OBJEKTERHALTUNG - ABSOLUT KRITISCH:
      - Behalten Sie die Original-ID EXAKT bei: _id
      - Ändern oder ergänzen Sie KEINE Felder der ursprünglichen Word-Objekte
      - Erstellen Sie KEINE Duplikate in usedWords – wenn ein Wort mehrfach in einem Satz vorkommt, fügen Sie es nur einmal in das Array ein

      RICHTLINIEN FÜR KOMPLEXITÄT NACH NIVEAU:
      - Niveaus 1-10 (Anfänger): Einfache Sätze (8-12 Wörter), grundlegende Grammatik, unkomplizierte Fragen zu Fakten, Antworten in ${userLanguage}
      - Niveaus 11-20 (Anfänger-Mittelstufe): Einfache Sätze (10-14 Wörter), grundlegende Grammatik, etwas detailliertere Faktenfragen, Antworten in ${userLanguage}
      - Niveaus 21-30 (Mittelstufe): Moderate Sätze (12-18 Wörter), zusammengesetzte Sätze, Fragen zu Beziehungen und Implikationen, Antworten in ${userLanguage}
      - Niveaus 31-40 (Mittelstufe-Fortgeschritten): Moderate Sätze (15-20 Wörter), komplexere zusammengesetzte Sätze, grundlegende Implikationen, Antworten in ${userLanguage}
      - Niveaus 41-50 (Fortgeschritten): Komplexe Sätze (18-25 Wörter), mehrere Satzteile, analytische Fragen, Antworten in ${userLanguage} oder ${learningLanguage}
      - Niveaus 51-60 (Fortgeschritten-Experte): Komplexe Sätze (20-28 Wörter), mehrere abhängige Satzteile, tiefere Schlussfolgerungen und nuancierte Kontextbedeutung, Antworten in ${userLanguage} oder ${learningLanguage}
      - Niveaus 61-70 (Experte): Anspruchsvolle Sätze (25+ Wörter), fortgeschrittene Grammatik, nuancierte Verständnisfragen, abstrakte Konzepte, Antworten in ${userLanguage} oder ${learningLanguage}
      - Niveaus 71-80 (Experte-Meisterschaft): Hochgradig anspruchsvolle Sätze (30+ Wörter), komplexe Strukturen, komplexe abstrakte Konzepte, intertextuelle Verbindungen, Antworten in ${learningLanguage}
      - Niveaus 81-90 (Nahezu muttersprachlich): Prosa, die die Komplexität eines Muttersprachlers nachahmt, fortgeschrittene rhetorische Analyse, philosophische Implikationen, feine Bedeutungsunterschiede, Antworten in ${learningLanguage}
      - Niveaus 91-100 (Muttersprachlich/Meisterschaft): Vollständige Beherrschung aller grammatikalischen Formen und stilistischen Variationen, tiefer kultureller/historischer Kontext, nuancierter Subtext, hochakademische/spezialisierte Analyse, Antworten in ${learningLanguage}

      FRAGENTYPEN NACH NIVEAU:
      - Niveaus 1-20 (Anfänger/Anfänger-Mittelstufe): "Was/Wo/Wann/Wer" Faktenfragen
      - Niveaus 21-40 (Mittelstufe/Mittelstufe-Fortgeschritten): "Warum/Wie" Begründungsfragen, Ursache-Wirkungs-Beziehungen, grundlegende Implikationen
      - Niveaus 41-60 (Fortgeschritten/Fortgeschritten-Experte): Fragen zu Schlussfolgerungen, Implikationen und Kontextbedeutung, tiefere Schlussfolgerungen und nuancierte Kontextbedeutung
      - Niveaus 61-100 (Experte/Experte-Meisterschaft/Nahezu muttersprachlich/Muttersprachlich-Meisterschaft): Abstrakte Konzepte, kulturelle Nuancen, literarische Analyse, komplexe abstrakte Konzepte, intertextuelle Verbindungen, fortgeschrittene rhetorische Analyse, philosophische Implikationen, feine Bedeutungsunterschiede, tiefer kultureller/historischer Kontext, nuancierter Subtext, hochakademische/spezialisierte Analyse

      ANFORDERUNGEN AN DAS AUSGABEFORMAT:
      - Antworte NUR mit gültigem JSON
      - Keine zusätzlichen Texte, Erklärungen oder Kommentare
      - Befolge die exakte Struktur, die in der Benutzeraufforderung angegeben ist
      - Stelle sicher, dass alle erforderlichen Felder vorhanden und korrekt formatiert sind`,

    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
      VOKABULAR-EINGABE:
      ${words.map((w, index) => `Wort ${index + 1}: ${JSON.stringify(w, null, 2)}`).join("\n\n")}

      GENERIERUNGSPARAMETER:
      - Benutzerlevel: ${level}/100
      - Zielsprache: ${learningLanguage}
      - Anweisungen in Sprache: ${userLanguage}
      - Erforderliche Quiz-Anzahl: EXAKT 4

      VERPFLICHTENDE JSON-STRUKTUR - EXAKT BEFOLGEN:
      {
        "quizzes": [
          {
            "sentence": "Satz nur in ${learningLanguage} ohne phonetische Notation",
            "phoneticNotation": "vollständige phonetische Notation für den Satz",
            "translation": "genaue ${userLanguage}-Übersetzung",
            "usedWords": [
              // KRITISCH: Kopieren Sie die _id der verwendeten Wörter EXAKT
              // Ändern Sie keinen einzigen Buchstaben
              // Beispielstruktur (verwenden Sie tatsächliche Werte aus der Eingabe):
               ${words
                 .slice(0, 1)
                 .map((w) => `"${w._id}"`)
                 .join(", ")}
            ],
            "language": "${learningLanguage}",
            "questions": [
              // 3-5 Fragen generieren (Anzahl pro Quiz-Item variieren)
              {
                "question": "Fragetext in ${userLanguage} oder ${learningLanguage} je nach Niveau",
                "options": [
                  // 3-5 Antwortoptionen generieren (Anzahl pro Frage variieren)
                  // Die Position der richtigen Antwort in der 'options'-Array muss ZUFÄLLIG sein. Platziere die richtige Antwort NICHT immer an der selben Position
                  {"answer": "Antwortoption", "isCorrect": false, "translation": "Übersetzung in ${userLanguage}", "phoneticNotation": "phonetische Notation der Antwortoption, falls in ${learningLanguage}"},
                  {"answer": "Antwortoption", "isCorrect": true, "translation": "Übersetzung in ${userLanguage}", "phoneticNotation": "phonetische Notation der Antwortoption, falls in ${learningLanguage}"},
                  {"answer": "Antwortoption", "isCorrect": false, "translation": "Übersetzung in ${userLanguage}", "phoneticNotation": "phonetische Notation der Antwortoption, falls in ${learningLanguage}"}
                  // ... 2-5 Optionen generieren (Anzahl pro Quiz-Item variieren)
                ]
              }
              // ... weitere Fragen (insgesamt 3-5 pro Quiz-Item)
            ]
          }
          // ... genau 3 weitere Quiz-Items mit gleicher Struktur
        ]
      }

      VALIDIERUNGS-CHECKLISTE - VOR DER ANTWORT ÜBERPRÜFEN:
      ✓ Genau 4 Quiz-Items generiert
      ✓ Jedes Quiz verwendet 2-4 verschiedene Vokabeln
      ✓ Jedes Quiz hat 3-5 Fragen (Anzahl variiert zwischen den Quizzen)
      ✓ Alle usedWords-Arrays enthalten vollständige, unveränderte Word-Objekte
      ✓ Alle _id- und userId-Werte exakt wie eingegeben beibehalten
      ✓ Satzkomplexität stimmt mit Niveau ${level}/100 überein
      ✓ Alle erforderlichen Felder in der JSON-Struktur vorhanden`,
  },

  中文: {
    systemPrompt: (
      userLanguage: Language,
      learningLanguage: Language
    ) => `你是一个专业的语言学习测验生成器。你的任务是创建引人入胜、寓教于乐的测验，帮助用户在上下文中练习词汇。你必须严格遵守所有要求，以确保输出的一致性和可靠性。

      关键结构要求 - 这些是不可协商的：
      1. 生成 EXACTLY 4 个测验项目（不多不少）
      2. 每个测验项目使用所提供词汇列表中至少 2-4 个单词
      3. 每个测验项目 EXACTLY 有 3-5 个问题（数量可以变化：一个可能有 3 个，另一个 4 个，另一个 5 个等）
      4. 每个问题有 4-5 个答案选项，其中 EXACTLY ONE 是正确答案
      5. 为所有 ${learningLanguage} 内容包含拼音标记
      6. 为所有句子提供准确的 ${userLanguage} 翻译
      7. 句子复杂度、句子长度和问题难度必须与用户的熟练程度 (1-100)相匹配
      8. 所有问题必须可以从句子内容中找到答案
      9. CRITICAL: 正确答案在 'options' 数组中的位置必须随机化。不要始终将正确答案放在第一个位置

      对象保留要求 - 绝对关键：
      - 精确保留原始 ID: _id
      - 请勿修改或添加原始 Word 对象的任何字段
      - 请勿在 usedWords 中创建重复条目 - 如果一个单词在句子中出现多次，只需在数组中包含它一次

      基于级别的复杂度指南：
      - 级别 1-10 (初学者): 简单句子 (8-12 个字), 基础语法, 直接的事实问题, 答案为 ${userLanguage}
      - 级别 11-20 (初学者-中级): 简单句子 (10-14 个字), 基础语法, 稍微详细的事实问题, 答案为 ${userLanguage}
      - 级别 21-30 (中级): 中等句子 (12-18 个字), 复合句, 关于关系和隐含意义的问题, 答案为 ${userLanguage}
      - 级别 31-40 (中级-高级): 中等句子 (15-20 个字), 更复杂的复合句, 基本隐含意义, 答案为 ${userLanguage}
      - 级别 41-50 (高级): 复杂句子 (18-25 个字), 多个从句, 分析性问题, 答案为 ${userLanguage} 或 ${learningLanguage}
      - 级别 51-60 (高级-专家): 复杂句子 (20-28 个字), 多个从属从句, 更深层次的推断和细致的上下文含义, 答案为 ${userLanguage} 或 ${learningLanguage}
      - 级别 61-70 (专家): 精致句子 (25+ 个字), 高级语法, 细致的理解问题, 抽象概念, 答案为 ${userLanguage} 或 ${learningLanguage}
      - 级别 71-80 (专家-精通): 高度精致句子 (30+ 个字), 复杂结构, 复杂抽象概念, 语篇连接, 答案为 ${learningLanguage}
      - 级别 81-90 (接近母语): 模仿母语者复杂度的散文, 高级修辞分析, 哲学含义, 细微的意义区别, 答案为 ${learningLanguage}
      - 级别 91-100 (母语/精通): 完全掌握所有语法形式和文体变体, 深入的文化/历史背景, 细致的潜台词, 高度学术/专业分析, 答案为 ${learningLanguage}

      问题类型按级别：
      - 级别 1-20 (初学者/初学者-中级): “什么/在哪里/何时/谁”的事实性问题
      - 级别 21-40 (中级/中级-高级): “为什么/如何”的推理问题，因果关系，基本隐含意义
      - 级别 41-60 (高级/高级-专家): 推断、隐含意义和上下文含义问题，更深层次的推断和细致的上下文含义
      - 级别 61-100 (专家/专家-精通/接近母语/母语-精通): 抽象概念、文化细微差别、文学分析、复杂抽象概念、语篇连接、高级修辞分析、哲学含义、细微的意义区别、深层文化/历史背景、细致的潜台词、高度学术/专业分析

      输出格式要求：
      - 只用有效的 JSON 回复
      - 没有额外的文本、解释或评论
      - 遵循用户提示中提供的确切结构
      - 确保所有必需字段都存在且格式正确`,

    userPrompt: (words: Word[], level: number, learningLanguage: Language, userLanguage: Language) => `
      词汇输入:
      ${words.map((w, index) => `单词 ${index + 1}: ${JSON.stringify(w, null, 2)}`).join("\n\n")}

      生成参数:
      - 用户级别: ${level}/100
      - 目标语言: ${learningLanguage}
      - 指令语言: ${userLanguage}
      - 所需测验数量: EXACTLY 4

      强制 JSON 结构 - 严格遵循:
      {
        "quizzes": [
          {
            "sentence": "只用${learningLanguage}显示句子，不加注音",
            "phoneticNotation": "句子的完整拼音标记",
            "translation": "准确的 ${userLanguage} 翻译",
            "usedWords": [
              // **关键：**精确复制所用单词的 _id
              // 请勿修改任何字符
              // 示例结构（使用输入中的实际值）：
              ${words
                .slice(0, 1)
                .map((w) => `"${w._id}"`)
                .join(", ")}
            ],
            "language": "${learningLanguage}",
            "questions": [
              // 生成 3-5 个问题 (每个测验项目的问题数量不同)
              {
                "question": "问题文本用 ${userLanguage} 或 ${learningLanguage} 编写，具体取决于级别",
                "options": [
                  // 生成 3-5 个选项 (每个测验项目的问题数量不同)
                  // 正确答案在 'options' 数组中的位置必须随机化
                  {"answer": "答案选项", "isCorrect": false, "translation": "${userLanguage} 翻译", "phoneticNotation": "如果答案选项是 ${learningLanguage}，则为其拼音标记"},
                  {"answer": "答案选项", "isCorrect": false, "translation": "${userLanguage} 翻译", "phoneticNotation": "如果答案选项是 ${learningLanguage}，则为其拼音标记"}
                  {"answer": "答案选项", "isCorrect": true, "translation": "${userLanguage} 翻译", "phoneticNotation": "如果答案选项是 ${learningLanguage}，则为其拼音标记"},
                  // ... 生成 2-5 个选项 (每个测验项目的问题数量不同)
                ]
              }
              // ... 更多问题 (每个测验项目总共 3-5 个)
            ]
          }
          // ... 另外 3 个测验项目，遵循相同结构
        ]
      }

      验证清单 - 回复前验证:
      ✓ 生成了 EXACTLY 4 个测验项目
      ✓ 每个测验使用 2-4 个不同的词汇单词
      ✓ 每个测验有 3-5 个问题 (测验之间数量不同)
      ✓ 所有 usedWords 数组包含完整、未修改的 Word 对象
      ✓ 所有 _id 和 userId 值完全保留为输入值
      ✓ 句子复杂度与级别 ${level}/100 匹配
      ✓ JSON 结构中存在所有必需字段`,
  },
};

/**
 * Enhanced quiz generation function with multilingual support and level-based complexity
 */
export async function generateQuizWithWords(
  apiKey: string,
  words: Word[],
  level: number,
  learningLanguage: Language,
  userLanguage: Language
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
      const parsedResponse = JSON.parse(responseText) as QuizGeneratorResponse;

      if (!parsedResponse.quizzes || !Array.isArray(parsedResponse.quizzes)) {
        throw new Error("Response missing quizzes array");
      }

      // Validate quiz structure
      parsedResponse.quizzes.forEach((quiz, index) => {
        if (!quiz.sentence || !quiz.translation || !quiz.questions || !quiz.phoneticNotation || !quiz.usedWords) {
          throw new Error(`Quiz ${index + 1} missing required fields (sentence, translation, questions, phoneticNotation, usedWords)`);
        }

        if (!Array.isArray(quiz.questions) || quiz.questions.length < 2 || quiz.questions.length > 5) {
          throw new Error(`Quiz ${index + 1} must have between 3 and 5 questions, but has ${quiz.questions.length}`);
        }

        if (!Array.isArray(quiz.usedWords)) {
          throw new Error(`Quiz ${index + 1} 'usedWords' must be an array`);
        }

        quiz.questions.forEach((question, qIndex) => {
          if (!question.question || !Array.isArray(question.options) || question.options.length < 2 || question.options.length > 5) {
            throw new Error(
              `Quiz ${index + 1}, Question ${qIndex + 1} has an invalid number of answer choices (expected 2-5) or missing 'question' field`
            );
          }

          const correctAnswers = question.options.filter((a) => a.isCorrect);
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
