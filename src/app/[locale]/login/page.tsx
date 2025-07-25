"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const locale = useLocale();

  const handleLogin = () => {
    setLoading(true);
    try {
      signIn("google", { callbackUrl: `/${locale}/cards` });
    } catch {
      setLoading(false);
      alert("Sign in failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className=" dark:bg-theme-fg-dark bg-theme-fg-light p-8 rounded shadow-md flex flex-col items-center w-full">
        <h1 className="text-2xl font-semibold mb-6">Sign in to Your Account</h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 px-6 py-3 dark:bg-theme-bg-dark hover:opacity-60 bg-secondary rounded shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
