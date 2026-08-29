import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
			<form
				action={async () => {
					"use server";
					await signIn("google", { redirectTo: "/dashboard" });
				}}
			>
				<button
					type="submit"
					className="rounded-full bg-zinc-900 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
				>
					Sign in with Google
				</button>
			</form>
		</div>
	);
}
