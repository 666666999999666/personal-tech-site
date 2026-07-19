import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { randomUUID } from "node:crypto";

// TODO: Add auth check (Task Group 5)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided. Use form field "file".' },
        { status: 400 }
      );
    }

    const ext = file.name.includes(".")
      ? file.name.split(".").pop()
      : undefined;

    const slug = formData.get("slug")?.toString() || "misc";
    const key = `blog/${slug}/${randomUUID()}${ext ? `.${ext}` : ""}`;

    const data = Buffer.from(await file.arrayBuffer());
    const result = await storage.upload(key, data, file.type);

    return NextResponse.json({ url: result.url, key: result.key });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
