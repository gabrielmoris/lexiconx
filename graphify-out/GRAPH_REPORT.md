# Graph Report - lexiconx  (2026-07-05)

## Corpus Check
- 186 files · ~68,989 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 669 nodes · 1346 edges · 40 communities (27 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1ea9fbaf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]

## God Nodes (most connected - your core abstractions)
1. `Language` - 35 edges
2. `connectDB()` - 31 edges
3. `Word` - 30 edges
4. `useToastContext()` - 29 edges
5. `useLanguage()` - 27 edges
6. `_apiHandler()` - 22 edges
7. `compilerOptions` - 17 edges
8. `useAuthGuard()` - 15 edges
9. `LoadingComponent()` - 14 edges
10. `scripts` - 14 edges

## Surprising Connections (you probably didn't know these)
- `DeckCard()` --calls--> `useDecks()`  [EXTRACTED]
  components/Decks/DeckCard.tsx → context/DecksContext.tsx
- `WordChipProps` --references--> `Word`  [EXTRACTED]
  components/Quiz/WordChip.tsx → types/Words.ts
- `WordsContextType` --references--> `Word`  [EXTRACTED]
  context/WordsContext.tsx → types/Words.ts
- `StatsPage()` --calls--> `useAuthGuard()`  [EXTRACTED]
  src/app/[locale]/stats/page.tsx → hooks/useAuthGuard.tsx
- `UseTextToSpeechReturn` --references--> `Language`  [EXTRACTED]
  hooks/useTextToSpeech.tsx → types/Words.ts

## Import Cycles
- 1-file cycle: `src/i18n/navigation.ts -> src/i18n/navigation.ts`
- 1-file cycle: `src/i18n/routing.ts -> src/i18n/routing.ts`
- 1-file cycle: `src/middleware.ts -> src/middleware.ts`

## Communities (40 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (38): AiGenerateVocabulary(), DeckBuilder(), DecksManager(), View, DeleteAccountIcon(), DeleteAccountIconProps, LexiconxLogo(), LexiconxLogoProps (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (37): TextIcon(), TextIconProps, Props, QuizContext, QuizContextType, useQuiz(), correctOption, mockClientQuizzes (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (31): AIClient, AIGenerateContentParams, AIProvider, createAIClient(), FallbackAIClient, createGoogleClient(), createNvidiaClient(), ProviderConfig (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (32): ChinaFlag(), ChinaFlagProps, EnglishFlagProps, GermanFlag(), GermanFlagProps, RussianFlag(), RussianFlagProps, SpanishFlag() (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (41): generateMemoryHooks(), generateWords(), authOptions, JWT, Session, User, getWordCategory(), deckSchema (+33 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (32): 1. Spaced Repetition — Modified SM-2 Algorithm, 2. Interleaved Practice — Smart Quiz Composition, 3. Elaborative Interrogation — Quiz Explanation Fields, 4. Contextual Learning — i+1 Comprehensible Input, 5. Memory Hooks — Keyword Method Mnemonics, 6. Active Recall — Quiz Retrieval Practice, 🔌 API Routes, 🏗 Architecture (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (31): dependencies, canvas-confetti, easy-speech, framer-motion, @google/genai, mongoose, next, next-auth (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (32): DeckReview(), ArrowLeft(), ArrowLeftProps, ArrowRight(), ArrowRightProps, SoundIcon(), SoundIconProps, Toast() (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (32): DeckBuilderProps, DeckCard(), DeckCardProps, AnonIcon(), AnonIconProps, CardsIcon(), CardsIconProps, DeckIconProps (+24 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (22): husky.sh script, devDependencies, autoprefixer, eslint, eslint-config-next, @eslint/eslintrc, husky, jsdom (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (20): mockDeleteQuiz, mockDeleteStep, DecksContext, addWordToDatabase(), _apiHandler(), createDeck(), deleteDeck(), deleteUserData() (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (12): AccuracyTrendProps, formatTime(), OverviewCards(), OverviewCardsProps, OverviewData, ReviewForecastProps, WeakestWord, WeakestWordsTableProps (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (3): Commands, Detailed guides, Essentials

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (11): AuthProvider(), AuthProviderProps, Props, QuizFinished(), DecksProvider(), useConfetti(), NextThemesProvider(), Props (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.24
Nodes (6): getUserData(), requireAuthSSR(), CardsPage(), DeckReviewPage(), DecksPage(), MemoryHooksPage()

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 22 - "Community 22"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (3): __dirname, __filename, server

## Knowledge Gaps
- **263 isolated node(s):** `session-start.sh script`, `husky.sh script`, `AuthProviderProps`, `View`, `AnonIconProps` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Language` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 7`, `Community 8`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `Word` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 7`, `Community 8`, `Community 10`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `connectDB()` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `husky.sh script`, `AuthProviderProps` to the rest of the system?**
  _263 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07226107226107226 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06938775510204082 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06954887218045112 - nodes in this community are weakly interconnected._