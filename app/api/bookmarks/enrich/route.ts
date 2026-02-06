import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  isUrlAllowedForFetch,
  fetchMetadata,
  type MetadataResult,
} from "@/lib/bookmark-metadata"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const bookmarkId =
      typeof body?.bookmarkId === "string" ? body.bookmarkId.trim() : null
    const url =
      typeof body?.url === "string" ? body.url.trim() : null

    if (!bookmarkId || !url) {
      return NextResponse.json(
        { error: "Missing bookmarkId or url" },
        { status: 400 }
      )
    }

    if (!isUrlAllowedForFetch(url)) {
      return NextResponse.json(
        { error: "URL not allowed (only http/https, no localhost or private IPs)" },
        { status: 400 }
      )
    }

    let metadata: MetadataResult
    try {
      metadata = await fetchMetadata(url)
    } catch {
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

    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from("bookmarks")
      .update({
        title: metadata.title ?? null,
        description: metadata.description ?? null,
        favicon_url: metadata.faviconUrl ?? null,
        thumbnail_url: metadata.imageUrl ?? null,
      })
      .eq("id", bookmarkId)

    if (updateError) {
      console.error("Bookmark enrich update error:", updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(metadata)
  } catch (err) {
    console.error("Bookmark enrich error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
