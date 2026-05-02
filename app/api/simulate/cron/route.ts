import { runSimulatorTick } from "@/lib/simulator";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const result = await runSimulatorTick();
  return Response.json(result);
}