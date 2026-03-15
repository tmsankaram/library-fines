"use client";

import { useEffect, useMemo, useState } from "react";

type BorrowRecord = {
	id: number;
	book: number;
	book_title: string;
	student_name: string;
	student_roll_no: string;
	borrowed_date: string;
	due_date: string;
	returned_date: string | null;
	is_returned: boolean;
	fine_amount: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReturnsPage() {
	const [records, setRecords] = useState<BorrowRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadRecords = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/api/borrow/`, { cache: "no-store" });
			const data = await res.json();
			setRecords(data);
		} catch {
			setError("Could not load borrow records.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadRecords();
	}, []);

	const today = useMemo(() => new Date(), []);

	const statusOf = (record: BorrowRecord) => {
		if (record.is_returned) return "Returned";
		const due = new Date(record.due_date);
		if (due < today) return "Overdue";
		return "Active";
	};

	const markReturned = async (id: number) => {
		try {
			const res = await fetch(`${API_URL}/api/borrow/${id}/return/`, { method: "POST" });
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.detail || "Return failed.");
			}
			await loadRecords();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Return failed.");
		}
	};

	return (
		<main className="panel overflow-hidden">
			{error && <div className="m-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-700">{error}</div>}
			{loading ? (
				<div className="p-6">Loading borrow records...</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-amber-100 text-amber-900">
							<tr>
								<th className="px-4 py-3">Book</th>
								<th className="px-4 py-3">Student</th>
								<th className="px-4 py-3">Roll No</th>
								<th className="px-4 py-3">Borrowed Date</th>
								<th className="px-4 py-3">Due Date</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3">Fine</th>
								<th className="px-4 py-3">Action</th>
							</tr>
						</thead>
						<tbody>
							{records.map((record) => {
								const status = statusOf(record);
								return (
									<tr key={record.id} className="border-t border-amber-100">
										<td className="px-4 py-3">{record.book_title}</td>
										<td className="px-4 py-3">{record.student_name}</td>
										<td className="px-4 py-3">{record.student_roll_no}</td>
										<td className="px-4 py-3">{record.borrowed_date}</td>
										<td className="px-4 py-3">{record.due_date}</td>
										<td className="px-4 py-3 font-semibold">{status}</td>
										<td className={`px-4 py-3 font-bold ${record.fine_amount > 0 ? "text-ember" : "text-green-700"}`}>
											₹{record.fine_amount}
										</td>
										<td className="px-4 py-3">
											{!record.is_returned ? (
												<button
													onClick={() => markReturned(record.id)}
													className="rounded bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
												>
													Mark Returned
												</button>
											) : (
												<span className="text-xs text-gray-500">Closed</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</main>
	);
}
