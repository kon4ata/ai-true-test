import { backendFetch } from "@/shared/backend";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

export default async function UserBadge() {
	const res = await backendFetch("/auth/me");

	if (!res.ok) redirect("/login");

	const user = await res.json();

	return (
		<div className="flex items-center gap-4 text-sm">
			<span>
				{user.email} ·{" "}
				{user.role === "admin" ? "администратор" : "клиент"}
			</span>
			<LogoutButton />
		</div>
	);
}
