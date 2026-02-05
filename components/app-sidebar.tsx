"use client"

import * as React from "react"
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
import { CreateFolderDialog } from "./create-folder-dialog"
import { Home, Plus } from "lucide-react"
import { useBookmarkContext } from "@/lib/bookmark-context"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const {
    tree,
    selectedNodeId,
    setSelectedNodeId,
    addFolder,
  } = useBookmarkContext()

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [createDialogParentId, setCreateDialogParentId] = React.useState<
    string | null
  >(null)

  const openNewFolder = () => {
    setCreateDialogParentId(null)
    setCreateDialogOpen(true)
  }

  const openNewSubfolder = (parentFolderId: string) => {
    setCreateDialogParentId(parentFolderId)
    setCreateDialogOpen(true)
  }

  const handleCreated = (name: string) => {
    addFolder(createDialogParentId, name)
  }

  return (
    <>
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
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel>Folders</SidebarGroupLabel>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={openNewFolder}
                title="New folder"
              >
                <Plus className="size-4" />
                <span className="sr-only">New folder</span>
              </Button>
            </div>
            <SidebarGroupContent>
              <FolderTree
                items={tree}
                selectedNodeId={selectedNodeId}
                onSelect={setSelectedNodeId}
                onNewSubfolder={openNewSubfolder}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CreateFolderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={createDialogParentId}
        onCreated={handleCreated}
      />
    </>
  )
}
