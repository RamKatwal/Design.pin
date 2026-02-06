/**
 * Persisted folder row (Supabase-backed).
 * "All" is NOT stored; it's a virtual node at render time.
 */
export type Folder = {
  /** Supabase `id` (uuid). */
  id: string
  /** Supabase `user_id` (uuid) – RLS-scoped, optional in UI. */
  userId?: string
  /** Supabase `parent_id` (uuid | null). */
  parentId: string | null
  /** Supabase `name` (text). */
  name: string
  /** Supabase `sort_order` (int). */
  sortOrder?: number
  /** Supabase `created_at` (timestamp). */
  createdAt: string
  /** Supabase `updated_at` (timestamp). */
  updatedAt?: string
  /** UI-only color metadata; not persisted. */
  color?: string
  /** Only for UI (e.g. virtual \"All\" nodes); not persisted. */
  isSystem?: boolean
}

/**
 * Persisted bookmark row (Supabase-backed).
 * Belongs to a single folder by folderId, or inbox when folderId is null.
 */
export type Bookmark = {
  /** Supabase `id` (uuid). */
  id: string
  /** Supabase `user_id` (uuid) – RLS-scoped, optional in UI. */
  userId?: string
  /** Supabase `folder_id` (uuid | null). */
  folderId: string | null
  /** Supabase `title` (text | null); coerced to non-empty string in UI. */
  title: string
  /** Supabase `url` (text). */
  url: string
  /** Supabase `description` (text | null). */
  description?: string | null
  /** Supabase `favicon_url` (text | null). */
  faviconUrl?: string | null
  /** Supabase `thumbnail_url` (text | null). */
  thumbnailUrl?: string | null
  /** Supabase `sort_order` (int). */
  sortOrder?: number
  /** Supabase `created_at` (timestamp). */
  createdAt: string
  /** Supabase `updated_at` (timestamp). */
  updatedAt?: string
  /** UI-only icon override; not persisted. */
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
