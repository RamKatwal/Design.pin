export type Bookmark = {
    id: string
    title: string
    url: string
    icon?: string
    createdAt: string
    folderId: string
}

export type Folder = {
    id: string
    name: string
    color?: string
    count?: number
    subfolders?: Folder[]
    isActive?: boolean
}

export const folders: Folder[] = [
    { id: "1", name: "Bookmarks", color: "bg-green-500", count: 2 },
    { id: "2", name: "Projects by Designers", color: "bg-blue-500", count: 4 },
    { id: "3", name: "Read Later", color: "bg-orange-400", count: 5 },
    { id: "4", name: "Products", color: "bg-blue-600", count: 0, isActive: true },
    { id: "5", name: "design.shots (VIDEO)", color: "bg-yellow-500", count: 2 },
    { id: "6", name: "Sites", color: "bg-red-500", count: 1 },
    { id: "7", name: "code", color: "bg-red-600", count: 3 },
    { id: "8", name: "Portfolio Section Ideas", color: "bg-purple-500", count: 1 },
    { id: "9", name: "Stroybook", color: "bg-green-600", count: 2 },
]

export const bookmarks: Bookmark[] = [
    {
        id: "1",
        title: "Convex | The backend platform that keeps your app in sync",
        url: "convex.dev",
        createdAt: "Jan 20",
        folderId: "4",
        icon: "/icons/convex.png" // We will use a generic icon for now if image not found
    },
    {
        id: "2",
        title: "useHooks – The React Hooks Library",
        url: "usehooks.com",
        createdAt: "Jan 20",
        folderId: "4"
    },
    {
        id: "3",
        title: "JavaScript Playground - Free Online JS Editor | PlayCode",
        url: "playcode.io",
        createdAt: "Jan 20",
        folderId: "4"
    },
    {
        id: "4",
        title: "TheBoringNotch",
        url: "theboring.name",
        createdAt: "Jan 13",
        folderId: "4"
    },
    {
        id: "5",
        title: "lo-cafe | NotchNook",
        url: "lo.cafe",
        createdAt: "Jan 13",
        folderId: "4"
    },
    {
        id: "6",
        title: "minimalist",
        url: "getminimalist.com",
        createdAt: "Jan 13",
        folderId: "4"
    },
    {
        id: "7",
        title: "Second Brain: Crafted, Curated, Connected, Compounded",
        url: "ssp.sh",
        createdAt: "Jan 12",
        folderId: "4"
    },
    {
        id: "8",
        title: "Obsidian - Sharpen your thinking",
        url: "obsidian.md",
        createdAt: "Jan 12",
        folderId: "4"
    },
    {
        id: "9",
        title: "Life Calendar - Visualize your Life in weeks",
        url: "thelifecalendar.com",
        createdAt: "Jan 11",
        folderId: "4"
    }
]
