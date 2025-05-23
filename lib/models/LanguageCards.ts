import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const LanguageCardsSchema = new mongoose.Schema({
  user: { type: wordSchema, required: true },
});

const LanguageCards = mongoose.models.LanguageCards || mongoose.model("LanguageCards", LanguageCardsSchema);

export default LanguageCards;
