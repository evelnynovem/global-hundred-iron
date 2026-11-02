import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; G100TCBot/1.0)",
      },
      next: { revalidate: 3600 },
    });
    const html = await res.text();

    // 抓取 og:image 或 twitter:image
    const ogImageMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i) ||
      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);

    const ogTitleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i);

    let posterUrl = ogImageMatch ? ogImageMatch[1] : "";
    if (posterUrl && posterUrl.startsWith("/")) {
      const u = new URL(targetUrl);
      posterUrl = u.origin + posterUrl;
    }

    return NextResponse.json({
      posterUrl: posterUrl || "",
      pageTitle: ogTitleMatch ? ogTitleMatch[1].trim() : "",
    });
  } catch (err: any) {
    return NextResponse.json({ posterUrl: "", error: err.message });
  }
}
