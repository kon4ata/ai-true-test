import { REVIEW_PAGE_SIZE } from "@/shared/constants";
import { http } from "@/shared/http.ts";
import type {
	Review,
	ReviewFilters,
	ReviewsPage,
	ReviewStatus,
} from "@/shared/types.ts";

export async function loadReviews(filters: ReviewFilters) {
	const qs = new URLSearchParams({
		page: String(filters.page),
		limit: String(REVIEW_PAGE_SIZE),
	});

	if (filters.branchId) qs.set("branchId", filters.branchId);
	if (filters.rating) qs.set("rating", filters.rating);
	if (filters.status) qs.set("status", filters.status);
	if (filters.from) qs.set("from", filters.from);
	if (filters.to) qs.set("to", filters.to);

	return (await http(`/bff/reviews?${qs}`)) as ReviewsPage;
}

export async function updateReviewStatus(id: string, status: ReviewStatus) {
	return (await http(`/bff/reviews/${id}/status`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ status }),
	})) as Review;
}
