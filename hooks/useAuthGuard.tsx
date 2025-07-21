// Auth for client components
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getUserData } from "@/lib/apis";
import { UserProfile } from "@/types/User";

/**
 * A custom React hook to protect routes by redirecting unauthenticated users.
 *
 * @returns An object containing the session data, status, and a boolean indicating if loading.
 */
export function useAuthGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [userData, setUserData] = useState<UserProfile>();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.replace(`/${locale}/login`);
    } else {
      getUserData(session).then(({ data }) => {
        setUserData(data);
      });
    }
  }, [session, status, router, locale]);

  return { session, status, isLoading: status === "loading", userData };
}
