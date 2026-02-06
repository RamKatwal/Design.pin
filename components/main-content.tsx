"use client"

import { BookmarkList } from "@/components/bookmark-list"
import { useBookmarkContext } from "@/lib/bookmark-context"
import { HeaderAuth } from "@/components/header-auth"
import { ChevronsUpDown, PlusCircle } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { FloatingInput } from "@/components/floating-input"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function MainContent() {
  const {
    getBookmarksForSelected,
    getBreadcrumb,
  } = useBookmarkContext()

  const bookmarks = getBookmarksForSelected()
  const breadcrumb = getBreadcrumb()

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50/50 dark:bg-black">
      <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm border-b border-border/40">
      <div className='flex gap-2'>
      <SidebarTrigger />
      <div className="flex items-center gap-2 text-sm font-medium">
          <span className="opacity-50">/</span>
          {breadcrumb.length > 0 ? (
            breadcrumb.map((part, i) => (
              <span key={i}>
                {i > 0 && <span className="opacity-50 mx-1">/</span>}
                {part}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">Select a folder</span>
          )}
        </div>
      </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <ModeToggle />
          <div className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
          </div>
          <HeaderAuth />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 pb-32">
        <BookmarkList bookmarks={bookmarks} />
        <FloatingInput />
      </main>
    </div>
  )
}
