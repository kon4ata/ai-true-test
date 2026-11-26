import { backendFetch } from "@/lib/backend.ts";

export async function GET() {
	const res = await backendFetch("/branches");

	return Response.json(await res.json(), { status: res.status });
}
