import { getAuthenticatedUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { SyncButton } from "@/app/components/SyncButton";
import { StatCard } from "@/app/components/StatCard";
import { ProgressRing } from "@/app/components/ProgressRing";
import { Footprints, Route, Flame } from "lucide-react";

export default async function DashboardPage() {
	const user = await getAuthenticatedUser();

	const activities = await db.dailyActivity.findMany({
		where: { userId: user.id },
		orderBy: { date: "desc" },
		take: 7,
	});

	const latest = activities[0];
	const stepGoal = 10000;
	const stepPercentage = latest
		? Math.round((latest.steps / stepGoal) * 100)
		: 0;
	const caloriesGoal = 250;
	const caloriesPercentage = latest
		? Math.round((latest.calories / caloriesGoal) * 100)
		: 0;

	return (
		<div className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-black dark:text-zinc-100 sm:p-10">
			<div className="mx-auto max-w-4xl space-y-8">
				<header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
					<div>
						<h1 className="text-3xl font-extrabold tracking-tight">
							Health Connect
						</h1>
						<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
							Welcome back, {user.name || user.email}!
						</p>
					</div>

					<SyncButton />
				</header>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<StatCard
						title="Steps Today"
						value={latest ? latest.steps.toLocaleString() : 0}
						unit="steps"
						icon={<Footprints className="h-5 w-5" />}
						accentColor="emerald"
						subtitle={`${stepPercentage}% of ${stepGoal.toLocaleString()} goal`}
						visual={
							<ProgressRing
								current={latest ? latest.steps : 0}
								goal={stepGoal}
								size={64}
								strokeWidth={7}
								showLabel={false}
							/>
						}
					/>

					<StatCard
						title="Distance"
						value={latest ? latest.distance.toFixed(2) : "0.00"}
						unit="km"
						icon={<Route className="h-5 w-5" />}
						accentColor="blue"
						subtitle={
							latest
								? `${(latest.distance * 0.621371).toFixed(2)} miles`
								: undefined
						}
					/>

					<StatCard
						title="Active Calories"
						value={latest ? latest.calories.toLocaleString() : 0}
						unit="kcal"
						icon={<Flame className="h-5 w-5" />}
						accentColor="amber"
						subtitle={`${stepPercentage}% of ${caloriesGoal.toLocaleString()} goal`}
						visual={
							<ProgressRing
								current={latest ? latest.calories : 0}
								goal={caloriesGoal}
								size={64}
								strokeWidth={7}
								showLabel={false}
							/>
						}
					/>
				</div>

				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<div className="flex items-center justify-between pb-4">
						<h2 className="text-lg font-bold">
							Synced Health Records
						</h2>
						{latest && (
							<span className="text-xs text-zinc-400">
								Last synced:{" "}
								{new Date(latest.syncedAt).toLocaleTimeString()}
							</span>
						)}
					</div>

					{activities.length === 0 ? (
						<div className="py-10 text-center text-sm text-zinc-400">
							No health data synced yet. Click the{" "}
							<strong>&quot;Sync Google Health Data&quot;</strong>{" "}
							button above to pull your steps from Google!
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-zinc-100 text-xs uppercase text-zinc-400 dark:border-zinc-800">
										<th className="pb-3">Date</th>
										<th className="pb-3">Steps</th>
										<th className="pb-3">Distance (km)</th>
										<th className="pb-3">
											Calories Burned (kcal)
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
									{activities.map((act) => (
										<tr key={act.id} className="py-3">
											<td className="py-3 font-medium">
												{new Date(
													act.date,
												).toLocaleDateString(
													undefined,
													{
														timeZone: "UTC",
														weekday: "short",
														month: "short",
														day: "numeric",
													},
												)}
											</td>
											<td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
												{act.steps.toLocaleString()}
											</td>
											<td className="py-3">
												{act.distance.toFixed(2)}
											</td>
											<td className="py-3">
												{act.calories.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
