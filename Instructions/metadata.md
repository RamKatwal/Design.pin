Implement link metadata enrichment for bookmarks in my Next.js App Router + Supabase project.

Goal:
When a user submits a URL, create the bookmark immediately (optimistic), then call a server endpoint to fetch metadata (title, description, favicon, og:image) and update the bookmark row.

Requirements:
1) Add a server route handler:
   - File: app/api/bookmarks/preview/route.ts
   - Method: POST
   - Body: { url: string }
   - Validate URL: only http/https, reject localhost/private IP ranges, reject file:// etc.
   - Fetch HTML with a safe timeout (8s), limited size (~1MB), set a normal User-Agent.
   - Parse HTML using cheerio:
       - title: og:title > twitter:title > <title>
       - description: og:description > meta[name=description]
       - image: og:image (absolute URL)
       - favicon: best of:
           link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]
         Resolve relative URLs to absolute.
   - Return JSON: { title, description, faviconUrl, imageUrl, hostname }

2) Add a helper that updates bookmark metadata:
   - Create server action or API route:
     app/api/bookmarks/enrich/route.ts (POST)
     Body: { bookmarkId: string, url: string }
   - It should call preview route logic (or shared function) and then update Supabase:
       update bookmarks set title=?, description=?, favicon_url=?, thumbnail_url=? where id=? and user_id=auth user
   - Use Supabase server client (NOT service role) tied to the current user session/cookies.

3) Update BookmarkProvider (client):
   - On addBookmark(folderId, url):
       a) insert row into Supabase with url + folder_id
       b) update local state immediately with the inserted row
       c) fire-and-forget fetch("/api/bookmarks/enrich") with bookmarkId + url
       d) on enrich success, patch local state with returned metadata

4) Add dependencies:
   - cheerio

5) Edge cases:
   - If metadata fetch fails, keep bookmark as-is (just URL).
   - Ensure favicon/image URLs are absolute.
   - Avoid SSRF: block private networks and localhost.
