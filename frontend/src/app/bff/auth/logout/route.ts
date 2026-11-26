import { COOKIE } from "@/lib/backend.ts";
import { cookies } from "next/headers";

export async function POST() {
	(await cookies()).delete(COOKIE);

	return new Response(null, { status: 204 });
}
