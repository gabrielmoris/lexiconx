"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getStats } from "@/lib/apis";
import { Language } from "@/types/Words";
import OverviewCards from "@/components/Stats/OverviewCards";
import AccuracyTrendChart from "@/components/Stats/AccuracyTrendChart";
import WordHealthChart from "@/components/Stats/WordHealthChart";
import ReviewForecastChart from "@/components/Stats/ReviewForecastChart";
import WeakestWordsTable from "@/components/Stats/WeakestWordsTable";

interface StatsData {
	overview: {
		totalWords: number;
		mastered: number;
		learning: number;
		newWords: number;
		streak: number;
		accuracy: number;
		timeSpent: number;
		totalSessions: number;
	};
	accuracyTrend: { date: string; accuracy: number }[];
	wordHealth: { new: number; learning: number; reviewing: number; mastered: number };
	reviewForecast: { overdue: number; today: number; tomorrow: number; thisWeek: number; later: number };
	weakestWords: { word: string; definition: string; easeFactor: number; lastReviewed: string | null }[];
}

const StatsPage = () => {
	const t = useTranslations("stats");
	const { userData, status } = useAuthGuard();
	const [statsData, setStatsData] = useState<StatsData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (status === "authenticated" && userData?.activeLanguage) {
			setLoading(true);
			getStats(userData.activeLanguage as Language)
				.then(({ data }) => {
					setStatsData(data);
				})
				.catch((err) => console.error("Error fetching stats:", err))
				.finally(() => setLoading(false));
		}
	}, [status, userData]);

	if (loading || !statsData) {
		return (
			<main className="flex items-center justify-center py-20 px-4 md:w-xl md:p-20">
				<p className="text-theme-fg-light dark:text-theme-fg-dark">{t("loading")}</p>
			</main>
		);
	}

	return (
		<main className="flex items-center justify-center py-10 px-4 md:p-10 w-screen">
			<div className="w-full max-w-3xl space-y-6">
				<h1 className="text-3xl font-extrabold text-center pb-4 border-b border-theme-bg-light dark:border-theme-bg-dark text-theme-text-light dark:text-theme-text-dark">
					{t("title")}
				</h1>

				<OverviewCards overview={statsData.overview} />

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<WordHealthChart data={statsData.wordHealth} />
					<ReviewForecastChart data={statsData.reviewForecast} />
				</div>

				<AccuracyTrendChart data={statsData.accuracyTrend} />

				<WeakestWordsTable data={statsData.weakestWords} />
			</div>
		</main>
	);
};

export default StatsPage;
