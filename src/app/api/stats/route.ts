import QuizSession from "@/lib/mongodb/models/quizSession";
import User from "@/lib/mongodb/models/user";
import Word from "@/lib/mongodb/models/word";
import { connectDB } from "@/lib/mongodb/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextAuthOptions";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { language, totalQuestions, correctAnswers, wordsMastered, duration } = body;

		if (!language || totalQuestions === undefined || correctAnswers === undefined) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		await connectDB();

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const quizSession = await QuizSession.create({
			userId: user._id,
			language,
			totalQuestions,
			correctAnswers,
			wordsMastered: wordsMastered || 0,
			duration: duration || 0,
		});

		return NextResponse.json({ error: null, data: quizSession });
	} catch {
		return NextResponse.json({ error: "Error saving quiz session" }, { status: 500 });
	}
}

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const language = searchParams.get("language");

		if (!language) {
			return NextResponse.json({ error: "Language parameter is required" }, { status: 400 });
		}

		await connectDB();

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const userId = user._id;

		// Overview aggregations
		const wordStats = await Word.aggregate([
			{ $match: { userId, language } },
			{
				$facet: {
					totalCount: [{ $count: "count" }],
					mastered: [{ $match: { interval: { $gt: 21 } } }, { $count: "count" }],
					learning: [{ $match: { repetitions: { $gt: 0 }, interval: { $lte: 21 } } }, { $count: "count" }],
					newWords: [{ $match: { repetitions: 0 } }, { $count: "count" }],
				},
			},
		]);

		const sessionStats = await QuizSession.aggregate([
			{ $match: { userId, language } },
			{
				$facet: {
					totalSessions: [{ $count: "count" }],
					totalTime: [{ $group: { _id: null, time: { $sum: "$duration" } } }],
					totalCorrect: [{ $group: { _id: null, correct: { $sum: "$correctAnswers" }, total: { $sum: "$totalQuestions" } } }],
				},
			},
		]);

		// Streak calculation from QuizSession
		const streakResult = await QuizSession.aggregate([
			{ $match: { userId, language } },
			{ $sort: { date: -1 } },
			{
				$group: {
					_id: null,
					sessions: { $push: "$date" },
				},
			},
		]);

		let streak = 0;
		if (streakResult.length > 0 && streakResult[0].sessions.length > 0) {
			const sessions = streakResult[0].sessions;
			const dayMs = 86400000;
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			let prevDay = today.getTime();
			for (const sessionDate of sessions) {
				const sessionDay = new Date(sessionDate);
				sessionDay.setHours(0, 0, 0, 0);
				const diff = Math.round((prevDay - sessionDay.getTime()) / dayMs);
				if (diff <= 1) {
					streak++;
					prevDay = sessionDay.getTime();
				} else {
					break;
				}
			}
		}

		// Also get streak from user learningProgress as fallback
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const learningProgress: any = user.learningProgress.find(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(lp: any) => lp.language === language
		);
		const currentStreak = streak || learningProgress?.currentStreak || 0;

		const totalWords = wordStats[0]?.totalCount[0]?.count || 0;
		const mastered = wordStats[0]?.mastered[0]?.count || 0;
		const learning = wordStats[0]?.learning[0]?.count || 0;
		const newWordsCount = wordStats[0]?.newWords[0]?.count || 0;
		const totalSessions = sessionStats[0]?.totalSessions[0]?.count || 0;
		const timeSpent = sessionStats[0]?.totalTime[0]?.time || learningProgress?.timeSpent || 0;
		const totalCorrect = sessionStats[0]?.totalCorrect[0]?.correct || 0;
		const totalQuestions = sessionStats[0]?.totalCorrect[0]?.total || 0;
		const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0;

		// Accuracy trend - last 30 sessions
		const accuracyTrend = await QuizSession.aggregate([
			{ $match: { userId, language } },
			{ $sort: { date: -1 } },
			{ $limit: 30 },
			{ $sort: { date: 1 } },
			{
				$project: {
					date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
					accuracy: {
						$cond: [
							{ $eq: ["$totalQuestions", 0] },
							0,
							{ $round: [{ $multiply: [{ $divide: ["$correctAnswers", "$totalQuestions"] }, 100] }, 1] },
						],
					},
				},
			},
		]);

		// Word health distribution
		const reviewing = totalWords - mastered - learning - newWordsCount;
		const wordHealth = {
			new: newWordsCount,
			learning,
			reviewing: reviewing > 0 ? reviewing : 0,
			mastered,
		};

		// Review forecast
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(23, 59, 59, 999);
		const endOfWeek = new Date(now);
		endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
		endOfWeek.setHours(23, 59, 59, 999);

		const reviewForecast = await Word.aggregate([
			{ $match: { userId, language, nextReview: { $ne: null } } },
			{
				$facet: {
					overdue: [{ $match: { nextReview: { $lt: now } } }, { $count: "count" }],
					today: [{ $match: { nextReview: { $gte: now, $lt: tomorrow } } }, { $count: "count" }],
					thisWeek: [{ $match: { nextReview: { $gte: tomorrow, $lt: endOfWeek } } }, { $count: "count" }],
					later: [{ $match: { nextReview: { $gte: endOfWeek } } }, { $count: "count" }],
				},
			},
		]);

		const forecast = {
			overdue: reviewForecast[0]?.overdue[0]?.count || 0,
			today: reviewForecast[0]?.today[0]?.count || 0,
			tomorrow: 0, // computed from thisWeek portion
			thisWeek: reviewForecast[0]?.thisWeek[0]?.count || 0,
			later: reviewForecast[0]?.later[0]?.count || 0,
		};

		// Weakest words - lowest easeFactor
		const weakestWords = await Word.aggregate([
			{ $match: { userId, language, easeFactor: { $exists: true } } },
			{ $sort: { easeFactor: 1 } },
			{ $limit: 10 },
			{
				$project: {
					word: 1,
					definition: 1,
					easeFactor: 1,
					lastReviewed: { $dateToString: { format: "%Y-%m-%d", date: "$lastReviewed" } },
				},
			},
		]);

		return NextResponse.json({
			error: null,
			data: {
				overview: {
					totalWords,
					mastered,
					learning,
					newWords: newWordsCount,
					streak: currentStreak,
					accuracy,
					timeSpent,
					totalSessions,
				},
				accuracyTrend,
				wordHealth,
				reviewForecast: forecast,
				weakestWords,
			},
		});
	} catch {
		return NextResponse.json({ error: "Error getting stats" }, { status: 500 });
	}
}
