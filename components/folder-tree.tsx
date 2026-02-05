"use client"

import { ChevronDown, Folder, Layers, Plus } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { FolderTreeNode } from "@/lib/types"
import { cn } from "@/lib/utils"

type FolderTreeProps = {
  items: FolderTreeNode[]
  selectedNodeId: string | null
  onSelect: (nodeId: string) => void
  onNewSubfolder: (parentFolderId: string) => void
}

export function FolderTree({
  items,
  selectedNodeId,
  onSelect,
  onNewSubfolder,
}: FolderTreeProps) {
  return (
    <SidebarMenu>
      {items.map((node) => (
        <FolderNode
          key={node.id}
          node={node}
          selectedNodeId={selectedNodeId}
          onSelect={onSelect}
          onNewSubfolder={onNewSubfolder}
          isRoot
        />
      ))}
    </SidebarMenu>
  )
}

function FolderNode({
  node,
  selectedNodeId,
  onSelect,
  onNewSubfolder,
  isRoot,
}: {
  node: FolderTreeNode
  selectedNodeId: string | null
  onSelect: (nodeId: string) => void
  onNewSubfolder: (parentFolderId: string) => void
  isRoot: boolean
}) {
  const isSelected = selectedNodeId === node.id

  // Virtual "All" node
  if (node.type === "all") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={node.name}
          onClick={() => onSelect(node.id)}
          isActive={isSelected}
          className={cn(
            "text-muted-foreground text-xs font-normal",
            isSelected && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Layers className="size-4 shrink-0" />
          <span>{node.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // Subfolder (leaf): single row, no expand, no "Add subfolder"
  if (!isRoot) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={node.name}
          onClick={() => onSelect(node.id)}
          isActive={isSelected}
        >
          <Folder className="size-4 shrink-0" />
          <span>{node.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // Main folder: expandable, with "Add subfolder" inside (no three-dot menu)
  const hasChildren = node.children.length > 0

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={node.name}
          onClick={() => onSelect(node.id)}
          isActive={isSelected}
        >
          <Folder className="size-4 shrink-0" />
          <span>{node.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible defaultOpen={false} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={node.name}
            onClick={() => onSelect(node.id)}
            isActive={isSelected}
            className="data-[state=open]:bg-sidebar-accent/50"
          >
            <Folder className="size-4 shrink-0" />
            <span>{node.name}</span>
            <ChevronDown className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-l-0 gap-0.5 py-1">
            {node.children.map((child) => (
              <SidebarMenuSubItem key={child.id} className="pl-6">
                <FolderNode
                  node={child}
                  selectedNodeId={selectedNodeId}
                  onSelect={onSelect}
                  onNewSubfolder={onNewSubfolder}
                  isRoot={false}
                />
              </SidebarMenuSubItem>
            ))}
            <SidebarMenuSubItem className="pl-6">
              <button
                type="button"
                onClick={() => onNewSubfolder(node.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Plus className="size-3.5 shrink-0" />
                <span>Add subfolder</span>
              </button>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
