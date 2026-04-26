"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getUserData } from "@/lib/apis";
import { UserProfile } from "@/types/User";


export function useAuthGuard() {
	const { data: session, status } = useSession();
	const pathName  = usePathname()
	const router = useRouter();
	const locale = useLocale();
	const [userData, setUserData] = useState<UserProfile>();

	useEffect(() => {
		if (status === "loading" || pathName === `/${locale}`) {
			return;
		}

		if (!session) {
			router.replace(`/${locale}/login`);
		} else {
			getUserData().then(({ data }) => {
				setUserData(data);
			});
		}
	}, [session, status, router, locale]);

	return { session, status, isLoading: status === "loading", userData };
}
