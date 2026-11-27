"use client";

import { REVIEW_STATUSES } from "@/shared/constants.ts";
import type { Review, ReviewStatus } from "@/shared/types.ts";
import { useUpdateReviewStatus } from "./client-actions/useReviews.ts";

interface IReviewRowProps {
	review: Review;
}

export function ReviewRow({ review }: IReviewRowProps) {
	const {
		mutate,
		isPending,
		error,
	} = useUpdateReviewStatus();

	return (
		<tr className="border-t align-top">
			<td className="py-2 pr-4 whitespace-nowrap">{review.branchName}</td>
			<td className="py-2 pr-4 whitespace-nowrap">{review.authorName}</td>
			<td className="py-2 pr-4 whitespace-nowrap">
				{"★".repeat(review.rating)}
			</td>
			<td className="py-2 pr-4">{review.text}</td>
			<td className="py-2 pr-4 whitespace-nowrap">
				{new Date(review.publishedAt).toLocaleDateString("ru-RU")}
			</td>
			<td className="py-2 pr-4">
				<select
					value={review.status}
					disabled={isPending}
					onChange={(e) =>
						mutate({
							id: review.id,
							status: e.target.value as ReviewStatus,
						})
					}
					className="border rounded px-2 py-1 bg-black"
				>
					{REVIEW_STATUSES.map((s) => (
						<option
							key={s.value}
							value={s.value}
						>
							{s.label}
						</option>
					))}
				</select>

				{error && (
					<p className="text-red-600 text-xs mt-1">{error.message}</p>
				)}
			</td>
		</tr>
	);
}
