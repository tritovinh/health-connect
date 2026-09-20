"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { fetchGoogleDayData } from "@/lib/google-health";
import { revalidatePath } from "next/cache";

export async function syncHealthDataAction(targetDate?: string) {
	const user = await getAuthenticatedUser();
	const session = await auth();

	if (session?.error === "RefreshAccessTokenError" || !session?.accessToken) {
		return {
			success: false,
			requiresReauth: true,
			error: "Your Google session has expired. Please sign out and sign back in to reconnect.",
		};
	}

	let dateStr = targetDate;
	if (!dateStr) {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		dateStr = `${year}-${month}-${day}`;
	}

	try {
		// Use the verified fresh accessToken directly from NextAuth session
		const healthData = await fetchGoogleDayData(session.accessToken, dateStr, dateStr);

		const calendarDate = new Date(`${dateStr}T00:00:00.000Z`);

		const saved = await db.dailyActivity.upsert({
			where: {
				userId_date: {
					userId: user.id,
					date: calendarDate,
				},
			},
			update: {
				steps: healthData.steps,
				distance: healthData.distance,
				calories: healthData.calories,
				sleepMin: healthData.sleepMin,
				syncedAt: new Date(),
			},
			create: {
				userId: user.id,
				date: calendarDate,
				steps: healthData.steps,
				distance: healthData.distance,
				calories: healthData.calories,
				sleepMin: healthData.sleepMin,
			},
		});

		const todayLocal = new Date();
		const todayLocalStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;
		const maxValidDate = new Date(`${todayLocalStr}T23:59:59.999Z`);

		await db.dailyActivity.deleteMany({
			where: {
				userId: user.id,
				date: {
					gt: maxValidDate,
				},
			},
		});

		revalidatePath("/dashboard");

		return {
			success: true,
			date: dateStr,
			steps: saved.steps,
			distance: saved.distance,
			calories: saved.calories,
		};
	} catch (error: any) {
		console.error("Failed to sync health data:", error);
		return {
			success: false,
			error: error?.message || "Failed to sync health data.",
		};
	}
}
