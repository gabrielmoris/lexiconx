"use client";

import { useTranslations } from "next-intl";

interface OverviewData {
	totalWords: number;
	mastered: number;
	learning: number;
	newWords: number;
	streak: number;
	accuracy: number;
	timeSpent: number;
	totalSessions: number;
}

interface OverviewCardsProps {
	overview: OverviewData;
}

const formatTime = (ms: number): string => {
	const hours = Math.floor(ms / 3600000);
	const minutes = Math.floor((ms % 3600000) / 60000);
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
};

export default function OverviewCards({ overview }: OverviewCardsProps) {
	const t = useTranslations("stats");

	const cards = [
		{ label: t("total-words"), value: overview.totalWords },
		{ label: t("mastered"), value: overview.mastered },
		{ label: t("learning"), value: overview.learning },
		{ label: t("streak"), value: overview.streak, suffix: "🔥" },
		{ label: t("accuracy"), value: `${overview.accuracy}%` },
		{ label: t("time-spent"), value: formatTime(overview.timeSpent) },
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
			{cards.map((card) => (
				<div
					key={card.label}
					className="rounded-lg p-4 text-center"
				>
					<p className="text-2xl font-bold text-theme-text-light dark:text-theme-text-dark">
						{card.value}
						{card.suffix && <span className="ml-1">{card.suffix}</span>}
					</p>
					<p className="text-sm text-theme-fg-light dark:text-theme-fg-dark mt-1">{card.label}</p>
				</div>
			))}
		</div>
	);
}
