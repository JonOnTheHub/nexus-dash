import { getProducts } from "@/lib/data";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const products = await getProducts();
    return Response.json(products);
}