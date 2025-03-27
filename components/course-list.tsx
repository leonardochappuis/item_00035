"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, PlusCircle, Calendar, User, BookOpen, MoreHorizontal, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditCourseForm } from "@/components/edit-course-form"
import type { Course } from "@/lib/types"

interface CourseListProps {
  courses: Course[]
  onUpdateProgress: (id: string, progress: number) => void
  onDeleteCourse: (id: string) => void
  onUndoDeleteCourse: (id: string) => void
  onAddCourse: () => void
}

export function CourseList({
  courses,
  onUpdateProgress,
  onDeleteCourse,
  onUndoDeleteCourse,
  onAddCourse,
}: CourseListProps) {
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)

  const handleDeleteClick = (id: string) => {
    setCourseToDelete(id)
  }

  const confirmDelete = () => {
    if (courseToDelete) {
      onDeleteCourse(courseToDelete)
      setCourseToDelete(null)
    }
  }

  const cancelDelete = () => {
    setCourseToDelete(null)
  }

  const handleEditClick = (course: Course) => {
    setCourseToEdit(course)
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 md:py-12 flex flex-col items-center">
        <h3 className="text-lg font-medium">No courses added yet</h3>
        <p className="text-muted-foreground mt-2 mb-6">Add your first course to get started</p>
        <Button onClick={onAddCourse}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md hover:border-primary/50"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base md:text-lg line-clamp-2">{course.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getCategoryVariant(course.category)} className="text-xs whitespace-nowrap shrink-0">
                    {course.category}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(course)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(course.id)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription className="line-clamp-2 text-xs md:text-sm mt-1">{course.description}</CardDescription>
            </CardHeader>

            <CardContent className="pb-3 flex-grow">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1.5">
                    <span className="font-medium">Progress</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Slider
                    defaultValue={[course.progress]}
                    value={[course.progress]}
                    max={100}
                    step={5}
                    onValueChange={(value) => onUpdateProgress(course.id, value[0])}
                    className="mt-2 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{course.platform}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{course.instructor}</span>
                  </div>

                  {course.dueDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Due: {course.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              {course.url && (
                <Button variant="outline" size="sm" className="text-xs md:text-sm w-full" asChild>
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    Open Course
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog - Using regular Dialog instead of AlertDialog */}
      <Dialog open={courseToDelete !== null} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-[425px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This will delete the course and all associated resources.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={courseToEdit !== null} onOpenChange={(open) => !open && setCourseToEdit(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px] max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the details of your course</DialogDescription>
          </DialogHeader>
          {courseToEdit && (
            <EditCourseForm
              course={courseToEdit}
              onUpdateCourse={(updatedCourse) => {
                setCourseToEdit(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
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

