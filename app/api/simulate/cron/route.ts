import { runSimulatorTick } from "@/lib/simulator";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runSimulatorTick();
  return Response.json(result);
}