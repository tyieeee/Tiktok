import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_root";
import { createContext } from "@/server/context";

const handler = async (req: Request) => {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext,
      onError({ error, path }) {
        console.error(`[tRPC] ${path ?? "?"}:`, error.message);
      },
    });
  } catch (err) {
    console.error("[tRPC route] Unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export { handler as GET, handler as POST };
