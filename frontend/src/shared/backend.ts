import { cookies } from "next/headers";

export const COOKIE = "jwt";

// fetch к серверу с токеном из cookie. Без токена бэкенд сам ответит 401
export async function backendFetch(path: string, init: RequestInit = {}) {
	const token = (await cookies()).get(COOKIE)?.value;

	return fetch(`${process.env.BACKEND_URL}/api/v1${path}`, {
		...init,
		headers: {
			"content-type": "application/json",
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
		cache: "no-store",
	});
}
