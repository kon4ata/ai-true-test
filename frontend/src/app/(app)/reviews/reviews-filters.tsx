"use client";

import { REVIEW_STATUSES } from "@/shared/constants.ts";
import type { Branch, ReviewFilters } from "@/shared/types.ts";
import { useForm } from "react-hook-form";

interface IReviewsFiltersProps {
	filters: ReviewFilters;
	branches: Branch[];
	onSetSearchParams: (f: ReviewFilters) => void;
}

export function ReviewsFilters({
	filters,
	branches,
	onSetSearchParams,
}: IReviewsFiltersProps) {
	const {
		register,
		handleSubmit,
	} = useForm<ReviewFilters>({
		values: filters,
	});

	const showCompany = new Set(branches.map((b) => b.companyId)).size > 1;

	return (
		<form
			onSubmit={handleSubmit((v) => onSetSearchParams({ ...v, page: 1 }))}
			className="flex flex-wrap items-end gap-4"
		>
			<label className="flex flex-col text-sm gap-1">
				Филиал
				<select
					{...register("branchId")}
					className="border rounded px-3 py-2 bg-black"
				>
					<option value="">Все филиалы</option>
					{branches.map((b) => (
						<option
							key={b.id}
							value={b.id}
						>
							{showCompany
								? `${b.companyName} — ${b.name}`
								: b.name}
						</option>
					))}
				</select>
			</label>

			<label className="flex flex-col text-sm gap-1">
				Рейтинг
				<select
					{...register("rating")}
					className="border rounded px-3 py-2 bg-black"
				>
					<option value="">Любой</option>
					{[5, 4, 3, 2, 1].map((r) => (
						<option
							key={r}
							value={r}
						>
							{r} ★
						</option>
					))}
				</select>
			</label>

			<label className="flex flex-col text-sm gap-1">
				Статус
				<select
					{...register("status")}
					className="border rounded px-3 py-2 bg-black"
				>
					<option value="">Любой</option>
					{REVIEW_STATUSES.map((s) => (
						<option
							key={s.value}
							value={s.value}
						>
							{s.label}
						</option>
					))}
				</select>
			</label>

			<label className="flex flex-col text-sm gap-1">
				С
				<input
					type="date"
					{...register("from")}
					className="border rounded px-3 py-2"
				/>
			</label>

			<label className="flex flex-col text-sm gap-1">
				По
				<input
					type="date"
					{...register("to")}
					className="border rounded px-3 py-2"
				/>
			</label>

			<button
				type="submit"
				className="border text-white rounded px-4 py-2"
			>
				Применить
			</button>
		</form>
	);
}
