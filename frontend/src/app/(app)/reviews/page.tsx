import { Suspense } from "react";
import { ReviewsView } from "./reviews-view.tsx";

export default function ReviewsPage() {
	return (
		<Suspense
			fallback={<div className="h-40 rounded-lg bg-gray-100 animate-pulse" />}
		>
			<ReviewsView />
		</Suspense>
	);
}
