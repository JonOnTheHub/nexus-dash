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

  const prompt = `You are an AI analyst for an e-commerce dashboard. Respond immediately with exactly 2 sentences. No thinking, no reasoning, no preamble. First sentence: the most important insight with specific numbers. Second sentence: one actionable recommendation with specific numbers. Plain text only.

Metrics:
- Revenue: $${metrics.revenue.toFixed(0)} (${metrics.revenueDelta > 0 ? "+" : ""}${metrics.revenueDelta}% vs previous 30 days)
- Orders: ${metrics.orders} (${metrics.ordersDelta > 0 ? "+" : ""}${metrics.ordersDelta}% vs previous 30 days)
- Customers: ${metrics.customers} total, ${metrics.newCustomers} new this month
- Low stock products: ${metrics.lowStock}
- Top products: ${topProducts.map((p) => `${p.name} ($${p.revenue.toFixed(0)} revenue, ${p.units} units)`).join(", ")}`;

  const completion = await groq.chat.completions.create({
  model: GROQ_MODEL,
  max_tokens: 1024,
  stream: false,
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
});

  const text = completion.choices[0]?.message?.content ?? "";
  
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}