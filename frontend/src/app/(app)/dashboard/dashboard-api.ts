import { http } from "@/shared/http.ts";
import type { BranchRow, DailyPoint, Filters, Metrics } from "@/shared/types.ts";

// запросы идут из браузера параллельно
export async function loadDashboard(filters: Filters) {
	const qs = new URLSearchParams({ from: filters.from, to: filters.to });

	if (filters.branchId) qs.set("branchId", filters.branchId);

	const [summary, daily, byBranch] = await Promise.all([
		http(`/bff/stats/summary?${qs}`),
		http(`/bff/stats/daily?${qs}`),
		http(`/bff/stats/by-branch?${qs}`),
	]);

	// явный кастинг из-за unknown в тайпах по умолчанию
	return {
		summary: summary as Metrics,
		daily: daily.points as DailyPoint[],
		byBranch: byBranch.branches as BranchRow[],
	};
}
