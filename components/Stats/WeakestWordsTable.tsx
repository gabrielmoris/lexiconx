"use client";

import { useTranslations } from "next-intl";

interface WeakestWord {
	word: string;
	definition: string;
	easeFactor: number;
	lastReviewed: string | null;
}

interface WeakestWordsTableProps {
	data: WeakestWord[];
}

export default function WeakestWordsTable({ data }: WeakestWordsTableProps) {
	const t = useTranslations("stats");

	if (!data || data.length === 0) {
		return (
			<div className="border border-theme-bg-light dark:border-theme-bg-dark rounded-lg p-6">
				<h3 className="text-lg font-semibold text-theme-text-light dark:text-theme-text-dark mb-4">
					{t("weakest-words")}
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
				{t("weakest-words")}
			</h3>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-theme-bg-light dark:border-theme-bg-dark">
							<th className="text-left py-2 px-3 text-theme-fg-light dark:text-theme-fg-dark">{t("word")}</th>
							<th className="text-left py-2 px-3 text-theme-fg-light dark:text-theme-fg-dark">{t("definition")}</th>
							<th className="text-center py-2 px-3 text-theme-fg-light dark:text-theme-fg-dark">{t("ease-factor")}</th>
							<th className="text-right py-2 px-3 text-theme-fg-light dark:text-theme-fg-dark">{t("last-reviewed")}</th>
						</tr>
					</thead>
					<tbody>
						{data.map((item, index) => (
							<tr
								key={index}
								className="border-b border-theme-bg-light dark:border-theme-bg-dark last:border-0"
							>
								<td className="py-2 px-3 font-medium text-theme-text-light dark:text-theme-text-dark">
									{item.word}
								</td>
								<td className="py-2 px-3 text-theme-fg-light dark:text-theme-fg-dark">
									{item.definition}
								</td>
								<td className="py-2 px-3 text-center">
									<span
										className={`px-2 py-0.5 rounded-full text-xs font-medium ${
											item.easeFactor < 1.5
												? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
												: item.easeFactor < 2.0
													? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
													: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
										}`}
									>
										{item.easeFactor}
									</span>
								</td>
								<td className="py-2 px-3 text-right text-theme-fg-light dark:text-theme-fg-dark">
									{item.lastReviewed || "—"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
