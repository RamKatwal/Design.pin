import { Input } from "@/components/ui/input"
import { Command, CornerDownLeft } from "lucide-react"

export function BookmarkInput() {
    return (
        <div className="relative w-full max-w-3xl mb-8">
            <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-lg pb-1">+</span>
                <Input
                    placeholder="Insert a link, color, or just plain text..."
                    className="pl-8 pr-12 h-12 rounded-xl bg-background border-border/60 shadow-sm focus-visible:ring-1 focus-visible:ring-sidebar-ring transition-all"
                />
                <div className="absolute right-3 flex items-center gap-1.5 text-muted-foreground/50">
                    <div className="flex items-center justify-center p-1 rounded bg-muted/50 border border-border/50">
                        <Command className="w-3 h-3" />
                    </div>
                    <div className="flex items-center justify-center p-1 rounded bg-muted/50 border border-border/50">
                        <span className="text-[10px] font-bold">F</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
