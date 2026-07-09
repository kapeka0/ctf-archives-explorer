import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.CAT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const res = await fetch("https://api.thecatapi.com/v1/images/search?limit=1&size=small", {
    headers: { "x-api-key": apiKey },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ url: data[0]?.url ?? null });
}
