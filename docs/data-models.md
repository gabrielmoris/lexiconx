# Data Models

## MongoDB Connection

`lib/mongodb/mongodb.ts` exports `connectDB()` which uses a **global cache pattern** to reuse the Mongoose connection across requests:

```typescript
const cached: MongooseCache = globalWithMongoose.mongoose || { conn: null, promise: null };

export async function connectDB() {
 if (cached.conn) return cached.conn;
 if (!cached.promise) {
 cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
 }
 cached.conn = await cached.promise;
 return cached.conn;
}
```

**Every API route must call `await connectDB()` before any database operation.**

## Word Model (`lib/mongodb/models/word.ts`)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `userId` | ObjectId (ref: User) | required | Indexed |
| `word` | String | required | Trimmed |
| `definition` | String | required | Trimmed |
| `phoneticNotation` | String | — | Trimmed |
| `language` | String | required | One of `Language` union values |
| `tags` | [String] | `[]` | |
| `lastReviewed` | Date | `null` | |
| `nextReview` | Date | `Date.now` | |
| `interval` | Number | `0` | Days until next review |
| `repetitions` | Number | `0` | Consecutive correct recalls |
| `easeFactor` | Number | `2.5` | SRS ease factor (higher = interval grows faster) |
| `createdAt` | Date | auto | Via `timestamps: true` |
| `updatedAt` | Date | auto | Via `timestamps: true` |

### Indexes

- `{ userId: 1 }` — single field for user lookup
- `{ userId: 1, language: 1, nextReview: 1 }` — compound index for fetching due words

### Spaced Repetition System (SRS)

The SRS fields (`interval`, `repetitions`, `easeFactor`) implement a modified SM-2 algorithm:

- `interval`: Number of days to wait before showing the word again
- `repetitions`: How many times the user has recalled this word correctly in a row
- `easeFactor`: Represents how "easy" or "hard" the word is — higher factor means the interval grows faster

The `nextReview` date determines when a word becomes due again. Words are fetched with:

```typescript
// Overdue words (nextReview <= now)
Word.find({ userId, language, nextReview: { $lte: now } }).sort({ nextReview: 1 }).limit(15)

// New words (never reviewed)
Word.find({ userId, language, repetitions: 0, lastReviewed: null }).sort({ createdAt: 1 })
```

`lib/correctionWords.ts` handles the SRS interval calculation.

## User Model (`lib/mongodb/models/user.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Unique identifier |
| `googleID` | String | Optional Google OAuth ID |
| `name` | String | Optional display name |
| `image` | String | Optional avatar URL |
| `nativeLanguage` | String | Optional `Language` value |
| `activeLanguage` | String | Current learning language |
| `learningProgress` | [LearningProgress] | Array of per-language progress |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### LearningProgress Subdocument

| Field | Type | Notes |
|-------|------|-------|
| `language` | String | `Language` value |
| `level` | Number | 1–100 proficiency level |
| `wordsMastered` | Number | Count of mastered words |
| `currentStreak` | Number | Consecutive study days |
| `lastSessionDate` | Date | |
| `timeSpent` | Number | Total time in minutes |

## TypeScript Types

The source of truth for type definitions is `types/`:

- `types/Words.ts` — `Word`, `User`, `LearningProgress`, `Language`, `Locale`
- `types/Quiz.ts` — `Quiz`, `QuizQuestion`, `QuizAnswer`, `QuizGeneratorResponse`

Mongoose schemas implement these types but are **not** the source of truth.
