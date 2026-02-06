import type { Folder, Bookmark, FolderTreeNode } from "@/lib/types"
import { ALL_NODE_SUFFIX } from "@/lib/types"

/**
 * Returns all descendant folder ids under folderId (recursive, any depth).
 * Does not include folderId itself.
 */
export function getDescendantFolderIds(
  folderId: string,
  folders: Folder[]
): string[] {
  const direct = folders.filter((f) => f.parentId === folderId)
  const ids: string[] = []
  for (const f of direct) {
    ids.push(f.id)
    ids.push(...getDescendantFolderIds(f.id, folders))
  }
  return ids
}

/**
 * Folder id that owns an "All" node. All node ids are `${folderId}__all`.
 */
export function getOwnerFolderIdFromAllNode(nodeId: string): string | null {
  if (!nodeId.endsWith(ALL_NODE_SUFFIX)) return null
  return nodeId.slice(0, -ALL_NODE_SUFFIX.length)
}

/**
 * Bookmarks to show for a tree node:
 * - If nodeId is an "All" node: bookmarks from that folder + all descendants (recursive).
 * - Otherwise: bookmarks for that exact folderId only.
 */
export function getBookmarksForNode(
  nodeId: string,
  folders: Folder[],
  bookmarks: Bookmark[]
): Bookmark[] {
  const ownerId = getOwnerFolderIdFromAllNode(nodeId)
  if (ownerId !== null) {
    const descendantIds = new Set([
      ownerId,
      ...getDescendantFolderIds(ownerId, folders),
    ])
    return bookmarks.filter((b) => b.folderId != null && descendantIds.has(b.folderId))
  }
  return bookmarks.filter((b) => b.folderId === nodeId)
}

/**
 * Builds two-level tree for sidebar: main folders (roots) and subfolders only.
 * No subfolder-inside-subfolder. Each folder gets a virtual "All" child first,
 * then (for roots only) direct subfolders.
 */
export function buildFolderTree(folders: Folder[]): FolderTreeNode[] {
  const byParent = new Map<string | null, Folder[]>()
  for (const f of folders) {
    const key = f.parentId
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(f)
  }

  function nodeForFolder(f: Folder): FolderTreeNode {
    // Only root folders (parentId === null) have real subfolders; subfolders are leaves
    const isRoot = f.parentId === null
    const realChildren = isRoot ? (byParent.get(f.id) ?? []).slice() : []
    realChildren.sort((a, b) => a.name.localeCompare(b.name))

    const virtualAll: FolderTreeNode = {
      id: `${f.id}${ALL_NODE_SUFFIX}`,
      name: "All",
      parentId: f.id,
      type: "all",
      children: [],
      isSystem: true,
    }

    const children: FolderTreeNode[] = [
      virtualAll,
      ...realChildren.map((sub) => nodeForFolder(sub)),
    ]

    return {
      id: f.id,
      name: f.name,
      parentId: f.parentId ?? "",
      type: "folder",
      children,
    }
  }

  const roots = (byParent.get(null) ?? []).slice()
  roots.sort((a, b) => a.name.localeCompare(b.name))
  return roots.map((f) => nodeForFolder(f))
}

/**
 * Get the folder path (names) for a node for breadcrumb.
 * If nodeId is an "All" node, the path is [..., folderName, "All"].
 */
export function getBreadcrumbPath(
  nodeId: string,
  folders: Folder[],
  tree: FolderTreeNode[]
): string[] {
  const folderMap = new Map(folders.map((f) => [f.id, f]))
  const ownerId = getOwnerFolderIdFromAllNode(nodeId)

  if (ownerId !== null) {
    const folder = folderMap.get(ownerId)
    const path = getFolderPathToRoot(ownerId, folders)
    return folder ? [...path.map((id) => folderMap.get(id)!.name), "All"] : ["All"]
  }

  const path = getFolderPathToRoot(nodeId, folders)
  return path.map((id) => folderMap.get(id)!.name).filter(Boolean)
}

function getFolderPathToRoot(
  folderId: string,
  folders: Folder[]
): string[] {
  const folder = folders.find((f) => f.id === folderId)
  if (!folder) return []
  const parentPath =
    folder.parentId == null ? [] : getFolderPathToRoot(folder.parentId, folders)
  return [...parentPath, folder.id]
}
