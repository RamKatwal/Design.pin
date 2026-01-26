import { ChevronRight, Folder, MoreHorizontal } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Placeholder type
type FolderItem = {
    id: string
    name: string
    subfolders?: FolderItem[]
}

export function FolderTree({ items }: { items: FolderItem[] }) {
    return (
        <SidebarMenu>
            {items.map((item) => (
                <FolderItem key={item.id} item={item} />
            ))}
        </SidebarMenu>
    )
}

function FolderItem({ item }: { item: FolderItem }) {
    if (!item.subfolders?.length) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.name}>
                    <Folder />
                    <span>{item.name}</span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                </SidebarMenuAction>
            </SidebarMenuItem>
        )
    }

    return (
        <Collapsible
            key={item.name}
            asChild
            defaultOpen={false}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.name}>
                        <Folder />
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.subfolders.map(sub => (
                            <SidebarMenuSubItem key={sub.id}>
                                <FolderItem item={sub} />
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}
