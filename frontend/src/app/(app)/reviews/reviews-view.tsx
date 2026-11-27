"use client";

import { DATE_RE, REVIEW_PAGE_SIZE, UUID_RE } from "@/shared/constants.ts";
import type { ReviewFilters } from "@/shared/types.ts";
import { useRouter, useSearchParams } from "next/navigation";
import { useBranches } from "../dashboard/client-actions/useBranches";
import { useReviews } from "./client-actions/useReviews.ts";
import { ReviewRow } from "./review-row.tsx";
import { ReviewsFilters } from "./reviews-filters.tsx";

export function ReviewsView() {
	const router = useRouter();
	const params = useSearchParams();

	const branchId = params.get("branchId") ?? "";
	const rating = params.get("rating") ?? "";
	const status = params.get("status") ?? "";
	const from = params.get("from") ?? "";
	const to = params.get("to") ?? "";
	const pageRaw = Number(params.get("page") ?? "1");

	const filters: ReviewFilters = {
		branchId: UUID_RE.test(branchId) ? branchId : "",
		rating: /^[1-5]$/.test(rating) ? rating : "",
		status: ["new", "in_progress", "processed"].includes(status)
			? status
			: "",
		from: DATE_RE.test(from) ? from : "",
		to: DATE_RE.test(to) ? to : "",
		page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
	};

	function setSearchParams(next: ReviewFilters) {
		const qs = new URLSearchParams();

		if (next.branchId) qs.set("branchId", next.branchId);
		if (next.rating) qs.set("rating", next.rating);
		if (next.status) qs.set("status", next.status);
		if (next.from) qs.set("from", next.from);
		if (next.to) qs.set("to", next.to);
		if (next.page > 1) qs.set("page", String(next.page));

		router.push(`?${qs}`);
	}

	const { data, error, isPending, isFetching, refetch } = useReviews(filters);
	const { data: branchesData } = useBranches();

	const totalPages = data
		? Math.max(1, Math.ceil(data.total / REVIEW_PAGE_SIZE))
		: 1;

	return (
		<div className="space-y-6">
			<div className="flex items-baseline justify-between">
				<h1 className="text-xl font-semibold">Отзывы</h1>
				{isFetching && (
					<span className="text-sm text-gray-500">Обновляем…</span>
				)}
			</div>

			<ReviewsFilters
				filters={filters}
				branches={branchesData ?? []}
				onSetSearchParams={setSearchParams}
			/>

			{error && (
				<div
					role="alert"
					className="border border-red-300 bg-red-50 text-red-800 rounded p-4 flex justify-between"
				>
					<span>{error.message}</span>
					<button
						onClick={() => refetch()}
						className="underline"
					>
						Повторить
					</button>
				</div>
			)}

			{isPending && !error && (
				<div className="h-40 rounded-lg bg-gray-100 animate-pulse" />
			)}

			{data && (
				<div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
					{data.items.length === 0 ? (
						<p className="text-gray-500">
							Отзывов по выбранным фильтрам нет.
						</p>
					) : (
						<div className="rounded-lg border p-4 overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left text-gray-500">
										<th className="py-2 pr-4">Филиал</th>
										<th className="py-2 pr-4">Автор</th>
										<th className="py-2 pr-4">Оценка</th>
										<th className="py-2 pr-4">Текст</th>
										<th className="py-2 pr-4">Дата</th>
										<th className="py-2 pr-4">Статус</th>
									</tr>
								</thead>
								<tbody>
									{data.items.map((r) => (
										<ReviewRow
											key={r.id}
											review={r}
										/>
									))}
								</tbody>
							</table>
						</div>
					)}

					{data.total > REVIEW_PAGE_SIZE && (
						<div className="flex items-center justify-between text-sm">
							<span>Всего: {data.total}</span>
							<div className="flex items-center gap-3">
								<button
									disabled={filters.page <= 1}
									onClick={() =>
										setSearchParams({
											...filters,
											page: filters.page - 1,
										})
									}
									className="underline disabled:opacity-40"
								>
									Назад
								</button>

								<span>
									{filters.page} / {totalPages}
								</span>

								<button
									disabled={filters.page >= totalPages}
									onClick={() =>
										setSearchParams({
											...filters,
											page: filters.page + 1,
										})
									}
									className="underline disabled:opacity-40"
								>
									Вперёд
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
