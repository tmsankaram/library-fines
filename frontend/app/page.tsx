"use client";

import { FormEvent, useEffect, useState } from "react";

type Book = {
	id: number;
	title: string;
	author: string;
	isbn: string;
	total_copies: number;
	available_copies: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HomePage() {
	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);
	const [openBorrow, setOpenBorrow] = useState<number | null>(null);
	const [studentName, setStudentName] = useState("");
	const [studentRollNo, setStudentRollNo] = useState("");
	const [error, setError] = useState("");

	const loadBooks = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/api/books/`, { cache: "no-store" });
			const data = await res.json();
			setBooks(data);
		} catch {
			setError("Could not load books.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadBooks();
	}, []);

	const onBorrow = async (e: FormEvent, bookId: number) => {
		e.preventDefault();
		setError("");
		try {
			const res = await fetch(`${API_URL}/api/borrow/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					book_id: bookId,
					student_name: studentName,
					student_roll_no: studentRollNo,
				}),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.detail || "Failed to borrow book.");
			}
			setStudentName("");
			setStudentRollNo("");
			setOpenBorrow(null);
			await loadBooks();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Borrow failed.");
		}
	};

	return (
		<main className="space-y-4">
			{error && <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-red-700">{error}</div>}
			{loading ? (
				<div className="panel p-6">Loading books...</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{books.map((book) => {
						const available = book.available_copies > 0;
						return (
							<article key={book.id} className="panel p-4">
								<div className="flex items-start justify-between gap-2">
									<div>
										<h2 className="font-display text-xl font-bold text-amber-900">{book.title}</h2>
										<p className="text-sm text-amber-700">{book.author}</p>
									</div>
									<span
										className={`rounded-full px-2 py-1 text-xs font-bold ${available ? "bg-green-100 text-pine" : "bg-red-100 text-ember"
											}`}
									>
										{book.available_copies} available
									</span>
								</div>

								<button
									disabled={!available}
									onClick={() => setOpenBorrow(openBorrow === book.id ? null : book.id)}
									className="mt-4 rounded bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-400"
								>
									Borrow
								</button>

								{openBorrow === book.id && (
									<form className="mt-3 space-y-2" onSubmit={(e) => onBorrow(e, book.id)}>
										<input
											required
											value={studentName}
											onChange={(e) => setStudentName(e.target.value)}
											placeholder="Student name"
											className="w-full rounded border border-amber-200 px-3 py-2"
										/>
										<input
											required
											value={studentRollNo}
											onChange={(e) => setStudentRollNo(e.target.value)}
											placeholder="Roll number"
											className="w-full rounded border border-amber-200 px-3 py-2"
										/>
										<button className="rounded bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700">
											Confirm Borrow
										</button>
									</form>
								)}
							</article>
						);
					})}
				</div>
			)}
		</main>
	);
}
