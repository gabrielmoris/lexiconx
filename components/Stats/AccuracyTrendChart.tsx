"use client";

import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from "recharts";
import { useTranslations } from "next-intl";

interface AccuracyTrendProps {
	data: { date: string; accuracy: number }[];
}

export default function AccuracyTrendChart({ data }: AccuracyTrendProps) {
	const t = useTranslations("stats");

	if (!data || data.length === 0) {
		return (
			<div className="border border-theme-bg-light dark:border-theme-bg-dark rounded-lg p-6">
				<h3 className="text-lg font-semibold text-theme-text-light dark:text-theme-text-dark mb-4">
					{t("accuracy-trend")}
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
				{t("accuracy-trend")}
			</h3>
			<ResponsiveContainer width="100%" height={250}>
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
					<XAxis
						dataKey="date"
						tick={{ fontSize: 12 }}
						tickFormatter={(val: string) => {
							const parts = val.split("-");
							return `${parts[1]}/${parts[2]}`;
						}}
					/>
					<YAxis
						domain={[0, 100]}
						tick={{ fontSize: 12 }}
						tickFormatter={(val: number) => `${val}%`}
					/>
					<Tooltip
						formatter={(value) => [`${value}%`, t("accuracy")]}
						labelFormatter={(label) => String(label)}
					/>
					<Line
						type="monotone"
						dataKey="accuracy"
						stroke="#10b981"
						strokeWidth={2}
						dot={{ r: 3 }}
						activeDot={{ r: 5 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
