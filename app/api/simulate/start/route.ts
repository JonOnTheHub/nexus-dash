import { runSimulatorTick } from "@/lib/simulator";
import { auth } from "@/lib/auth";

let interval: ReturnType<typeof setInterval> | null = null;

export async function POST() {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  if (interval) return Response.json({ status: "already running" });

  // Run first tick immediately
  runSimulatorTick().catch(console.error);

  // Then every 60 seconds
  interval = setInterval(() => {
    runSimulatorTick().catch(console.error);
  }, 60000);

  return Response.json({ status: "started" });
}

export async function DELETE() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  return Response.json({ status: "stopped" });
}