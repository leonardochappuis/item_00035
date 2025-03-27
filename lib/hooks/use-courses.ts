"use client"

import { useState, useEffect } from "react"
import type { Course, Resource } from "@/lib/types"
import { toast } from "sonner"

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courses")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return []
        }
      }
    }
    return []
  })

  // Store deleted courses for undo functionality
  const [deletedCourses, setDeletedCourses] = useState<Course[]>([])

  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses))
  }, [courses])

  const addCourse = (courseData: Omit<Course, "id" | "progress" | "resources" | "createdAt">) => {
    const newCourse: Course = {
      ...courseData,
      id: crypto.randomUUID(),
      progress: 0,
      resources: [],
      createdAt: Date.now(),
    }

    setCourses((prev) => [...prev, newCourse])

    toast.success("Course Added", {
      description: `${courseData.title} has been added to your courses.`,
    })
  }

  const updateCourse = (id: string, courseData: Partial<Omit<Course, "id" | "resources" | "createdAt">>) => {
    setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, ...courseData } : course)))

    toast.success("Course updated successfully")
  }

  const updateCourseProgress = (id: string, progress: number) => {
    setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, progress } : course)))
  }

  const deleteCourse = (id: string) => {
    const courseToDelete = courses.find((course) => course.id === id)
    if (courseToDelete) {
      // Store the deleted course for potential undo
      setDeletedCourses((prev) => [...prev, courseToDelete])

      // Remove the course from the active courses
      setCourses((prev) => prev.filter((course) => course.id !== id))

      // We'll handle the toast in the parent component
    }
  }

  const undoDeleteCourse = (id: string) => {
    const courseToRestore = deletedCourses.find((course) => course.id === id)
    if (courseToRestore) {
      // Add the course back to the active courses
      setCourses((prev) => {
        // Sort by createdAt to maintain original order
        return [...prev, courseToRestore].sort((a, b) => a.createdAt - b.createdAt)
      })

      // Remove the course from deleted courses
      setDeletedCourses((prev) => prev.filter((course) => course.id !== id))

      toast.success("Course restored")
    }
  }

  const addResource = (courseId: string, resourceData: Omit<Resource, "id">) => {
    const newResource: Resource = {
      ...resourceData,
      id: crypto.randomUUID(),
    }

    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              resources: [...course.resources, newResource].sort((a, b) => {
                const aTime = a.createdAt || 0
                const bTime = b.createdAt || 0
                return aTime - bTime
              }),
            }
          : course,
      ),
    )

    toast.success("Resource added", {
      description: `${resourceData.title} has been added to your resources.`,
    })
  }

  const removeResource = (courseId: string, resourceId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              resources: course.resources.filter((r) => r.id !== resourceId),
            }
          : course,
      ),
    )

    toast.success("Resource removed")
  }

  return {
    courses,
    setCourses, // Expose setCourses for direct manipulation
    addCourse,
    updateCourse,
    updateCourseProgress,
    deleteCourse,
    undoDeleteCourse,
    addResource,
    removeResource,
  }
}

