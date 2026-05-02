import { getOrders } from "@/lib/data";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1");

    const data = await getOrders({ status, page });
    return Response.json(data);
}