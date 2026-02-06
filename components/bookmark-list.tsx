"use client"

import type { Bookmark } from "@/lib/types"
import { useBookmarkContext } from "@/lib/bookmark-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Globe,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronsRight,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"

function buildMoveTargets(folders: { id: string; name: string }[]): { id: string | null; name: string }[] {
  return [{ id: null, name: "Inbox" }, ...folders.map((f) => ({ id: f.id, name: f.name }))]
}

export function BookmarkList({ bookmarks }: { bookmarks: Bookmark[] }) {
  const {
    folders,
    updateBookmark,
    deleteBookmark,
    refresh,
  } = useBookmarkContext()

  const [renameBookmark, setRenameBookmark] = useState<Bookmark | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteBookmarkId, setDeleteBookmarkId] = useState<string | null>(null)

  const moveTargets = useMemo(() => buildMoveTargets(folders), [folders])

  const handleCardClick = useCallback((url: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-bookmark-menu]")) return
    window.open(url, "_blank", "noopener,noreferrer")
  }, [])

  const handleRenameSubmit = useCallback(async () => {
    if (!renameBookmark || !renameValue.trim()) {
      setRenameBookmark(null)
      return
    }
    const ok = await updateBookmark(renameBookmark.id, { title: renameValue.trim() })
    if (ok) setRenameBookmark(null)
  }, [renameBookmark, renameValue, updateBookmark])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteBookmarkId) return
    await deleteBookmark(deleteBookmarkId)
    setDeleteBookmarkId(null)
  }, [deleteBookmarkId, deleteBookmark])

  const openRenameDialog = useCallback((b: Bookmark) => {
    setRenameBookmark(b)
    setRenameValue(b.title.split("|")[0].trim())
  }, [])

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {bookmarks.map((bookmark) => {
          const iconSrc = bookmark.faviconUrl ?? bookmark.icon
          const showFavicon = iconSrc && !iconSrc.startsWith("/")
          const displayTitle = bookmark.title.split("|")[0].trim()
          return (
            <div
              key={bookmark.id}
              role="button"
              tabIndex={0}
              onClick={(e) => handleCardClick(bookmark.url, e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleCardClick(bookmark.url, e as unknown as React.MouseEvent)
                }
              }}
              className="group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-border/40 hover:border-border hover:shadow-sm transition-all cursor-pointer aspect-[1.4/0.8]"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
{showFavicon ? (
                                        <img
                                          src={iconSrc}
                                          alt=""
                                          className="w-6 h-6 object-contain"
                                          referrerPolicy="no-referrer"
                                        />
                                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      data-bookmark-menu
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all outline-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(bookmark.url)
                        }}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                        <DropdownMenuShortcut>⌘ C</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRenameDialog(bookmark)}>
                        <Pencil className="w-4 h-4" />
                        Rename
                        <DropdownMenuShortcut>⌘ E</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteBookmarkId(bookmark.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                        <DropdownMenuShortcut>⌘ ⌫</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => refresh()}>
                        <RefreshCw className="w-4 h-4" />
                        Refetch
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ChevronsRight className="w-4 h-4" />
                          Move To...
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {moveTargets.map((dest) => (
                            <DropdownMenuItem
                              key={dest.id ?? "inbox"}
                              onClick={() =>
                                updateBookmark(bookmark.id, { folderId: dest.id })
                              }
                            >
                              {dest.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    {bookmark.url}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rename dialog */}
      <Dialog open={!!renameBookmark} onOpenChange={(open) => !open && setRenameBookmark(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename bookmark</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Title"
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameBookmark(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteBookmarkId} onOpenChange={(open) => !open && setDeleteBookmarkId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete bookmark?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBookmarkId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
