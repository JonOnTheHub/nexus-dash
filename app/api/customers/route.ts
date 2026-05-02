import { getCustomers } from "@/lib/data";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const customers = await getCustomers();
    return Response.json(customers);
}