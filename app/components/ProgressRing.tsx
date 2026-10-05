export interface ProgressRingProps {
	current: number;
	goal?: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
	showLabel?: boolean;
}

export function ProgressRing({
	current,
	goal = 10000,
	size = 140,
	strokeWidth = 12,
	color = "stroke-[var(--accent)]",
	showLabel = true,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	const percentage = Math.round((current / (goal || 1)) * 100);
	const visualProgress = Math.min(Math.max(current / (goal || 1), 0), 1);
	const strokeDashoffset = circumference * (1 - visualProgress);

	return (
		<div
			className="relative flex items-center justify-center shrink-0"
			style={{ width: size, height: size }}
		>
			<svg
				className="-rotate-90 transform"
				width={size}
				height={size}
			>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					strokeWidth={strokeWidth}
					fill="transparent"
					className="stroke-[var(--line)]"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					className={`${color} transition-all duration-1000 ease-out`}
				/>
			</svg>

			{showLabel && (
				<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
					<span className="font-serif text-xl text-[var(--ink)]">
						{percentage}%
					</span>
					<span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
						of goal
					</span>
				</div>
			)}
		</div>
	);
}
