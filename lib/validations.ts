import * as z from "zod"

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  platform: z.string().min(1, "Platform is required"),
  instructor: z.string().min(1, "Instructor is required"),
  url: z.string().url("Must be a valid URL").or(z.string().length(0)),
})

export type CourseFormValues = z.infer<typeof courseSchema>

export const extendedCourseSchema = courseSchema.extend({
  dueDate: z.date().optional(),
})

export type ExtendedCourseFormValues = z.infer<typeof extendedCourseSchema>

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["article", "video", "book", "other"]),
})

export type ResourceFormValues = z.infer<typeof resourceSchema>

export const studySessionSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
})

export type StudySessionFormValues = z.infer<typeof studySessionSchema>

export const courseSelectSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
})

export type CourseSelectFormValues = z.infer<typeof courseSelectSchema>

