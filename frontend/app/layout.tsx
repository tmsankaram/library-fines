import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Library Book Tracker",
	description: "Track books, borrows, returns, and fines",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="font-body">
				<div className="app-shell">
					<header className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
						<h1 className="font-display text-3xl font-bold text-amber-900">Library Book Tracker</h1>
						<nav className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-amber-800">
							<Link href="/" className="rounded bg-amber-200 px-3 py-1 hover:bg-amber-300">
								Home
							</Link>
							<Link href="/returns" className="rounded bg-amber-200 px-3 py-1 hover:bg-amber-300">
								Returns
							</Link>
							<Link href="/fines" className="rounded bg-amber-200 px-3 py-1 hover:bg-amber-300">
								Wall of Shame
							</Link>
						</nav>
					</header>
					{children}
				</div>
			</body>
		</html>
	);
}
