export function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="h-24 rounded-lg bg-gray-100"
					/>
				))}
			</div>
		</div>
	);
}
