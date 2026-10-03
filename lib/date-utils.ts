export function getStartOfWeek(refDate: Date = new Date()): Date {
	const day = refDate.getUTCDay();
	const diff = day === 0 ? 6 : day - 1;
	const result = new Date(refDate);
	result.setUTCDate(result.getUTCDate() - diff);
	result.setUTCHours(0, 0, 0, 0);
	return result;
}

export function getStartOfMonth(refDate: Date = new Date()): Date {
	const result = new Date(refDate);
	result.setUTCDate(1);
	result.setUTCHours(0, 0, 0, 0);
	return result;
}

export function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		timeZone: "UTC",
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}
