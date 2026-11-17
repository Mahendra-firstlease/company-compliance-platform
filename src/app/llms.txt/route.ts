import { generateLlmsText } from "@/lib/llms";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await generateLlmsText();
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
