export class HttpError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

// обёртка над fetch для запросов браузера к BFF
export async function http(url: string, init?: RequestInit) {
	const res = await fetch(url, init);
	const data = await res.json().catch(() => null);

	if (res.status === 401) window.location.assign("/login");

	if (!res.ok) {
		const message = Array.isArray(data?.message)
			? data.message[0]
			: data?.message;

		throw new HttpError(res.status, message ?? "Ошибка запроса");
	}

	return data;
}
