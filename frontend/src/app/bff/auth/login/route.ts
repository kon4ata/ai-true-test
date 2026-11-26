import { backendFetch, COOKIE } from "@/lib/backend.ts";
import { cookies } from "next/headers";

export async function POST(request: Request) {
	const res = await backendFetch("/auth/login", {
		method: "POST",
		body: JSON.stringify(await request.json()),
	});
	const data = await res.json();

	if (!res.ok) return Response.json(data, { status: res.status });

	(await cookies()).set(COOKIE, data.accessToken, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.COOKIE_SECURE === "true",
		path: "/",
		maxAge: Number(process.env.SESSION_MAX_AGE ?? 28800),
	});

	// токен браузеру не отдаём
	return Response.json({ user: data.user });
}
