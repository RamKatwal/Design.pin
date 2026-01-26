import { Input } from "@/components/ui/input"
import { Command, Mic, Paperclip, Plus } from "lucide-react"

export function FloatingInput() {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
            <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg p-2 transition-all hover:shadow-xl hover:border-border/80 ring-1 ring-black/5 dark:ring-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted/50 cursor-pointer text-muted-foreground transition-colors">
                    <Plus className="w-5 h-5" />
                </div>

                <Input
                    placeholder="Ask anything, press @ for agents, / for commands..."
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
