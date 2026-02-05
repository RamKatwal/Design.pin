import type { Folder, Bookmark } from "@/lib/types"

/** Seed folders: Design (Inspiration, Resources), Development (Frontend). */
export const initialFolders: Folder[] = [
  { id: "design", name: "Design", parentId: null, createdAt: "2025-01-01T00:00:00Z" },
  { id: "design-inspiration", name: "Inspiration", parentId: "design", createdAt: "2025-01-01T00:00:00Z" },
  { id: "design-resources", name: "Resources", parentId: "design", createdAt: "2025-01-01T00:00:00Z" },
  { id: "development", name: "Development", parentId: null, createdAt: "2025-01-01T00:00:00Z" },
  { id: "development-frontend", name: "Frontend", parentId: "development", createdAt: "2025-01-01T00:00:00Z" },
]

/** Seed bookmarks in Inspiration and Resources so Design > All shows both. */
export const initialBookmarks: Bookmark[] = [
  { id: "b1", folderId: "design-inspiration", title: "Dribbble – Discover the World’s Top Designers", url: "dribbble.com", createdAt: "2025-01-10T00:00:00Z" },
  { id: "b2", folderId: "design-inspiration", title: "Behance", url: "behance.net", createdAt: "2025-01-11T00:00:00Z" },
  { id: "b3", folderId: "design-resources", title: "Figma", url: "figma.com", createdAt: "2025-01-12T00:00:00Z" },
  { id: "b4", folderId: "design-resources", title: "Coolors – Color Palettes", url: "coolors.co", createdAt: "2025-01-13T00:00:00Z" },
  { id: "b5", folderId: "development-frontend", title: "React", url: "react.dev", createdAt: "2025-01-14T00:00:00Z" },
]
