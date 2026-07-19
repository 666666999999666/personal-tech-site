import { NextResponse } from "next/server";
import { searchPosts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ posts: [] });
  }

  try {
    const posts = await searchPosts(q);
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
