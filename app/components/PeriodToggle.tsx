"use client";

export type Period = "week" | "month";

interface PeriodToggleProps {
	currentPeriod: Period;
	onChange: (period: Period) => void;
}

export function PeriodToggle({ currentPeriod, onChange }: PeriodToggleProps) {
	return (
		<div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card)] p-1">
			<button
				type="button"
				onClick={() => onChange("week")}
				aria-pressed={currentPeriod === "week"}
				data-on={currentPeriod === "week" ? "true" : "false"}
				className="chip transition-all hover:text-[var(--ink)]"
			>
				This Week
			</button>
			<button
				type="button"
				onClick={() => onChange("month")}
				aria-pressed={currentPeriod === "month"}
				data-on={currentPeriod === "month" ? "true" : "false"}
				className="chip transition-all hover:text-[var(--ink)]"
			>
				This Month
			</button>
		</div>
	);
}
