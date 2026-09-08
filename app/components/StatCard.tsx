import React from "react";

export interface StatCardProps {
	title: string;
	value: string | number;
	unit?: string;
	icon?: React.ReactNode;
	accentColor?: "emerald" | "blue" | "amber" | "rose" | "purple";
	subtitle?: string;
	visual?: React.ReactNode;
}

const colorStyles = {
	emerald: {
		text: "text-emerald-600 dark:text-emerald-400",
		iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
	},
	blue: {
		text: "text-blue-600 dark:text-blue-400",
		iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
	},
	amber: {
		text: "text-amber-600 dark:text-amber-400",
		iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
	},
	rose: {
		text: "text-rose-600 dark:text-rose-400",
		iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
	},
	purple: {
		text: "text-purple-600 dark:text-purple-400",
		iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
	},
};

export function StatCard({
	title,
	value,
	unit,
	icon,
	accentColor = "emerald",
	subtitle,
	visual,
}: StatCardProps) {
	const colors = colorStyles[accentColor];

	return (
		<div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
			<div className="flex items-center justify-between">
				<span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
					{title}
				</span>
				{icon && (
					<div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.iconBg}`}>
						{icon}
					</div>
				)}
			</div>

			<div className="mt-4 flex items-center justify-between gap-3">
				<div>
					<div className="flex items-baseline gap-2">
						<span className={`text-3xl font-black ${colors.text}`}>
							{value}
						</span>
						{unit && (
							<span className="text-sm font-medium text-zinc-400">
								{unit}
							</span>
						)}
					</div>

					{subtitle && (
						<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
							{subtitle}
						</p>
					)}
				</div>

				{visual && (
					<div className="shrink-0">
						{visual}
					</div>
				)}
			</div>
		</div>
	);
}
