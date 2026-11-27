"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
	const router = useRouter();

	async function logout() {
		await fetch("/bff/auth/logout", { method: "POST" });

		router.replace("/login");
		router.refresh();
	}

	return (
		<button
			onClick={logout}
			className="underline"
		>
			Выйти
		</button>
	);
}
