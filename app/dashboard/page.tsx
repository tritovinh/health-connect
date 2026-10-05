import { getAuthenticatedUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { signOut } from "@/auth";
import { SyncButton } from "@/app/components/SyncButton";
import { StatCard } from "@/app/components/StatCard";
import { ProgressRing } from "@/app/components/ProgressRing";
import { DashboardOverview } from "@/app/components/DashboardOverview";
import { type Period } from "@/app/components/PeriodToggle";
import { getStartOfWeek, getStartOfMonth, formatDate } from "@/lib/date-utils";
import { Footprints, Route, Flame, LogOut } from "lucide-react";

interface DashboardPageProps {
	searchParams?: Promise<{ period?: string }>;
}

export default async function DashboardPage({
	searchParams,
}: DashboardPageProps) {
	const user = await getAuthenticatedUser();
	const resolvedParams = await searchParams;

	const initialPeriod: Period =
		resolvedParams?.period === "month" ? "month" : "week";

	const startOfWeek = getStartOfWeek();
	const startOfMonth = getStartOfMonth();
	const earliestStart =
		startOfWeek < startOfMonth ? startOfWeek : startOfMonth;

	const [latest, rawActivities] = await Promise.all([
		db.dailyActivity.findFirst({
			where: { userId: user.id },
			orderBy: { date: "desc" },
		}),
		db.dailyActivity.findMany({
			where: {
				userId: user.id,
				date: { gte: earliestStart },
			},
			orderBy: { date: "asc" },
		}),
	]);

	const activities = rawActivities.map((a) => ({
		id: a.id,
		date: a.date.toISOString(),
		steps: a.steps,
		distance: a.distance,
		calories: a.calories,
	}));

	const stepGoal = 10000;
	const stepPercentage = latest
		? Math.round((latest.steps / stepGoal) * 100)
		: 0;
	const caloriesGoal = 250;
	const caloriesPercentage = latest
		? Math.round((latest.calories / caloriesGoal) * 100)
		: 0;

	return (
		<div className="min-h-screen text-[var(--ink)] p-6 sm:p-10">
			<div className="mx-auto max-w-5xl space-y-12">
				<header className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-center">
					<div>
						<h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-[var(--ink)]">
							Health Connect
						</h1>
						<p className="mt-1 text-sm text-[var(--muted)]">
							Welcome back, {user.name || user.email}!
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<SyncButton />
						<form
							action={async () => {
								"use server";
								await signOut({ redirectTo: "/" });
							}}
						>
							<button
								type="submit"
								title="Sign Out"
								className="btn btn-ghost btn-sm"
							>
								<LogOut className="h-4 w-4" />
								<span>Sign Out</span>
							</button>
						</form>
					</div>
				</header>

				<section className="space-y-4">
					<div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-end">
						<div>
							<h2 className="text-2xl font-serif font-normal text-[var(--ink)]">
								Today Data
							</h2>
						</div>
						{latest && (
							<span className="text-xs text-[var(--muted)]">
								Latest entry: {formatDate(latest.date)}
							</span>
						)}
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<StatCard
							title="Steps Today"
							value={latest ? latest.steps.toLocaleString() : 0}
							unit="steps"
							icon={<Footprints className="h-4 w-4" />}
							accentColor="emerald"
							subtitle={`${stepPercentage}% of ${stepGoal.toLocaleString()} goal`}
							visual={
								<ProgressRing
									current={latest ? latest.steps : 0}
									goal={stepGoal}
									size={60}
									strokeWidth={6}
									showLabel={false}
								/>
							}
						/>

						<StatCard
							title="Distance"
							value={latest ? latest.distance.toFixed(2) : "0.00"}
							unit="km"
							icon={<Route className="h-4 w-4" />}
							accentColor="blue"
							subtitle={
								latest
									? `${(latest.distance * 0.621371).toFixed(2)} miles`
									: undefined
							}
						/>

						<StatCard
							title="Active Calories"
							value={
								latest ? latest.calories.toLocaleString() : 0
							}
							unit="kcal"
							icon={<Flame className="h-4 w-4" />}
							accentColor="amber"
							subtitle={`${caloriesPercentage}% of ${caloriesGoal.toLocaleString()} goal`}
							visual={
								<ProgressRing
									current={latest ? latest.calories : 0}
									goal={caloriesGoal}
									size={60}
									strokeWidth={6}
									showLabel={false}
								/>
							}
						/>
					</div>
				</section>

				<DashboardOverview
					activities={activities}
					initialPeriod={initialPeriod}
					lastSynced={
						latest
							? new Date(latest.syncedAt).toLocaleTimeString()
							: null
					}
				/>
			</div>
		</div>
	);
}
