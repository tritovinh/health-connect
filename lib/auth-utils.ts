import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getAuthenticatedUser() {
	const session = await auth();

	if (!session?.user?.email) {
		redirect("/api/auth/signin");
	}

	const user = await db.user.findUnique({
		where: { email: session.user.email },
	});

	if (!user) {
		redirect("/api/auth/signin");
	}

	return user;
}
