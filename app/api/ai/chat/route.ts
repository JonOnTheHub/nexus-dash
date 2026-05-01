import { groq, GROQ_MODEL } from "@/lib/groq";
import { getOverviewMetrics, getTopProducts, getOrderStatusBreakdown } from "@/lib/data";
import { auth } from "@/lib/auth";
import type { AIMessage } from "@/types";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { messages } = await req.json() as { messages: AIMessage[] };

    const [metrics, topProducts, statusBreakdown] = await Promise.all([
        getOverviewMetrics(),
        getTopProducts(5),
        getOrderStatusBreakdown(),
    ]);

    const lowStockProducts = await prisma.product.findMany({
        where: { stock: { lte: 10 }, isActive: true },
        select: { name: true, stock: true },
    });

    const systemPrompt = `You are Nexus AI, an intelligent assistant embedded in an e-commerce operations dashboard. You have access to real store data and help the user understand their business performance, identify trends, and make decisions.

    Current store snapshot:
    - Revenue (last 30d): $${metrics.revenue.toFixed(0)} (${metrics.revenueDelta > 0 ? "+" : ""}${metrics.revenueDelta}% vs previous period)
    - Orders (last 30d): ${metrics.orders} (${metrics.ordersDelta > 0 ? "+" : ""}${metrics.ordersDelta}% vs previous period)
    - Total customers: ${metrics.customers} (${metrics.newCustomers} acquired in last 30 days)
    - Low stock products (≤10 units): ${lowStockProducts.map(p => `${p.name} (${p.stock} units)`).join(", ") || "none"}
    - Top products: ${topProducts.map(p => `${p.name} (price: $${p.price}, revenue: $${p.revenue.toFixed(0)}, ${p.units} units sold)`).join(", ")}
    - Order status breakdown: ${statusBreakdown.map((s) => `${s.status}: ${s.count}`).join(", ")}

    Be concise, data-driven, and direct. Use specific numbers. Do not use markdown formatting. Plain text only.`;

    const stream = await groq.chat.completions.create({
        model: GROQ_MODEL,
        max_tokens: 400,
        stream: true,
        messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
        ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const text = chunk.choices[0]?.delta?.content ?? "";
                if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
        },
    });

    return new Response(readable, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}