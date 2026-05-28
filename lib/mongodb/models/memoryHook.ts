import mongoose from 'mongoose';

const memoryHookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
      required: true,
    },
    language: { type: String, required: true },
    phoneticKeyword: { type: String, required: true, trim: true },
    bridgeSentence: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

// One MemoryHook per user per word
memoryHookSchema.index({ userId: 1, wordId: 1 }, { unique: true });

const MemoryHook = mongoose.models.MemoryHook || mongoose.model('MemoryHook', memoryHookSchema);

export default MemoryHook;
