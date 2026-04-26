import Word from "@/lib/mongodb/models/word";
import User from "@/lib/mongodb/models/user";
import { connectDB } from "@/lib/mongodb/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextAuthOptions";
import type { Word as WordType } from "@/types/Words";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { word, definition, phoneticNotation, language } = await req.json();

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const wordData = {
			userId: user._id,
			word,
			definition,
			phoneticNotation,
			language,
		};

		const saved = await Word.create(wordData);

		return NextResponse.json({ error: null, data: saved });
	} catch {
		return NextResponse.json({ error: "Error saving words" }, { status: 500 });
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
		const wordIds = searchParams.get("ids");
		const ids = wordIds ? wordIds.split(",") : [];

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (ids.length) {
			// Only fetch words that belong to the authenticated user
			const words = await Word.find({ _id: { $in: ids }, userId: user._id });
			return NextResponse.json({ error: null, data: words });
		} else {
			if (!language) {
				return NextResponse.json({ error: "Language not provided" }, { status: 400 });
			}
			const words = await Word.find({ userId: user._id, language });
			return NextResponse.json({ error: null, data: words });
		}
	} catch {
		return NextResponse.json({ error: "Error getting words" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { words } = await req.json();

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const updatedWords = await Word.bulkWrite(
			words.map((word: WordType) => ({
				updateOne: {
					filter: { _id: word._id, userId: user._id },
					update: {
						nextReview: word.nextReview,
						interval: word.interval,
						lastReviewed: word.lastReviewed,
						repetitions: word.repetitions,
						easeFactor: word.easeFactor,
					},
				},
			})),
		);

		return NextResponse.json({ error: null, data: updatedWords });
	} catch {
		return NextResponse.json({ error: "Error updating words" }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { word } = await req.json();

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const wordToDelete = await Word.findOne({ _id: word._id });

		if (!wordToDelete) {
			return NextResponse.json({ error: "Word not found" }, { status: 404 });
		}

		if (!wordToDelete.userId.equals(user._id)) {
			return NextResponse.json({ error: "Not allowed" }, { status: 403 });
		}

		const deletedWord = await Word.deleteOne(wordToDelete);

		return NextResponse.json({ error: null, data: deletedWord });
	} catch {
		return NextResponse.json({ error: "Error deleting words" }, { status: 500 });
	}
}
