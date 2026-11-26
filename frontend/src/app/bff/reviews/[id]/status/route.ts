import { backendFetch } from "@/lib/backend.ts";

export async function PATCH(
	request: Request,
	{ params }: {
		params: Promise<{
			id: string,
		}>
	},
) {
	const { id } = await params;
	const res = await backendFetch(`/reviews/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify(await request.json()),
	});

	return Response.json(await res.json(), { status: res.status });
}
