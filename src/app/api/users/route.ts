/* eslint-disable @typescript-eslint/no-explicit-any */
import User from "@/lib/mongodb/models/user";
import { connectDB } from "@/lib/mongodb/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { activeLanguage, session } = await req.json();

  await connectDB();

  if (!session.user.email) {
    return NextResponse.json({ error: "User not found" });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
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
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  await connectDB();

  if (!email) {
    return NextResponse.json({ error: "Email not provided" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  return NextResponse.json({ error: null, data: user });
}

export async function PUT(req: Request) {
  const { userData, session } = await req.json();
  await connectDB();

  if (!session.user.email) {
    return NextResponse.json({ error: "User not found" });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  if (userData.learningProgress) user.learningProgress = userData?.learningProgress;
  if (userData.activeLanguage) user.activeLanguage = userData?.activeLanguage;
  if (userData.nativeLanguage) user.nativeLanguage = userData?.nativeLanguage;

  const saved = await user.save();

  return NextResponse.json({ error: null, data: saved });
}
