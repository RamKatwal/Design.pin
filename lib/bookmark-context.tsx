"use client"

import * as React from "react"
import type { Folder, Bookmark, FolderTreeNode } from "@/lib/types"
import { buildFolderTree, getBookmarksForNode, getBreadcrumbPath, getOwnerFolderIdFromAllNode } from "@/lib/folder-tree"
import { initialFolders, initialBookmarks } from "@/lib/data"

type BookmarkContextValue = {
  folders: Folder[]
  bookmarks: Bookmark[]
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  addFolder: (parentId: string | null, name: string) => Folder | null
  addBookmark: (folderId: string, url: string, title?: string) => Bookmark | null
  /** Folder id where a new bookmark should be added for the current selection (folder or "All" → owner folder). */
  getTargetFolderId: () => string | null
  tree: FolderTreeNode[]
  getBookmarksForSelected: () => Bookmark[]
  getBreadcrumb: () => string[]
}

const BookmarkContext = React.createContext<BookmarkContextValue | null>(null)

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = React.useState<Folder[]>(initialFolders)
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>(initialBookmarks)
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)

  const tree = React.useMemo(
    () => buildFolderTree(folders, bookmarks),
    [folders, bookmarks]
  )

  const addFolder = React.useCallback(
    (parentId: string | null, name: string): Folder | null => {
      // Only allow subfolders under main folders (no subfolder inside subfolder)
      if (parentId != null) {
        const parent = folders.find((f) => f.id === parentId)
        if (parent?.parentId != null) return null
      }
      const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const createdAt = new Date().toISOString()
      const folder: Folder = { id, name, parentId, createdAt }
      setFolders((prev) => [...prev, folder])
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
    (folderId: string, url: string, title?: string): Bookmark | null => {
      const folder = folders.find((f) => f.id === folderId)
      if (!folder) return null
      const id = `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const createdAt = new Date().toISOString()
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`
      const displayTitle = title?.trim() || (() => {
        try {
          const u = new URL(normalizedUrl)
          return u.hostname.replace(/^www\./, "")
        } catch {
          return url
        }
      })()
      const bookmark: Bookmark = { id, folderId, title: displayTitle, url: normalizedUrl, createdAt }
      setBookmarks((prev) => [...prev, bookmark])
      return bookmark
    },
    [folders]
  )

  const getBookmarksForSelected = React.useCallback(() => {
    if (!selectedNodeId) return []
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
    getTargetFolderId,
    tree,
    getBookmarksForSelected,
    getBreadcrumb,
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
