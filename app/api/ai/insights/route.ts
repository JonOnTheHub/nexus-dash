import { groq, GROQ_MODEL } from "@/lib/groq";
import { getOverviewMetrics, getTopProducts } from "@/lib/data";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [metrics, topProducts] = await Promise.all([
    getOverviewMetrics(),
    getTopProducts(3),
  ]);

  const prompt = `You are an AI analyst for an e-commerce dashboard. Given these store metrics for the last 30 days, write exactly 2 concise sentences highlighting the most important insight and one actionable recommendation. Be specific with numbers. No preamble.

  Metrics:
  - Revenue: $${metrics.revenue.toFixed(0)} (${metrics.revenueDelta > 0 ? "+" : ""}${metrics.revenueDelta}% vs previous 30 days)
  - Orders: ${metrics.orders} (${metrics.ordersDelta > 0 ? "+" : ""}${metrics.ordersDelta}% vs previous 30 days)
  - Total customers: ${metrics.customers}, ${metrics.newCustomers} new this month
  - Low stock products: ${metrics.lowStock}
  - Top products: ${topProducts.map((p) => `${p.name} ($${p.revenue.toFixed(0)})`).join(", ")}`;

  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 120,
    stream: true,
    messages: [{ role: "user", content: prompt }],
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