import type { Filters } from "@/shared/types.ts";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { loadDashboard } from "../dashboard-api.ts";

export const useDashboard = (filters: Filters) => {
	return useQuery({
		queryKey: ["dashboard", filters],
		queryFn: () => loadDashboard(filters),
		placeholderData: keepPreviousData,
	});
};
