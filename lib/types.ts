/**
 * Persisted folder. "All" is NOT stored; it's a virtual node at render time.
 */
export type Folder = {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  color?: string
  /** Only for UI (e.g. virtual "All" nodes); not persisted. */
  isSystem?: boolean
}

/**
 * Bookmark belonging to a single folder by folderId.
 */
export type Bookmark = {
  id: string
  folderId: string
  title: string
  url: string
  createdAt: string
  icon?: string
}

/** Virtual "All" node id suffix; id format: `${folderId}__all` */
export const ALL_NODE_SUFFIX = "__all"

/** Tree node for sidebar: either a real folder or the virtual "All" child. */
export type FolderTreeNode = {
  id: string
  name: string
  parentId: string
  /** "folder" = real folder (may have children); "all" = virtual aggregation node */
  type: "folder" | "all"
  children: FolderTreeNode[]
  isSystem?: boolean
}
