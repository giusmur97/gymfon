import { NextResponse } from "next/server";

// Server-side only env vars
const ACCESS_TOKEN = process.env.IG_BASIC_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.IG_USER_ID || process.env.INSTAGRAM_USER_ID;
const IG_USERNAME = process.env.IG_USERNAME || "gi__erre__";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);

  // Prefer official API if configured
  if (ACCESS_TOKEN && USER_ID) {
    const url = new URL(`https://graph.instagram.com/${USER_ID}/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", ACCESS_TOKEN);

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 60 } });
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ items: [], error: text, configured: true }, { status: 502 });
      }
      const data = await res.json();
      const items = Array.isArray(data.data) ? data.data : [];
      return NextResponse.json({ items, configured: true, source: "graph" }, { status: 200 });
    } catch (err: unknown) {
      return NextResponse.json({ items: [], error: String(err), configured: true }, { status: 500 });
    }
  }

  // Zero-config fallback: best-effort scrape public profile HTML for image URLs
  try {
    const profileUrl = `https://www.instagram.com/${IG_USERNAME}/`;
    const proxyUrl = `https://r.jina.ai/http://${"www.instagram.com"}/${IG_USERNAME}/`;
    const res = await fetch(proxyUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GymFontyBot/1.0; +https://www.gymfonty.example)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json({ items: [], configured: false, error: `Fallback fetch failed: ${res.status}` }, { status: 200 });
    }
    const html = await res.text();

    // Extract image URLs from the HTML. This is heuristic and may change over time.
    const urlRegex = /https?:\/\/[^\s"']+\.(?:jpg|jpeg|webp)/gi;
    const urls = Array.from(new Set(Array.from(html.matchAll(urlRegex)).map((m) => m[0]))).slice(0, limit);

    const items = urls.map((u, i) => ({
      id: `scrape-${i}`,
      caption: undefined,
      media_type: "IMAGE",
      media_url: u,
      permalink: profileUrl,
      thumbnail_url: u,
      timestamp: undefined,
    }));

    return NextResponse.json({ items, configured: false, source: "scrape" }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ items: [], configured: false, error: String(err) }, { status: 200 });
  }
}
