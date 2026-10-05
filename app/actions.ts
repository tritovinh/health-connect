"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { fetchGoogleDayData } from "@/lib/google-health";
import { revalidatePath } from "next/cache";

async function syncHealthEachDay(
	targetDate: Date,
	userId: string,
	sessionToken: string,
) {
	const date = targetDate;
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const dateStr: string = `${year}-${month}-${day}`;
	try {
		const healthData = await fetchGoogleDayData(
			sessionToken,
			dateStr,
			dateStr,
		);

		const calendarDate = new Date(`${dateStr}T00:00:00.000Z`);

		const saved = await db.dailyActivity.upsert({
			where: {
				userId_date: {
					userId: userId,
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
				userId: userId,
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
				userId: userId,
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

export async function syncHealthDataAction(targetDate: Date = new Date()) {
	const user = await getAuthenticatedUser();
	const session = await auth();

	if (session?.error === "RefreshAccessTokenError" || !session?.accessToken) {
		return {
			success: false,
			requiresReauth: true,
			error: "Your Google session has expired. Please sign out and sign back in to reconnect.",
		};
	}

	for (let i = 29; i >= 0; i--) {
		const syncDate = new Date(targetDate);
		syncDate.setDate(targetDate.getDate() - i);
		await syncHealthEachDay(syncDate, user.id, session.accessToken);
	}
}
