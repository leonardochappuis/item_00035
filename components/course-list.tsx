"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import type { Course } from "@/lib/types"

interface CourseListProps {
  courses: Course[]
  onUpdateProgress: (id: string, progress: number) => void
  onDeleteCourse: (id: string) => void
}

export function CourseList({ courses, onUpdateProgress, onDeleteCourse }: CourseListProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedCourse(expandedCourse === id ? null : id)
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <h3 className="text-lg font-medium">No courses added yet</h3>
        <p className="text-muted-foreground mt-2">Add your first course to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => {
        const isExpanded = expandedCourse === course.id

        return (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base md:text-lg">{course.title}</CardTitle>
                <Badge variant={getCategoryVariant(course.category)} className="text-xs whitespace-nowrap ml-2">
                  {course.category}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-xs md:text-sm">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>

                {isExpanded ? (
                  <Slider
                    defaultValue={[course.progress]}
                    value={[course.progress]}
                    max={100}
                    step={5}
                    onValueChange={(value) => onUpdateProgress(course.id, value[0])}
                    className="mt-2"
                  />
                ) : (
                  <Progress value={course.progress} className="h-2" />
                )}

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-1 text-xs md:text-sm">
                      <p className="font-medium">Platform: {course.platform}</p>
                      <p>Instructor: {course.instructor}</p>
                      <p>Due date: {course.dueDate}</p>
                    </div>

                    {course.url && (
                      <Button variant="outline" size="sm" className="w-full text-xs md:text-sm" asChild>
                        <a href={course.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                          Open Course
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(course.id)}
                className="text-xs md:text-sm flex items-center"
              >
                {isExpanded ? (
                  <>
                    Less <ChevronUp className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    More <ChevronDown className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

function getCategoryVariant(category: string) {
  switch (category.toLowerCase()) {
    case "programming":
      return "default"
    case "design":
      return "secondary"
    case "business":
      return "outline"
    case "marketing":
      return "destructive"
    case "data science":
      return "success"
    default:
      return "default"
  }
}

