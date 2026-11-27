import { http } from "@/shared/http.ts";
import type { Branch } from "@/shared/types.ts";
import { useQuery } from "@tanstack/react-query";

export const useBranches = () => {
	return useQuery<Branch[]>({
		queryKey: ["branches"],
		queryFn: () => http("/bff/branches"),
		staleTime: 5 * 60_000,
	});
};
