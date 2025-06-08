"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    try {
      signIn("google", { callbackUrl: "/" });
    } catch {
      setLoading(false);
      alert("Sign in failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-semibold text-black mb-6">Sign in to Your Account</h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          aria-busy={loading}
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={24} height={24} className="rounded" />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
        <p className="text-gray-500 text-sm mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
