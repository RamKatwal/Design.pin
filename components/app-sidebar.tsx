import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { FolderTree } from "./folder-tree"
import { Home } from "lucide-react"

const folderData = [
    {
        id: "1",
        name: "Design",
        subfolders: [
            { id: "1-1", name: "Inspiration", subfolders: [] },
            { id: "1-2", name: "Resources", subfolders: [] }
        ]
    },
    {
        id: "2",
        name: "Development",
        subfolders: [
            { id: "2-1", name: "Frontend", subfolders: [{ id: "2-1-1", name: "React", subfolders: [] }] }
        ]
    },
    {
        id: "3",
        name: "Marketing",
        subfolders: []
    }
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Home className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Bookmarks</span>
                                    <span className="">v1.0.0</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Folders</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <FolderTree items={folderData} />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
