"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Mic, Paperclip, Plus } from "lucide-react"
import { useBookmarkContext } from "@/lib/bookmark-context"

export function FloatingInput() {
  const { addBookmark, getTargetFolderId } = useBookmarkContext()
  const [value, setValue] = React.useState("")
  const [hint, setHint] = React.useState<"none" | "saved" | "select_folder">("none")

  const targetFolderId = getTargetFolderId()

  const handleSubmit = React.useCallback(() => {
    const url = value.trim()
    if (!url) return
    if (!targetFolderId) {
      setHint("select_folder")
      setTimeout(() => setHint("none"), 2500)
      return
    }
    addBookmark(targetFolderId, url)
    setValue("")
    setHint("saved")
    setTimeout(() => setHint("none"), 2000)
  }, [value, targetFolderId, addBookmark])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  const placeholder =
    targetFolderId
      ? "Insert a link to add to this folder..."
      : "Select a folder in the sidebar, then paste a link..."

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      {hint === "select_folder" && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-2">
          Select a folder in the sidebar first.
        </p>
      )}
      {hint === "saved" && (
        <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 mb-2">
          Bookmark added.
        </p>
      )}
      <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg p-2 transition-all hover:shadow-xl hover:border-border/80 ring-1 ring-black/5 dark:ring-white/10">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted/50 cursor-pointer text-muted-foreground transition-colors"
          title="Add bookmark"
          aria-label="Add bookmark"
        >
          <Plus className="w-5 h-5" />
        </button>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 px-3 text-base placeholder:text-muted-foreground/50"
        />

        <div className="flex items-center gap-1 pr-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted/50 cursor-pointer text-muted-foreground transition-colors" title="Attach">
            <Paperclip className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted/50 cursor-pointer text-muted-foreground transition-colors" title="Voice">
            <Mic className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
