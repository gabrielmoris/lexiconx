"use client";

import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	Cell,
} from "recharts";
import { useTranslations } from "next-intl";

interface ReviewForecastProps {
	data: {
		overdue: number;
		today: number;
		tomorrow: number;
		thisWeek: number;
		later: number;
	};
}

export default function ReviewForecastChart({ data }: ReviewForecastProps) {
	const t = useTranslations("stats");

	const chartData = [
		{ name: t("overdue"), value: data.overdue, color: "#ef4444" },
		{ name: t("today"), value: data.today, color: "#f59e0b" },
		{ name: t("tomorrow"), value: data.tomorrow, color: "#3b82f6" },
		{ name: t("this-week"), value: data.thisWeek, color: "#8b5cf6" },
		{ name: t("later"), value: data.later, color: "#10b981" },
	];

	const total = chartData.reduce((sum, item) => sum + item.value, 0);

	if (total === 0) {
		return (
			<div className="border border-theme-bg-light dark:border-theme-bg-dark rounded-lg p-6">
				<h3 className="text-lg font-semibold text-theme-text-light dark:text-theme-text-dark mb-4">
					{t("review-forecast")}
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
				{t("review-forecast")}
			</h3>
			<ResponsiveContainer width="100%" height={250}>
				<BarChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
					<XAxis dataKey="name" tick={{ fontSize: 12 }} />
					<YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
					<Tooltip formatter={(value) => [value, t("words")]} />
					<Bar dataKey="value" radius={[4, 4, 0, 0]}>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
