// Auth for client components
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * A custom React hook to protect routes by redirecting unauthenticated users.
 *
 * @param redirectTo Optional path to redirect to if unauthenticated. Defaults to '/'.
 * @returns An object containing the session data, status, and a boolean indicating if loading.
 */
export function useAuthProtection(redirectTo: string = "/") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.replace(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  return { session, status, isLoading: status === "loading" };
}
