import { Suspense } from "react";
import UserBadge from "./user-badge";

export default function AppLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<header className="flex items-center justify-between px-6 py-3 border-b">
				<span className="font-semibold">Аналитика</span>

				<nav className="flex gap-4 text-sm">
					<a href="/dashboard" className="underline">Дашборд</a>
					<a href="/reviews" className="underline">Отзывы</a>
				</nav>

				<Suspense
					fallback={<div className="h-5 w-48 bg-muted rounded animate-pulse" />}
				>
					<UserBadge />
				</Suspense>
			</header>
			<main className="p-6">{children}</main>
		</>
	);
}
