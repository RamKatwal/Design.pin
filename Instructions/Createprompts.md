Goal:
Implement folder creation + automatic “All” subfolder behavior where:
- Every folder (at any nesting level) automatically has a virtual/system child called "All"
- "All" displays the union of bookmarks from ALL descendant subfolders under that folder (recursive)
- This rule applies recursively: if a user creates a subfolder under a subfolder, that subfolder also gets its own "All" (virtual) with the same aggregation logic

Current state:
- Sidebar left panel shows dummy folder tree data only
- Main content shows bookmark cards for the selected item (can be dummy)
- There is no real persistence required right now; in-memory state is fine

Implement:
1) Data model
- Create types in a shared file (e.g. `src/lib/types.ts`):
  - Folder: { id, name, parentId: string | null, createdAt, ... }
  - Bookmark: { id, folderId, title, url, createdAt }
- Add a boolean `isSystem?: boolean` only for UI rendering if needed.
- DO NOT store "All" as a real folder in the data store.
  - It should be generated at render time as a virtual node: id = `${folderId}__all`

2) Folder tree builder (core logic)
- Build a helper `buildFolderTree(folders, bookmarks)` returning a hierarchical structure for the sidebar:
  - Each real folder node should include:
    - children: [virtualAllNode, ...realSubfolders]
  - The virtualAllNode should include:
    - id: `${folderId}__all`
    - name: "All"
    - parentId: folderId
    - type: "all"
- Also create helpers:
  - `getDescendantFolderIds(folderId, folders): string[]` (recursive)
  - `getBookmarksForNode(nodeId, folders, bookmarks)`:
     - if nodeId endsWith "__all": return bookmarks whose folderId is in ALL descendants of the owning folder (excluding system nodes)
     - else: return bookmarks for that exact folderId

Important:
- Descendants include nested subfolders at any depth.
- For a folder with no subfolders, "All" should just show that folder’s own bookmarks (or empty if none).
- "All" should include bookmarks from the folder itself + all children. (Yes, include the folder’s own bookmarks too.)

3) Sidebar UI integration
- Update existing FolderTree recursive component to render:
  - Folder row
  - Expand/collapse
  - Its children, with "All" always first
- For "All" items, use a subtle icon (e.g. List / Layers) and maybe a slightly different style:
  - Smaller text, muted foreground, or italic
- Ensure clicking a node updates selectedNodeId in state.

4) “Create Folder” + “Create Subfolder” actions (in-memory)
- Add a “New Folder” button at the top of sidebar (or inside the Folders section).
- Add a “New Subfolder” action for each folder (via the existing `MoreHorizontal` menu).
- Use a simple modal/dialog (shadcn Dialog) to input folder name.
- When created:
  - Add to `folders` state
  - parentId should be null for root folder creation; or current folder id for subfolder
  - The “All” should appear automatically via virtual generation (no extra insert)

5) Dummy data updates
- Seed with a few folders and bookmarks so we can visually confirm aggregation:
  - e.g. Design > Inspiration, Resources
  - Development > Frontend
  - Add bookmarks inside Inspiration + Resources and ensure Design__all shows both

6) Main content panel
- When a node is selected, render bookmarks returned by `getBookmarksForNode`
- Update the breadcrumb to show:
  - Folder path + (if All selected) append “All”
- No need to implement bookmark creation yet.

Acceptance criteria:
- Every folder shows a virtual "All" child
- Clicking “All” for a folder shows bookmarks from that folder + all nested subfolders
- Works at any depth (subfolder under subfolder)
- Creating a folder or subfolder immediately shows the correct “All” node and correct aggregation
- No “All” nodes are persisted; only generated in UI/tree building

Deliverables:
- New/updated types file
- New folder-tree builder + aggregation helpers
- Updated FolderTree component to render virtual “All” nodes first
- Added Dialog-based create folder/subfolder UI
- Updated main content to display aggregated bookmarks based on selected node

Keep changes clean and minimal, with good naming and comments for the tricky recursive parts.
