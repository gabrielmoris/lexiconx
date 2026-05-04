"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useTranslations } from "next-intl";

interface WordHealthProps {
	data: {
		new: number;
		learning: number;
		reviewing: number;
		mastered: number;
	};
}

const COLORS = {
	new: "#94a3b8",
	learning: "#f59e0b",
	reviewing: "#3b82f6",
	mastered: "#10b981",
};

export default function WordHealthChart({ data }: WordHealthProps) {
	const t = useTranslations("stats");

	const chartData = [
		{ name: t("new-words"), value: data.new, color: COLORS.new },
		{ name: t("learning"), value: data.learning, color: COLORS.learning },
		{ name: t("reviewing"), value: data.reviewing, color: COLORS.reviewing },
		{ name: t("mastered"), value: data.mastered, color: COLORS.mastered },
	].filter((item) => item.value > 0);

	const total = chartData.reduce((sum, item) => sum + item.value, 0);

	if (total === 0) {
		return (
			<div className="border border-theme-bg-light dark:border-theme-bg-dark rounded-lg p-6">
				<h3 className="text-lg font-semibold text-theme-text-light dark:text-theme-text-dark mb-4">
					{t("word-health")}
				</h3>
				<p className="text-theme-fg-light dark:text-theme-fg-dark text-sm">
					{t("no-data-yet")}
				</p>
			</div>
		);
	}

	return (
		<div className="border border-theme-bg-light dark:border-theme-bg-dark rounded-lg p-6">
			<h3 className="text-lg font-semibold text-theme-text-light dark:text-theme-text-dark mb-4">
				{t("word-health")}
			</h3>
			<ResponsiveContainer width="100%" height={250}>
				<PieChart>
					<Pie
						data={chartData}
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={90}
						paddingAngle={2}
						dataKey="value"
					>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Pie>
					<Tooltip formatter={(value) => [value, t("words")]} />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
