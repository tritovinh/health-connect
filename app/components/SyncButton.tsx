"use client";

import { useTransition, useState } from "react";
import { syncHealthDataAction } from "@/app/actions";

export function SyncButton() {
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<string | null>(null);

	// Get today in local browser timezone: YYYY-MM-DD
	const getTodayStr = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const [selectedDate, setSelectedDate] = useState(getTodayStr());

	const handleSync = () => {
		setMessage(null);
		startTransition(async () => {
			try {
				const result = await syncHealthDataAction(selectedDate);
				if (result?.success) {
					setMessage(`Synced ${result.date} successfully! ${result.steps.toLocaleString()} steps`);
				}
			} catch (error: any) {
				console.error(error);
				setMessage(error?.message || "Failed to sync health data");
			}
		});
	};

	return (
		<div className="flex flex-col items-end gap-2">
			<div className="flex flex-wrap items-center gap-2">
				<input
					type="date"
					value={selectedDate}
					onChange={(e) => setSelectedDate(e.target.value)}
					disabled={isPending}
					className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
				/>
				<button
					onClick={handleSync}
					disabled={isPending}
					className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isPending ? (
						<>
							<svg
								className="h-4 w-4 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							<span>Syncing...</span>
						</>
					) : (
						<span>Sync Google Health</span>
					)}
				</button>
			</div>

			{message && (
				<p
					className={`text-xs ${
						message.includes("success")
							? "text-emerald-600 dark:text-emerald-400"
							: "text-rose-500"
					}`}
				>
					{message}
				</p>
			)}
		</div>
	);
}
