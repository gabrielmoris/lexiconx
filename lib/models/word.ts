import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for quick lookup of a user's words
    },
    word: { type: String, required: true, trim: true },
    definition: { type: String, required: true, trim: true },
    phoneticNotation: { type: String, trim: true },
    language: { type: String, required: true },

    tags: { type: [String], default: [] },

    // --- Spaced Repetition System (SRS) Fields ---
    lastReviewed: { type: Date, default: null },
    nextReview: { type: Date, default: Date.now },
    interval: { type: Number, default: 0 }, // The number of days to wait before showing the word again. This is the core of SRS.
    repetitions: { type: Number, default: 0 }, // How many times the user has recalled this word correctly in a row
    easeFactor: { type: Number, default: 2.5 }, // A number that represents how "easy" or "hard" the word is for the user. A higher factor means the interval grows faster.
  },
  {
    timestamps: true,
  }
);

wordSchema.index({ userId: 1, language: 1, nextReview: 1 });

const Word = mongoose.models.Word || mongoose.model("Word", wordSchema);

export default Word;
