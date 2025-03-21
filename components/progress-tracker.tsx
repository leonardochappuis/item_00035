"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Course } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState } from "react"

interface ProgressTrackerProps {
  courses: Course[]
}

// Custom active shape for better label display
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#888" fontSize={12}>
        {payload.name}
      </text>
      <text x={cx} y={cy} textAnchor="middle" fill="#333" fontSize={14} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#888" fontSize={12}>
        {`(${value})`}
      </text>
    </g>
  )
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-2 text-xs">
        <p className="font-medium">{payload[0].name}</p>
        <p>{`Count: ${payload[0].value}`}</p>
        <p>{`Percentage: ${(payload[0].payload.percent * 100).toFixed(0)}%`}</p>
      </div>
    )
  }
  return null
}

export function ProgressTracker({ courses }: ProgressTrackerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [activeCategory, setActiveCategory] = useState<number | undefined>(undefined)
  const [activeCompletion, setActiveCompletion] = useState<number | undefined>(undefined)

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
        existingCategory.percent = existingCategory.value / courses.length
      } else {
        acc.push({
          name: course.category,
          value: 1,
          percent: 1 / courses.length,
        })
      }
      return acc
    },
    [] as { name: string; value: number; percent: number }[],
  )

  // Prepare data for completion status
  const completedCount = courses.filter((c) => c.progress === 100).length
  const inProgressCount = courses.filter((c) => c.progress > 0 && c.progress < 100).length
  const notStartedCount = courses.filter((c) => c.progress === 0).length

  const completionData = [
    { name: "Completed", value: completedCount, percent: completedCount / courses.length },
    { name: "In Progress", value: inProgressCount, percent: inProgressCount / courses.length },
    { name: "Not Started", value: notStartedCount, percent: notStartedCount / courses.length },
  ]

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
  const COMPLETION_COLORS = ["#10b981", "#f59e0b", "#6b7280"]

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
              <div className="mt-1 md:mt-2 text-2xl md:text-4xl font-bold">{completedCount}</div>
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
                    activeIndex={activeCategory}
                    activeShape={renderActiveShape}
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isDesktop ? 60 : 40}
                    outerRadius={isDesktop ? 80 : 60}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveCategory(index)}
                    onMouseLeave={() => setActiveCategory(undefined)}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
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
                    activeIndex={activeCompletion}
                    activeShape={renderActiveShape}
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isDesktop ? 60 : 40}
                    outerRadius={isDesktop ? 80 : 60}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveCompletion(index)}
                    onMouseLeave={() => setActiveCompletion(undefined)}
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COMPLETION_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

