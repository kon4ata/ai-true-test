export interface Metrics {
	views: number;
	websiteClicks: number;
	calls: number;
	routes: number;
	reviewsCount: number;
	avgRating: number | null;
}

export interface DailyPoint extends Metrics {
	date: string;
}

export interface BranchRow extends Metrics {
	branchId: string;
	branchName: string;
}

export interface Branch {
	id: string;
	companyId: string;
	companyName: string;
	name: string;
}

export interface Filters {
	branchId: string; // '' = все филиалы
	from: string;
	to: string;
}

export type ReviewStatus = "new" | "in_progress" | "processed";

export interface Review {
	id: string;
	branchId: string;
	branchName: string;
	authorName: string;
	rating: number;
	text: string;
	status: ReviewStatus;
	publishedAt: string;
	updatedAt: string;
}

export interface ReviewsPage {
	items: Review[];
	total: number;
	page: number;
	limit: number;
}

export interface ReviewFilters {
	branchId: string;
	rating: string;
	status: string;
	from: string;
	to: string;
	page: number;
}
