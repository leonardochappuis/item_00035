"use client"

import { useState, useEffect } from "react"
import type { Course, Resource } from "@/lib/types"

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

  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses))
  }, [courses])

  const addCourse = (courseData: Omit<Course, "id" | "progress" | "resources">) => {
    const newCourse: Course = {
      ...courseData,
      id: crypto.randomUUID(),
      progress: 0,
      resources: [],
    }

    setCourses((prev) => [...prev, newCourse])
  }

  const updateCourseProgress = (id: string, progress: number) => {
    setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, progress } : course)))
  }

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== id))
  }

  const addResource = (courseId: string, resourceData: Omit<Resource, "id">) => {
    const newResource: Resource = {
      ...resourceData,
      id: crypto.randomUUID(),
    }

    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, resources: [...course.resources, newResource] } : course,
      ),
    )
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
  }

  return {
    courses,
    addCourse,
    updateCourseProgress,
    deleteCourse,
    addResource,
    removeResource,
  }
}

