"use client"

import * as React from "react"
import type { Folder, Bookmark, FolderTreeNode } from "@/lib/types"
import { buildFolderTree, getBookmarksForNode, getBreadcrumbPath, getOwnerFolderIdFromAllNode } from "@/lib/folder-tree"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type BookmarkContextValue = {
  folders: Folder[]
  bookmarks: Bookmark[]
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  addFolder: (parentId: string | null, name: string) => Folder | null
  addBookmark: (folderId: string | null, url: string, title?: string) => Bookmark | null
  updateBookmark: (id: string, patch: { title?: string; folderId?: string | null }) => Promise<boolean>
  deleteBookmark: (id: string) => Promise<boolean>
  /** Folder id where a new bookmark should be added for the current selection (folder or "All" → owner folder). */
  getTargetFolderId: () => string | null
  tree: FolderTreeNode[]
  getBookmarksForSelected: () => Bookmark[]
  getBreadcrumb: () => string[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const BookmarkContext = React.createContext<BookmarkContextValue | null>(null)

type FolderRow = {
  id: string
  user_id?: string | null
  parent_id: string | null
  name: string | null
  sort_order?: number | null
  created_at: string
  updated_at?: string | null
}

type BookmarkRow = {
  id: string
  user_id?: string | null
  folder_id: string | null
  title: string | null
  url: string
  description?: string | null
  favicon_url?: string | null
  thumbnail_url?: string | null
  sort_order?: number | null
  created_at: string
  updated_at?: string | null
}

function mapFolderRow(row: FolderRow): Folder {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    parentId: row.parent_id ?? null,
    name: row.name ?? "",
    sortOrder: row.sort_order ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  }
}

function mapBookmarkRow(row: BookmarkRow): Bookmark {
  const url: string = row.url
  const title: string | null = row.title

  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`
  const displayTitle =
    (title ?? "").trim() ||
    (() => {
      try {
        const u = new URL(normalizedUrl)
        return u.hostname.replace(/^www\./, "")
      } catch {
        return url
      }
    })()

  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    folderId: row.folder_id ?? null,
    title: displayTitle,
    url: normalizedUrl,
    description: row.description ?? null,
    faviconUrl: row.favicon_url ?? null,
    thumbnailUrl: row.thumbnail_url ?? null,
    sortOrder: row.sort_order ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  }
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = React.useState<Folder[]>([])
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([])
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    const supabase = createSupabaseBrowserClient()
    setLoading(true)
    setError(null)
    try {
      const [
        { data: folderData, error: foldersError },
        { data: bookmarkData, error: bookmarksError },
      ] = await Promise.all([
        supabase
          .from("folders")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("bookmarks")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

      if (foldersError || bookmarksError) {
        const err = foldersError ?? bookmarksError
        console.error("Supabase fetch error:", err)
        setError(err?.message ?? "Failed to load data.")
        setFolders([])
        setBookmarks([])
        return
      }

      setFolders((folderData ?? []).map(mapFolderRow))
      setBookmarks((bookmarkData ?? []).map(mapBookmarkRow))
    } catch (err) {
      console.error("Unexpected Supabase error:", err)
      const message =
        err instanceof Error ? err.message : "Failed to load data."
      setError(message)
      setFolders([])
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  // Backfill metadata for bookmarks missing favicon/thumbnail (e.g. after reload before enrich completed)
  const backfillRequested = React.useRef<Set<string>>(new Set())
  React.useEffect(() => {
    for (const b of bookmarks) {
      if (!b.url || b.faviconUrl != null) continue
      if (backfillRequested.current.has(b.id)) continue
      backfillRequested.current.add(b.id)
      fetch("/api/bookmarks/enrich", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId: b.id, url: b.url }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((meta: { title?: string; description?: string; faviconUrl?: string; imageUrl?: string } | null) => {
          if (!meta) return
          setBookmarks((prev) =>
            prev.map((bookmark) =>
              bookmark.id === b.id
                ? {
                    ...bookmark,
                    title: meta.title ?? bookmark.title,
                    description: meta.description ?? bookmark.description,
                    faviconUrl: meta.faviconUrl ?? bookmark.faviconUrl,
                    thumbnailUrl: meta.imageUrl ?? bookmark.thumbnailUrl,
                  }
                : bookmark
            )
          )
        })
        .catch(() => {})
    }
  }, [bookmarks])

  const tree = React.useMemo(
    () => buildFolderTree(folders),
    [folders]
  )

  const addFolder = React.useCallback(
    (parentId: string | null, name: string): Folder | null => {
      // Only allow subfolders under main folders (no subfolder inside subfolder)
      if (parentId != null) {
        const parent = folders.find((f) => f.id === parentId)
        if (parent?.parentId != null) return null
      }
      const id = `temp-folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const createdAt = new Date().toISOString()
      const folder: Folder = { id, name, parentId, createdAt }
      setFolders((prev) => [...prev, folder])

      ;(async () => {
        try {
          const supabase = createSupabaseBrowserClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) {
            setError("You must be logged in to create folders.")
            setFolders((prev) => prev.filter((f) => f.id !== id))
            return
          }
          const { data, error: insertError } = await supabase
            .from("folders")
            .insert({ user_id: userId, name, parent_id: parentId })
            .select("*")
            .single()

          if (insertError) {
            console.error("Supabase insert folder error:", insertError)
            setError(insertError.message)
            setFolders((prev) => prev.filter((f) => f.id !== id))
            return
          }

          if (data) {
            const persisted = mapFolderRow(data as FolderRow)
            setFolders((prev) =>
              prev.map((f) => (f.id === id ? persisted : f))
            )
          }
        } catch (err) {
          console.error("Unexpected Supabase insert folder error:", err)
          const message =
            err instanceof Error ? err.message : "Failed to create folder."
          setError(message)
          setFolders((prev) => prev.filter((f) => f.id !== id))
        }
      })()

      return folder
    },
    [folders]
  )

  const getTargetFolderId = React.useCallback((): string | null => {
    if (!selectedNodeId) return null
    const ownerOfAll = getOwnerFolderIdFromAllNode(selectedNodeId)
    if (ownerOfAll !== null) return ownerOfAll
    const folder = folders.find((f) => f.id === selectedNodeId)
    return folder ? selectedNodeId : null
  }, [selectedNodeId, folders])

  const addBookmark = React.useCallback(
    (folderId: string | null, url: string, title?: string): Bookmark | null => {
      const id = `temp-bookmark-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`
      const createdAt = new Date().toISOString()
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`
      const displayTitle =
        title?.trim() ||
        (() => {
          try {
            const u = new URL(normalizedUrl)
            return u.hostname.replace(/^www\./, "")
          } catch {
            return url
          }
        })()

      const bookmark: Bookmark = {
        id,
        folderId,
        title: displayTitle,
        url: normalizedUrl,
        createdAt,
      }

      // Optimistic: show new bookmark at top of list
      setBookmarks((prev) => [bookmark, ...prev])

      ;(async () => {
        try {
          const supabase = createSupabaseBrowserClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) {
            setError("You must be logged in to add bookmarks.")
            setBookmarks((prev) => prev.filter((b) => b.id !== id))
            return
          }
          const { data, error: insertError } = await supabase
            .from("bookmarks")
            .insert({
              user_id: userId,
              url: normalizedUrl,
              title: displayTitle,
              folder_id: folderId,
            })
            .select("*")
            .single()

          if (insertError) {
            console.error("Supabase insert bookmark error:", insertError)
            setError(insertError.message)
            setBookmarks((prev) => prev.filter((b) => b.id !== id))
            return
          }

          if (data) {
            const persisted = mapBookmarkRow(data as BookmarkRow)
            setBookmarks((prev) =>
              prev.map((b) => (b.id === id ? persisted : b))
            )
            // Fire-and-forget: enrich metadata then patch local state and persist to DB
            fetch("/api/bookmarks/enrich", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookmarkId: persisted.id,
                url: normalizedUrl,
              }),
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((meta: { title?: string; description?: string; faviconUrl?: string; imageUrl?: string } | null) => {
                if (!meta) return
                setBookmarks((prev) =>
                  prev.map((b) =>
                    b.id === persisted.id
                      ? {
                          ...b,
                          title: meta.title ?? b.title,
                          description: meta.description ?? b.description,
                          faviconUrl: meta.faviconUrl ?? b.faviconUrl,
                          thumbnailUrl: meta.imageUrl ?? b.thumbnailUrl,
                        }
                      : b
                  )
                )
              })
              .catch(() => {})
          }
        } catch (err) {
          console.error("Unexpected Supabase insert bookmark error:", err)
          const message =
            err instanceof Error ? err.message : "Failed to create bookmark."
          setError(message)
          setBookmarks((prev) => prev.filter((b) => b.id !== id))
        }
      })()

      return bookmark
    },
    []
  )

  const updateBookmark = React.useCallback(
    async (id: string, patch: { title?: string; folderId?: string | null }): Promise<boolean> => {
      try {
        const supabase = createSupabaseBrowserClient()
        const updates: Record<string, unknown> = {}
        if (patch.title !== undefined) updates.title = patch.title
        if (patch.folderId !== undefined) updates.folder_id = patch.folderId
        if (Object.keys(updates).length === 0) return true
        const { error } = await supabase
          .from("bookmarks")
          .update(updates)
          .eq("id", id)
        if (error) {
          console.error("Supabase update bookmark error:", error)
          setError(error.message)
          return false
        }
        setBookmarks((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...(patch.title !== undefined && { title: patch.title }),
                  ...(patch.folderId !== undefined && { folderId: patch.folderId }),
                }
              : b
          )
        )
        return true
      } catch (err) {
        console.error("Unexpected update bookmark error:", err)
        setError(err instanceof Error ? err.message : "Failed to update bookmark.")
        return false
      }
    },
    []
  )

  const deleteBookmark = React.useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from("bookmarks").delete().eq("id", id)
      if (error) {
        console.error("Supabase delete bookmark error:", error)
        setError(error.message)
        return false
      }
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
      return true
    } catch (err) {
      console.error("Unexpected delete bookmark error:", err)
      setError(err instanceof Error ? err.message : "Failed to delete bookmark.")
      return false
    }
  }, [])

  const getBookmarksForSelected = React.useCallback(() => {
    // Inbox (no folder selected): show bookmarks with no folder.
    if (!selectedNodeId) {
      return bookmarks.filter((b) => b.folderId === null)
    }
    return getBookmarksForNode(selectedNodeId, folders, bookmarks)
  }, [selectedNodeId, folders, bookmarks])

  const getBreadcrumb = React.useCallback(() => {
    if (!selectedNodeId) return []
    return getBreadcrumbPath(selectedNodeId, folders, tree)
  }, [selectedNodeId, folders, tree])

  const value: BookmarkContextValue = {
    folders,
    bookmarks,
    selectedNodeId,
    setSelectedNodeId,
    addFolder,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    getTargetFolderId,
    tree,
    getBookmarksForSelected,
    getBreadcrumb,
    loading,
    error,
    refresh,
  }

  return (
    <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>
  )
}

export function useBookmarkContext() {
  const ctx = React.useContext(BookmarkContext)
  if (!ctx) throw new Error("useBookmarkContext must be used within BookmarkProvider")
  return ctx
}
