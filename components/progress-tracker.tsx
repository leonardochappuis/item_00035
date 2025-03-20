"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Course } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProgressTrackerProps {
  courses: Course[]
}

export function ProgressTracker({ courses }: ProgressTrackerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <h3 className="text-lg font-medium">No courses to track</h3>
        <p className="text-muted-foreground mt-2">Add courses to see your progress</p>
      </div>
    )
  }

  // Calculate overall progress
  const totalProgress = courses.reduce((acc, course) => acc + course.progress, 0)
  const averageProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0

  // Prepare data for category distribution
  const categoryData = courses.reduce(
    (acc, course) => {
      const existingCategory = acc.find((item) => item.name === course.category)
      if (existingCategory) {
        existingCategory.value += 1
      } else {
        acc.push({ name: course.category, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  // Prepare data for completion status
  const completionData = [
    { name: "Completed", value: courses.filter((c) => c.progress === 100).length },
    { name: "In Progress", value: courses.filter((c) => c.progress > 0 && c.progress < 100).length },
    { name: "Not Started", value: courses.filter((c) => c.progress === 0).length },
  ]

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <h3 className="text-sm md:text-lg font-medium">Average Progress</h3>
              <div className="mt-1 md:mt-2 text-2xl md:text-4xl font-bold">{averageProgress}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <h3 className="text-sm md:text-lg font-medium">Total Courses</h3>
              <div className="mt-1 md:mt-2 text-2xl md:text-4xl font-bold">{courses.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <h3 className="text-sm md:text-lg font-medium">Completed</h3>
              <div className="mt-1 md:mt-2 text-2xl md:text-4xl font-bold">
                {courses.filter((c) => c.progress === 100).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardContent className="p-3 md:p-4">
            <h3 className="text-sm md:text-lg font-medium mb-2 md:mb-4 text-center">Categories</h3>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isDesktop ? 80 : 60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      isDesktop ? `${name} ${(percent * 100).toFixed(0)}%` : `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <h3 className="text-sm md:text-lg font-medium mb-2 md:mb-4 text-center">Completion Status</h3>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isDesktop ? 80 : 60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      isDesktop ? `${name} ${(percent * 100).toFixed(0)}%` : `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#6b7280" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

