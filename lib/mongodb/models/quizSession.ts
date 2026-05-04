import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		language: { type: String, required: true },
		date: { type: Date, default: Date.now },
		totalQuestions: { type: Number, required: true },
		correctAnswers: { type: Number, required: true },
		wordsMastered: { type: Number, default: 0 },
		duration: { type: Number, default: 0 }, // time in ms
	},
	{
		timestamps: true,
	}
);

quizSessionSchema.index({ userId: 1, language: 1, date: -1 });

const QuizSession = mongoose.models.QuizSession || mongoose.model("QuizSession", quizSessionSchema);

export default QuizSession;
