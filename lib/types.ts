export interface Course {
  id: string
  title: string
  description: string
  category: string
  platform: string
  instructor: string
  dueDate: string
  url: string
  progress: number
  resources: Resource[]
}

export interface Resource {
  id: string
  title: string
  url: string
  type: "article" | "video" | "book" | "other"
}

