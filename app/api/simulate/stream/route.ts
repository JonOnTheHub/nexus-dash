export const dynamic = "force-dynamic";

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection event
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
            );

            const interval = setInterval(() => {
                try {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "tick", timestamp: Date.now() })}\n\n`
                        )
                    );
                } catch {
                    clearInterval(interval);
                }
            }, 60000);

            // Cleanup on disconnect
            return () => clearInterval(interval);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}