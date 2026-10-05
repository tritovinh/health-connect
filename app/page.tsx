import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<div className="card w-full max-w-md p-8 text-center sm:p-10">
				<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]">
					<Activity className="h-7 w-7" />
				</div>

				<h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--ink)]">
					Health Connect
				</h1>

				<p className="mt-2 text-sm text-[var(--muted)]">
					Track your steps, active calories, distance, and personal
					athletic records.
				</p>

				<form
					action={async () => {
						"use server";
						await signIn("google", { redirectTo: "/dashboard" });
					}}
					className="mt-8"
				>
					<button
						type="submit"
						className="btn btn-accent w-full py-3 text-base shadow-lg"
					>
						Sign in with Google
					</button>
				</form>
			</div>
		</div>
	);
}
