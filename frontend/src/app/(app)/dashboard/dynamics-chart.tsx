"use client";

import { METRICS } from "@/shared/constants";
import type { DailyPoint, Metrics } from "@/shared/types.ts";
import { useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface IDynamicsChartProps {
	points: DailyPoint[];
}

export function DynamicsChart({
	points
}: IDynamicsChartProps) {
	// Данные по всем метрикам уже загружены, переключение обходится без запроса
	const [metric, setMetric] = useState<keyof Metrics>("views");

	const label = METRICS.find((m) => m.key === metric)?.label;

	return (
		<section className="rounded-lg border p-4 space-y-4">
			<div className="flex flex-wrap gap-2">
				{METRICS.map((m) => (
					<button
						key={m.key}
						onClick={() => setMetric(m.key)}
						className={`px-3 py-1 rounded-full text-sm border ${metric === m.key ? "bg-black text-white" : ""}`}
					>
						{m.label}
					</button>
				))}
			</div>

			<div className="h-72">
				<ResponsiveContainer
					width="100%"
					height="100%"
				>
					<LineChart data={points}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="date"
							tickFormatter={(d: string) => d.slice(5)}
						/>
						<YAxis
							domain={
								metric === "avgRating"
									? [1, 5]
									: ["auto", "auto"]
							}
						/>
						<Tooltip />
						<Line
							type="monotone"
							dataKey={metric}
							name={label}
							stroke="#2563eb"
							dot={{ r: 3 }}
							connectNulls={true}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}
