import mongoose, { Document, Schema } from "mongoose";

export const languageProgressSchema = new Schema({
  language: { type: String, required: true },
  // The user's overall proficiency level in this language (0-100)
  level: { type: Number, default: 0 },
  // Words that have reached a certain SRS interval (e.g., > 21 days)
  wordsMastered: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  lastSessionDate: { type: Date },
  timeSpent: { type: Number, default: 0 },
});

export interface IUser extends Document {
  email: string;
  googleID: string;
  name?: string;
  image?: string;
  nativeLanguage?: string;
  activeLanguage: { type: string; default: "Chinese" };
  learningProgress: [typeof languageProgressSchema];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    googleID: { type: String, unique: true, trim: true },
    name: { type: String, trim: true },
    image: { type: String, trim: true },
    nativeLanguage: { type: String, trim: true },
    activeLanguage: { type: String, default: "Chinese" },
    learningProgress: { type: [languageProgressSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);

export default User;
