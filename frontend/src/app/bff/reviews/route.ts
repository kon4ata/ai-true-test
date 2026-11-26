import { backendFetch } from "@/lib/backend.ts";

export async function GET(request: Request) {
	const { search } = new URL(request.url);
	const res = await backendFetch(`/reviews${search}`);

	return Response.json(await res.json(), { status: res.status });
}
