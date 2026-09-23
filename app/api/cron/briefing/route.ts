import { revalidatePath } from "next/cache";
import { getNewsData } from "@/lib/live/news";

// Called every morning by the Vercel cron job in vercel.json (around 7am Eastern).
// Writes today's news briefing and refreshes the homepage so it shows up.
// Safe to call more than once: each morning's briefing is cached after the first success.
export const maxDuration = 60;

export async function GET(request: Request) {
  // Vercel sends this header when a CRON_SECRET environment variable is set.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const news = await getNewsData();
  revalidatePath("/");

  return Response.json({
    ok: !!news?.briefing,
    articles: news?.total ?? 0,
    briefingWrittenAt: news?.briefing?.generatedAt ?? null,
  });
}
