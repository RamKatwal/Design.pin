"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CreateFolderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = new root folder; string = new subfolder under this folder id */
  parentId: string | null
  onCreated: (name: string) => void
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  onCreated,
}: CreateFolderDialogProps) {
  const [name, setName] = React.useState("")

  const handleOpenChange = (next: boolean) => {
    if (!next) setName("")
    onOpenChange(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreated(trimmed)
    setName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {parentId == null ? "New folder" : "New subfolder"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
