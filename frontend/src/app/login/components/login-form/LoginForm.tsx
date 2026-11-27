"use client";

import { http } from "@/shared/http.ts";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

interface ILoginFormValues {
	email: string;
	password: string;
}

export function LoginForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<ILoginFormValues>({
		shouldFocusError: true,
	});

	const loginFormSubmit: SubmitHandler<ILoginFormValues> = async (data) => {
		clearErrors();

		try {
			await http("/bff/auth/login", {
				method: "POST",
				body: JSON.stringify(data),
				headers: { "content-type": "application/json" },
			});

			router.replace("/dashboard");
		} catch (e) {
			setError('form', {
				message: "Не удалось войти",
			});
		}
	}

	return (
		<form
			onSubmit={handleSubmit(loginFormSubmit)}
			className="w-full max-w-sm bg-white p-6 rounded-lg shadow space-y-4"
		>
			<h1 className="text-xl font-semibold text-gray-700">Вход</h1>

			<input
				{...register("email", {
					required: true,
				})}
				type="email"
				placeholder="Email"
				className="w-full border rounded px-3 py-2 text-gray-500"
			/>

			<input
				{...register("password", {
					required: true,
				})}
				type="password"
				placeholder="Пароль"
				className="w-full border rounded px-3 py-2 text-gray-500"
			/>

			{errors.form && (
				<p
					role="alert"
					className="text-sm text-red-600"
				>
					{errors.form.message}
				</p>
			)}

			<button
				disabled={isSubmitting}
				className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
			>
				{isSubmitting ? "Входим…" : "Войти"}
			</button>
		</form>
	);
}
