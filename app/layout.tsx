import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Health Connect — Athlete Dashboard",
	description: "Personal health & athletic activity dashboard powered by Health Connect",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark h-full antialiased">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..800&family=Outfit:wght@300..800&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
