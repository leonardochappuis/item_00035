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
  createdAt: number // Timestamp for sorting
}

export interface Resource {
  id: string
  title: string
  url: string
  type: "article" | "video" | "book" | "other"
  createdAt?: number // Adding timestamp for sorting
}

export interface StudySession {
  id: string
  courseId: string
  date: Date
  duration: number
  notes: string
  createdAt?: number // Adding timestamp for sorting
}

