import type { ReviewFilters, ReviewStatus } from "@/shared/types.ts";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { loadReviews, updateReviewStatus } from "../reviews-api.ts";

export const useReviews = (filters: ReviewFilters) => {
	return useQuery({
		queryKey: ["reviews", filters],
		queryFn: () => loadReviews(filters),
		placeholderData: keepPreviousData,
	});
};	

export const useUpdateReviewStatus = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			status,
		}: {
			id: string;
			status:
			ReviewStatus,
		}) =>
			updateReviewStatus(id, status),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
	});
};
