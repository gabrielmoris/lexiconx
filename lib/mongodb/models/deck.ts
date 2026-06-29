import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for quick lookup of a user's decks
    },
    name: { type: String, required: true, trim: true },
    language: { type: String, required: true },

    // References to the user's own words. SRS state stays on the Word docs,
    // so a deck is just a saved selection that always reflects live progress.
    wordIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Word' }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

deckSchema.index({ userId: 1, language: 1 });

const Deck = mongoose.models.Deck || mongoose.model('Deck', deckSchema);

export default Deck;
