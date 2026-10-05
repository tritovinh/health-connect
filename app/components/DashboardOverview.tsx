"use client";

import { useState, useMemo } from "react";
import { PeriodToggle, type Period } from "@/app/components/PeriodToggle";
import { StatCard } from "@/app/components/StatCard";
import { getStartOfWeek, getStartOfMonth, formatDate } from "@/lib/date-utils";
import {
	Footprints,
	Route,
	Flame,
	TrendingUp,
	CalendarCheck,
	Trophy,
} from "lucide-react";

export interface ActivityItem {
	id: string;
	date: string;
	steps: number;
	distance: number;
	calories: number;
}

interface DashboardOverviewProps {
	activities: ActivityItem[];
	initialPeriod?: Period;
	lastSynced?: string | null;
}

export function DashboardOverview({
	activities,
	initialPeriod = "week",
	lastSynced,
}: DashboardOverviewProps) {
	const [period, setPeriod] = useState<Period>(initialPeriod);

	const handlePeriodChange = (newPeriod: Period) => {
		setPeriod(newPeriod);
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			url.searchParams.set("period", newPeriod);
			window.history.replaceState(null, "", url.toString());
		}
	};

	const {
		rangeLabel,
		stats,
		activeDaysCount,
		bestDay,
		tableActivities,
	} = useMemo(() => {
		const startDate = period === "month" ? getStartOfMonth() : getStartOfWeek();

		const rangeLabel =
			period === "month"
				? `${formatDate(startDate)} – Today`
				: (() => {
						const endOfWeek = new Date(startDate);
						endOfWeek.setUTCDate(startDate.getUTCDate() + 6);
						return `${formatDate(startDate)} – ${formatDate(endOfWeek)}`;
					})();

		const filtered = activities.filter((a) => new Date(a.date) >= startDate);

		let sumSteps = 0;
		let sumDistance = 0;
		let sumCalories = 0;
		let activeDays = 0;
		let best: ActivityItem | null = null;

		for (const act of filtered) {
			sumSteps += act.steps;
			sumDistance += act.distance;
			sumCalories += act.calories;
			if (act.steps > 0) activeDays++;
			if (!best || act.steps > best.steps) {
				best = act;
			}
		}

		const count = filtered.length;
		const avgSteps = count > 0 ? Math.round(sumSteps / count) : 0;

		return {
			rangeLabel,
			stats: {
				steps: sumSteps,
				distance: sumDistance,
				calories: sumCalories,
				avgSteps,
				count,
			},
			activeDaysCount: activeDays,
			bestDay: best,
			tableActivities: [...filtered].reverse(),
		};
	}, [activities, period]);

	const stepGoal = 10000;

	return (
		<>
			<section className="space-y-6">
				<div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-end">
					<div>
						<h2 className="text-2xl font-serif font-normal text-[var(--ink)]">
							Performance Overview
						</h2>
						<p className="mt-1 text-xs text-[var(--muted)]">
							{rangeLabel}
						</p>
					</div>

					<PeriodToggle
						currentPeriod={period}
						onChange={handlePeriodChange}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard
						title="Total Steps"
						value={stats.steps.toLocaleString()}
						unit="steps"
						icon={<Footprints className="h-4 w-4" />}
						accentColor="emerald"
						subtitle={period === "month" ? "This month" : "This week"}
					/>

					<StatCard
						title="Total Distance"
						value={stats.distance.toFixed(2)}
						unit="km"
						icon={<Route className="h-4 w-4" />}
						accentColor="blue"
						subtitle={`${(stats.distance * 0.621371).toFixed(2)} miles total`}
					/>

					<StatCard
						title="Active Energy"
						value={stats.calories.toLocaleString()}
						unit="kcal"
						icon={<Flame className="h-4 w-4" />}
						accentColor="amber"
						subtitle={`${stats.count} days recorded`}
					/>

					<StatCard
						title="Daily Average"
						value={stats.avgSteps.toLocaleString()}
						unit="steps/day"
						icon={<TrendingUp className="h-4 w-4" />}
						accentColor="purple"
						subtitle={
							stats.avgSteps >= stepGoal
								? "Exceeding daily goal!"
								: `${Math.round((stats.avgSteps / stepGoal) * 100)}% of daily goal`
						}
					/>

					<StatCard
						title="Active Days"
						value={activeDaysCount}
						unit={`/ ${stats.count} days`}
						icon={<CalendarCheck className="h-4 w-4" />}
						accentColor="emerald"
						subtitle={
							stats.count > 0
								? `${Math.round((activeDaysCount / stats.count) * 100)}% consistency`
								: "No data"
						}
					/>

					<StatCard
						title="Best Single Day"
						value={bestDay ? bestDay.steps.toLocaleString() : 0}
						unit="steps"
						icon={<Trophy className="h-4 w-4" />}
						accentColor="rose"
						subtitle={
							bestDay
								? `${formatDate(bestDay.date)} • ${bestDay.distance.toFixed(1)} km`
								: "No data"
						}
					/>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-serif font-normal text-[var(--ink)]">
							Synced Health Records
						</h2>
					</div>
					{lastSynced && (
						<span className="text-xs text-[var(--muted)]">
							Last synced: {lastSynced}
						</span>
					)}
				</div>

				<div className="card overflow-hidden">
					{tableActivities.length === 0 ? (
						<div className="py-12 text-center text-sm text-[var(--muted)]">
							No health data found for this period. Click{" "}
							<strong className="text-[var(--ink)]">&quot;Sync Google Health&quot;</strong> above!
						</div>
					) : (
						<div className="data-scroll">
							<table className="data-table">
								<thead>
									<tr>
										<th>Date</th>
										<th>Steps</th>
										<th>Distance (km)</th>
										<th>Calories Burned (kcal)</th>
									</tr>
								</thead>
								<tbody>
									{tableActivities.map((act) => (
										<tr key={act.id}>
											<td className="font-medium text-[var(--ink)]">
												{formatDate(act.date)}
											</td>
											<td className="font-mono font-semibold text-[var(--accent)]">
												{act.steps.toLocaleString()}
											</td>
											<td className="font-mono text-[var(--ink)]">
												{act.distance.toFixed(2)}
											</td>
											<td className="font-mono text-[var(--ink)]">
												{act.calories.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
