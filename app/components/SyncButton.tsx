"use client";

import { useTransition, useState } from "react";
import { syncHealthDataAction } from "@/app/actions";

export function SyncButton() {
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<string | null>(null);

	const handleSync = () => {
		setMessage(null);
		startTransition(async () => {
			try {
				const result = await syncHealthDataAction();
				if (result?.success) {
					setMessage(`Synced successfully!`);
				} else if (result?.error) {
					setMessage(result.error);
				}
			} catch (error: unknown) {
				console.error(error);
				const err = error as Error;
				setMessage(err?.message || "Failed to sync health data");
			}
		});
	};

	return (
		<div className="flex flex-col items-end gap-2">
			<div className="flex flex-wrap items-center gap-2">
				<button
					onClick={handleSync}
					disabled={isPending}
					className="btn btn-accent"
				>
					{isPending ? (
						<>
							<svg
								className="h-4 w-4 animate-spin text-current"
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
							? "text-[var(--good)]"
							: "text-[var(--bad)]"
					}`}
				>
					{message}
				</p>
			)}
		</div>
	);
}
