"use client";

import { DATE_RE, DAY_MS, METRICS, UUID_RE } from "@/shared/constants.ts";
import type { Filters, Metrics } from "@/shared/types.ts";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useBranches } from "./client-actions/useBranches";
import { useDashboard } from "./client-actions/useDashboard";
import { DynamicsChart } from "./dynamics-chart";
import { FiltersForm } from "./filters-form.tsx";

function show(key: keyof Metrics, value: number | null) {
	if (value === null) return "—";

	return key === "avgRating"
		? value.toFixed(2)
		: value.toLocaleString("ru-RU");
}

function formatDate(d: Date) {
	return d.toISOString().slice(0, 10);
}

function useDefaultFilters() {
	return useState(() => {
		const to = new Date();
		const from = new Date(to.getTime() - 29 * DAY_MS);

		return { from: formatDate(from), to: formatDate(to) };
	})[0];
}

export function DashboardView() {
	// Некорректные значения из URL заменяются значениями по умолчанию
	const router = useRouter();
	const params = useSearchParams();
	const defaults = useDefaultFilters();

	const from = params.get("from");
	const to = params.get("to");
	const branchId = params.get("branchId");

	const filters: Filters = {
		branchId: branchId && UUID_RE.test(branchId) ? branchId : "",
		from: from && DATE_RE.test(from) ? from : defaults.from,
		to: to && DATE_RE.test(to) ? to : defaults.to,
	};

	function setSearchParams(next: Filters) {
		const qs = new URLSearchParams({
			from: next.from,
			to: next.to,
		});

		if (next.branchId) qs.set("branchId", next.branchId);

		router.push(`?${qs}`);
	}

	const {
		data: dashboardData,
		error: dashboardError,
		isPending: isDashboardPending,
		isFetching: isDashboardFetching,
		refetch: refetchDashboard,
	} = useDashboard(filters);

	const { data: branchesData } = useBranches();

	const title =
		branchesData?.find((b) => b.id === filters.branchId)?.name ??
		"Все филиалы";

	// TODO убрать кучу jsx из кода и вынести в отдельные return
	return (
		<div className="space-y-6">
			<div className="flex items-baseline justify-between">
				<h1 className="text-xl font-semibold">{title}</h1>
				{isDashboardFetching && (
					<span className="text-sm text-gray-500">Обновляем…</span>
				)}
			</div>

			<FiltersForm
				filters={filters}
				branches={branchesData ?? []}
				onSetSearchParams={setSearchParams}
			/>

			{dashboardError && (
				<div
					role="alert"
					className="border border-red-300 bg-red-50 text-red-800 rounded p-4 flex justify-between"
				>
					<span>{dashboardError.message}</span>
					<button
						onClick={() => refetchDashboard()}
						className="underline"
					>
						Повторить
					</button>
				</div>
			)}

			{isDashboardPending && !dashboardError && (
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="h-24 rounded-lg bg-gray-100"
						/>
					))}
				</div>
			)}

			{dashboardData && (
				<div
					className={`space-y-6 ${isDashboardFetching ? "opacity-60" : ""}`}
				>
					{dashboardData.byBranch.length === 0 ? (
						<p className="text-gray-500">
							Нет данных за выбранный период.
						</p>
					) : (
						<>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{METRICS.map(({ key, label }) => (
									<div
										key={key}
										className="rounded-lg border p-4"
									>
										<div className="text-sm text-gray-500">
											{label}
										</div>
										<div className="text-2xl font-semibold mt-1">
											{show(
												key,
												dashboardData.summary[key],
											)}
										</div>
									</div>
								))}
							</div>

							<DynamicsChart points={dashboardData.daily} />

							<section className="rounded-lg border p-4 overflow-x-auto">
								<h2 className="font-semibold mb-3">
									По филиалам
								</h2>
								<table className="w-full text-sm">
									<thead>
										<tr className="text-left text-gray-500">
											<th className="py-2 pr-4">
												Филиал
											</th>
											{METRICS.map((m) => (
												<th
													key={m.key}
													className="py-2 pr-4"
												>
													{m.label}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{dashboardData.byBranch.map((row) => (
											<tr
												key={row.branchId}
												className="border-t"
											>
												<td className="py-2 pr-4">
													<button
														className="underline"
														onClick={() =>
															setSearchParams({
																...filters,
																branchId:
																	row.branchId,
															})
														}
													>
														{row.branchName}
													</button>
												</td>
												{METRICS.map((m) => (
													<td
														key={m.key}
														className="py-2 pr-4"
													>
														{/* 1231233 */}
														{show(
															m.key,
															row[m.key],
														)}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</section>
						</>
					)}
				</div>
			)}
		</div>
	);
}
