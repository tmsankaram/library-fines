"use client";

import { useEffect, useState } from "react";

type FineRecord = {
	id: number;
	book_title: string;
	student_name: string;
	student_roll_no: string;
	due_date: string;
	fine_amount: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function FinesPage() {
	const [records, setRecords] = useState<FineRecord[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadFines = async () => {
			try {
				const res = await fetch(`${API_URL}/api/fines/`, { cache: "no-store" });
				const data = await res.json();
				setRecords(data);
			} finally {
				setLoading(false);
			}
		};
		loadFines();
	}, []);

	const daysOverdue = (dueDate: string) => {
		const due = new Date(dueDate);
		const now = new Date();
		const diff = now.getTime() - due.getTime();
		return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
	};

	return (
		<main className="space-y-6">
			<section className="panel p-8 text-center">
				<h2 className="font-display text-5xl font-extrabold uppercase tracking-wide text-ember">Wall of Shame</h2>
			</section>

			<section className="grid gap-4">
				{loading ? (
					<div className="panel p-6">Loading overdue records...</div>
				) : records.length === 0 ? (
					<div className="panel p-6 text-green-700">No overdue records. Miracles happen.</div>
				) : (
					records.map((record) => (
						<article key={record.id} className="panel p-5">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-lg font-bold text-amber-900">{record.student_name}</p>
									<p className="text-sm text-amber-700">Roll No: {record.student_roll_no}</p>
									<p className="text-sm text-amber-700">Book: {record.book_title}</p>
									<p className="text-sm text-amber-700">{daysOverdue(record.due_date)} days overdue</p>
								</div>
								<p className="text-4xl font-extrabold text-ember">₹{record.fine_amount}</p>
							</div>
						</article>
					))
				)}
			</section>

			<p className="text-center text-sm font-semibold text-amber-900">
				Fines accumulate at ₹5/day. We don't negotiate.
			</p>
		</main>
	);
}
