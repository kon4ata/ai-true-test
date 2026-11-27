"use client";

import { DAY_MS } from "@/shared/constants.ts";
import type { Branch, Filters } from "@/shared/types.ts";
import { useForm } from "react-hook-form";

interface IFiltersFormProps {
	filters: Filters;
	branches: Branch[];
	onSetSearchParams: (filters: Filters) => void;
}

export function FiltersForm({
	filters,
	branches,
	onSetSearchParams,
}: IFiltersFormProps) {
	// values синхронизирует форму с URL, например при нажатии «Назад»
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Filters>({
		values: filters,
	});

	const validateDateInput = (to: string, values: Filters) => {
		if (to < values.from) {
			return "Конец периода раньше начала";
		}

		const days = (Date.parse(to) - Date.parse(values.from)) / DAY_MS + 1;

		return days <= 366 || "Не больше 366 дней";
	};

	const showCompany = new Set(branches.map((b) => b.companyId)).size > 1;

	return (
		<form
			onSubmit={handleSubmit(onSetSearchParams)}
			className="flex flex-wrap items-start gap-4"
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
				С
				<input
					type="date"
					{...register("from", {
						required: "Укажите дату",
					})}
					className="border rounded px-3 py-2"
				/>

				{errors.from && (
					<span className="text-red-600">{errors.from.message}</span>
				)}
			</label>

			<label className="flex flex-col text-sm gap-1">
				По
				<input
					type="date"
					className="border rounded px-3 py-2"
					{...register("to", {
						required: "Укажите дату",
						validate: validateDateInput,
					})}
				/>

				{errors.to && (
					<span className="text-red-600">{errors.to.message}</span>
				)}
			</label>

			<button
				type="submit"
				className="border text-white rounded px-4 py-2 mt-6"
			>
				Применить
			</button>
		</form>
	);
}
