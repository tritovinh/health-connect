import React from "react";

export interface StatCardProps {
	title: string;
	value: string | number;
	unit?: string;
	icon?: React.ReactNode;
	accentColor?: "emerald" | "blue" | "amber" | "rose" | "purple";
	subtitle?: string;
	visual?: React.ReactNode;
	footer?: React.ReactNode;
}

const colorStyles = {
	emerald: {
		text: "text-[var(--accent)]",
		iconBg:
			"bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)]",
	},
	blue: {
		text: "text-[var(--pine)]",
		iconBg:
			"bg-[color-mix(in_srgb,var(--pine)_16%,transparent)] text-[var(--pine)]",
	},
	amber: {
		text: "text-[var(--accent-2)]",
		iconBg:
			"bg-[color-mix(in_srgb,var(--accent-2)_16%,transparent)] text-[var(--accent-2)]",
	},
	rose: {
		text: "text-[var(--bad)]",
		iconBg:
			"bg-[color-mix(in_srgb,var(--bad)_16%,transparent)] text-[var(--bad)]",
	},
	purple: {
		text: "text-[var(--good)]",
		iconBg:
			"bg-[color-mix(in_srgb,var(--good)_16%,transparent)] text-[var(--good)]",
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
	footer,
}: StatCardProps) {
	const colors = colorStyles[accentColor];

	return (
		<div className="card flex flex-col justify-between gap-5 p-5 transition-transform hover:-translate-y-0.5">
			<div className="flex items-center justify-between">
				<span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
					{title}
				</span>
				{icon && (
					<div
						className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.iconBg}`}
					>
						{icon}
					</div>
				)}
			</div>

			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="flex items-baseline gap-1.5">
						<span className="font-serif text-4xl leading-none tracking-tight text-[var(--ink)]">
							{value}
						</span>
						{unit && (
							<span className="text-sm text-[var(--muted)]">{unit}</span>
						)}
					</div>

					{subtitle && (
						<p className="mt-2 text-xs text-[var(--muted)]">{subtitle}</p>
					)}
				</div>

				{visual && <div className="shrink-0">{visual}</div>}
			</div>

			{footer && <div className={colors.text}>{footer}</div>}
		</div>
	);
}
