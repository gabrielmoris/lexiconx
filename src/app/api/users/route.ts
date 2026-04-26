/* eslint-disable @typescript-eslint/no-explicit-any */
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

		const { activeLanguage } = await req.json();

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (user.activeLanguage === activeLanguage) {
			return NextResponse.json({ data: null, error: "Language already set" });
		}

		const languageProgress = user.learningProgress.find((lp: any) => lp?.language === activeLanguage);

		if (!languageProgress) {
			user.learningProgress.push({
				language: activeLanguage,
				level: 0,
				wordsMastered: 0,
				currentStreak: 0,
				timeSpent: 0,
			} as any);
		}

		user.activeLanguage = activeLanguage;
		const saved = await user.save();

		return NextResponse.json({ error: null, data: saved.activeLanguage });
	} catch {
		return NextResponse.json({ error: "Error updating user" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ error: null, data: user });
	} catch {
		return NextResponse.json({ error: "Error getting user" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { userData } = await req.json();
		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (userData.learningProgress) user.learningProgress = userData?.learningProgress;
		if (userData.activeLanguage) user.activeLanguage = userData?.activeLanguage;
		if (userData.nativeLanguage) user.nativeLanguage = userData?.nativeLanguage;

		const saved = await user.save();

		return NextResponse.json({ error: null, data: saved });
	} catch {
		return NextResponse.json({ error: "Error updating user" }, { status: 500 });
	}
}

export async function DELETE() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const words = await Word.find({ userId: user._id });

		for (const word of words) {
			await word.deleteOne();
		}

		const deleted = await user.deleteOne();
		return NextResponse.json({ error: null, data: deleted });
	} catch {
		return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
	}
}
