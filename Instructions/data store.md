You are working in a Next.js (App Router) project using TypeScript + shadcn/ui sidebar folder tree.
Auth is already done with Supabase. Supabase tables exist:
- folders(id uuid, user_id uuid, parent_id uuid null, name text, sort_order int, created_at, updated_at)
- bookmarks(id uuid, user_id uuid, folder_id uuid null, title text null, url text, description text null, favicon_url text null, thumbnail_url text null, sort_order int, created_at, updated_at)

Goal:
Replace dummy data (initialFolders, initialBookmarks) with real Supabase-backed data.
Implement client-side state + fetching + mutations for:
- List folders and bookmarks for logged-in user
- Create folder (under optional parent)
- Create bookmark in currently selected folder
- When a folder is selected, show bookmarks for:
  (a) that folder directly
  (b) ALL descendant subfolders (aggregate "All" behavior for that folder)
Also provide breadcrumb for selected folder.

Constraints:
- Do not create a real DB row for "All". It's purely computed.
- Use Supabase JS client in App Router properly.
- Use RLS already configured; do not use service role keys in client.
- Keep code clean, type-safe, and minimal.

Tasks (implement all):

1) Create /lib/supabase/client.ts
   - export function createSupabaseBrowserClient() that returns a singleton Supabase client
   - uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   - uses @supabase/supabase-js

2) Create types in /lib/types.ts:
   - Folder
   - Bookmark
   - FolderTreeNode (id, name, parentId, children[])
   Align with existing app usage.

3) Update /lib/folder-tree.ts (or create if missing):
   - buildFolderTree(folders: Folder[]): FolderTreeNode[]
   - getDescendantFolderIds(folders: Folder[], folderId: string): string[]
   - getBookmarksForNode(bookmarks: Bookmark[], folders: Folder[], folderId: string): Bookmark[]
     -> returns bookmarks in folderId + all descendants
   - getBreadcrumbPath(folders: Folder[], folderId: string): Folder[] (root -> selected)

4) Update BookmarkProvider (the context file you already have):
   - Remove dummy initialFolders/initialBookmarks usage
   - State: folders, bookmarks, selectedNodeId, loading, error
   - On mount, fetch folders + bookmarks in parallel from Supabase:
       folders: select * from folders order by sort_order asc, created_at asc
       bookmarks: select * from bookmarks order by created_at desc
   - Derive tree via buildFolderTree(folders)
   - Implement:
       addFolder(parentId, name) => insert into folders, update local state
       addBookmark(folderId, url, title?) => insert into bookmarks, update local state
       renameFolder(folderId, name) optional (nice to have)
       moveBookmark(bookmarkId, newFolderId) optional (nice to have)
   - Implement getBookmarksForSelected(): Bookmark[] using getBookmarksForNode()
   - Implement getBreadcrumb(): string[] using getBreadcrumbPath()
   - Provide a refresh() method to refetch everything.

5) Update UI usage:
   - Wherever bookmarks are listed, use getBookmarksForSelected()
   - Sidebar click should setSelectedNodeId(folderId)
   - Input at bottom: on submit, call addBookmark(selectedNodeId, url)
     If no folder selected, either:
       - store bookmark with folder_id = null (Inbox style), OR
       - auto-select a default root folder if exists
     Choose simplest: folder_id = null allowed; show those when no selection.

6) Error handling:
   - If Supabase returns error, set error state and console.error it
   - Show a small non-blocking error text in UI if error exists

Deliverables:
- Provide all code edits in place (create/modify files)
- Make sure TypeScript passes
- Do NOT break existing components; adapt to current folder tree + bookmark list.

After implementing, ensure:
- Creating a folder immediately appears in sidebar
- Selecting a folder shows bookmarks from all nested subfolders too
- Creating a bookmark appears instantly in list (optimistic local update)
