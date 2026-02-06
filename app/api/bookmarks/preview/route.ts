import { NextResponse } from "next/server"
import {
  isUrlAllowedForFetch,
  fetchMetadata,
  type MetadataResult,
} from "@/lib/bookmark-metadata"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url =
      typeof body?.url === "string" ? body.url.trim() : null
    if (!url) {
      return NextResponse.json(
        { error: "Missing or invalid url" },
        { status: 400 }
      )
    }

    if (!isUrlAllowedForFetch(url)) {
      return NextResponse.json(
        { error: "URL not allowed (only http/https, no localhost or private IPs)" },
        { status: 400 }
      )
    }

    const metadata: MetadataResult = await fetchMetadata(url)
    return NextResponse.json(metadata)
  } catch (err) {
    console.error("Bookmark preview error:", err)
    return NextResponse.json(
      {
        title: undefined,
        description: undefined,
        faviconUrl: undefined,
        imageUrl: undefined,
        hostname: undefined,
      } satisfies MetadataResult,
      { status: 200 }
    )
  }
}
