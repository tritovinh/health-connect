export interface NornamlizedDailyActivity {
	date: Date;
	steps: number;
	distance: number;
	calories: number;
	sleepMin: number;
	avgHR?: number;
}

const GOOGLE_HEALTH_API = "https://health.googleapis.com/v4/users/me";

async function fetchDataType(
	dataType: string,
	accessToken: string,
	startDate: string,
	endDate: string,
) {
	const filterName = dataType.replace(/-/g, "_");
	const filterExpr = `${filterName}.interval.civil_start_time >= "${startDate}T00:00:00" AND ${filterName}.interval.civil_start_time < "${endDate}T23:59:59"`;

	const url = `${GOOGLE_HEALTH_API}/dataTypes/${dataType}/dataPoints?filter=${encodeURIComponent(filterExpr)}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/json",
		},
	});
	if (!response.ok) {
		const errorText = await response.text();
		console.error(`[${dataType}] Google Error:`, errorText);
		return [];
	}
	const data = await response.json();
	return data.dataPoints ?? [];
}

export async function fetchGoogleDayData(
	accessToken: string,
	startDate: string,
	endDate: string,
): Promise<NornamlizedDailyActivity> {
	const [stepsPoints, distancePoints, caloriesPoints] = await Promise.all([
		fetchDataType("steps", accessToken, startDate, endDate),
		fetchDataType("distance", accessToken, startDate, endDate),
		fetchDataType("active-energy-burned", accessToken, startDate, endDate),
	]);

	const totalSteps = stepsPoints.reduce((sum: number, pt: any) => {
		return (
			sum +
			Number(pt.steps?.count ?? pt.count ?? pt.value?.[0]?.intVal ?? 0)
		);
	}, 0);

	const totalDistance = distancePoints.reduce((sum: number, pt: any) => {
		const mm = Number(pt.distance?.millimeters ?? pt.millimeters);
		return sum + mm / 1000000;
	}, 0);

	const totalCalories = caloriesPoints.reduce((sum: number, pt: any) => {
		const cal = Number(pt.activeEnergyBurned?.kcal);
		return sum + cal;
	}, 0);

	return {
		date: new Date(startDate),
		steps: Math.round(totalSteps),
		distance: Number(totalDistance.toFixed(2)),
		calories: Math.round(totalCalories),
		sleepMin: 0,
	};
}


