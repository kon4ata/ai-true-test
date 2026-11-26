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
