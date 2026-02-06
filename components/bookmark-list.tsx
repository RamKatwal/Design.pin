import type { Bookmark } from "@/lib/types"
import { Globe, MoreHorizontal } from "lucide-react"

export function BookmarkList({ bookmarks }: { bookmarks: Bookmark[] }) {
    return (
        <div className="w-full mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
                {bookmarks.map((bookmark) => (
                    <div
                        key={bookmark.id}
                        className="group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-border/40 hover:border-border hover:shadow-sm transition-all cursor-pointer aspect-[1.4/0.8]"
                    >
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                    {bookmark.icon && !bookmark.icon.startsWith('/') ? (
                                        <img src={bookmark.icon} alt="" className="w-6 h-6 object-contain" />
                                    ) : (
                                        <Globe className="w-5 h-5" />
                                    )}
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground">
                                    {bookmark.title.split('|')[0].trim()}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate font-medium">
                                    {bookmark.url}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
