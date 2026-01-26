import { FloatingInput } from "@/components/floating-input";
import { BookmarkList } from "@/components/bookmark-list";
import { bookmarks } from "@/lib/data";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50/50 dark:bg-black">
      {/* Top Header */}
      <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="opacity-50">/</span>
          <span>Products</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <ModeToggle />
          <div className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
            <span>ram</span>
            <ChevronsUpDown className="w-3 h-3" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 pb-32">
        <BookmarkList bookmarks={bookmarks} />
        <FloatingInput />
      </main>
    </div>
  );
}
