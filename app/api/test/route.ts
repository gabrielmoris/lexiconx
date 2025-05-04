import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  await connectDB();
  return NextResponse.json({ message: "MongoDB connected successfully" });
}
