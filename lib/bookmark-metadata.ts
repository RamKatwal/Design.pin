import * as cheerio from "cheerio"

const FETCH_TIMEOUT_MS = 8000
const FETCH_MAX_BYTES = 1024 * 1024 // ~1MB
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; rv:131.0) Gecko/20100101 Firefox/131.0"

export type MetadataResult = {
  title?: string
  description?: string
  faviconUrl?: string
  imageUrl?: string
  hostname?: string
}

/**
 * SSRF-safe URL validation: only http/https, reject localhost and private IP ranges.
 */
export function isUrlAllowedForFetch(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    const protocol = url.protocol.toLowerCase()
    if (protocol !== "http:" && protocol !== "https:") return false

    const hostname = url.hostname.toLowerCase()
    if (hostname === "localhost" || hostname.endsWith(".localhost")) return false

    // IPv6 loopback
    if (hostname === "[::1]" || hostname === "::1") return false

    // IPv4: parse and check ranges
    const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    if (ipv4Match) {
      const [, a, b, c] = ipv4Match.map(Number)
      if (a === 127) return false // 127.0.0.0/8
      if (a === 10) return false // 10.0.0.0/8
      if (a === 172 && b >= 16 && b <= 31) return false // 172.16.0.0/12
      if (a === 192 && b === 168) return false // 192.168.0.0/16
      if (a === 169 && b === 254) return false // 169.254.0.0/16 link-local
      if (a === 0 && b === 0 && c === 0) return false // 0.0.0.0
    }

    // IPv6 private / link-local (simplified: fc00::/7, fe80::/10)
    if (hostname.startsWith("[") && hostname.endsWith("]")) {
      const inner = hostname.slice(1, -1).toLowerCase()
      if (inner.startsWith("fc") || inner.startsWith("fd") || inner.startsWith("fe80")) return false
    }

    return true
  } catch {
    return false
  }
}

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).href
  } catch {
    return href
  }
}

/**
 * Fetch HTML with timeout and size limit, then parse metadata with cheerio.
 * All returned URLs are absolute. Throws on validation failure or fetch/parse errors.
 */
export async function fetchMetadata(urlString: string): Promise<MetadataResult> {
  if (!isUrlAllowedForFetch(urlString)) {
    throw new Error("URL not allowed for fetch")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(urlString, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const body = res.body
    if (!body) throw new Error("No response body")

    const reader = body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    const decoder = new TextDecoder("utf-8", { fatal: false })

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
      if (total > FETCH_MAX_BYTES) throw new Error("Response too large")
      chunks.push(value)
    }

    clearTimeout(timeoutId)
    const combined =
      chunks.length === 1
        ? chunks[0]
        : (() => {
            const out = new Uint8Array(total)
            let offset = 0
            for (const c of chunks) {
              out.set(c, offset)
              offset += c.length
            }
            return out
          })()
    const fullHtml = decoder.decode(combined)

    const baseOrigin = new URL(urlString).origin

    const $ = cheerio.load(fullHtml)

    const title =
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $('meta[name="twitter:title"]').attr("content")?.trim() ||
      $("title").first().text().trim() ||
      undefined

    const description =
      $('meta[property="og:description"]').attr("content")?.trim() ||
      $('meta[name="description"]').attr("content")?.trim() ||
      undefined

    let imageUrl: string | undefined
    const ogImage = $('meta[property="og:image"]').attr("content")?.trim()
    if (ogImage) imageUrl = resolveUrl(baseOrigin, ogImage)

    let faviconUrl: string | undefined
    const iconLink =
      $('link[rel~="icon"]').first().attr("href") ||
      $('link[rel="apple-touch-icon"]').first().attr("href") ||
      $('link[rel="shortcut icon"]').first().attr("href")
    if (iconLink) faviconUrl = resolveUrl(baseOrigin, iconLink)

    let hostname: string | undefined
    try {
      hostname = new URL(urlString).hostname.replace(/^www\./, "")
    } catch {
      hostname = undefined
    }

    return {
      title: title || undefined,
      description: description || undefined,
      faviconUrl,
      imageUrl,
      hostname,
    }
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}
