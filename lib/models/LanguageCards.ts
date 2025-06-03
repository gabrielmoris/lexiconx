// models/Word.ts
import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
    },
    definition: {
      type: String,
      required: true,
      trim: true,
    },
    pinyin: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["Chinese", "German", "English"],
    },
    // Spaced Repetition System (SRS) fields
    lastReviewed: {
      type: Date,
      default: null, // Initially not reviewed
    },
    nextReview: {
      type: Date,
      default: Date.now, // New words are ready to be reviewed immediately
    },
    interval: {
      // In days
      type: Number,
      default: 0,
    },
    repetitions: {
      // How many times correctly recalled in a row
      type: Number,
      default: 0,
    },
    easeFactor: {
      // Adjusts the interval growth
      type: Number,
      default: 2.5, // Standard starting ease factor for Anki-like algorithms
    },
    // Optional: Array to store generated sentences
    sentences: [
      {
        text: { type: String, required: true },
        generatedAt: { type: Date, default: Date.now },
        // You could add more fields here, like a rating for the sentence quality
      },
    ],
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
  }
);

const Word = mongoose.models.Word || mongoose.model("Word", wordSchema);

export default Word;
