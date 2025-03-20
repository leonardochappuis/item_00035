"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Course, Resource } from "@/lib/types"
import { ExternalLink, FileText, Video, Book, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resourceSchema, type ResourceFormValues } from "@/lib/validations"
import * as z from "zod"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Card, CardContent } from "@/components/ui/card"

interface ResourceManagerProps {
  courses: Course[]
  onAddResource: (courseId: string, resource: Omit<Resource, "id">) => void
  onRemoveResource: (courseId: string, resourceId: string) => void
}

// Create a schema for the course selection
const courseSelectSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
})

type CourseSelectFormValues = z.infer<typeof courseSelectSchema>

export function ResourceManager({ courses, onAddResource, onRemoveResource }: ResourceManagerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Form for course selection
  const courseSelectForm = useForm<CourseSelectFormValues>({
    resolver: zodResolver(courseSelectSchema),
    defaultValues: {
      courseId: "",
    },
  })

  // Form for resource addition
  const resourceForm = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "article",
    },
  })

  const handleCourseSelect = (values: CourseSelectFormValues) => {
    setSelectedCourseId(values.courseId)
  }

  const handleAddResource = (values: ResourceFormValues) => {
    if (!selectedCourseId) return

    onAddResource(selectedCourseId, values)
    resourceForm.reset()
  }

  const selectedCourse = courses.find((course) => course.id === selectedCourseId)

  return (
    <div className="space-y-4 md:space-y-6">
      <Form {...courseSelectForm}>
        <form onChange={courseSelectForm.handleSubmit(handleCourseSelect)} className="grid gap-4 md:grid-cols-2">
          <FormField
            control={courseSelectForm.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Course</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedCourseId(value)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger id="course-select">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {selectedCourseId && (
        <div className="space-y-4">
          <Form {...resourceForm}>
            <form onSubmit={resourceForm.handleSubmit(handleAddResource)} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={resourceForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Official Documentation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resourceForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/docs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resourceForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Add Resource</Button>
            </form>
          </Form>

          {selectedCourse?.resources && selectedCourse.resources.length > 0 ? (
            isDesktop ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCourse.resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        {resource.type === "article" && <FileText className="h-4 w-4" />}
                        {resource.type === "video" && <Video className="h-4 w-4" />}
                        {resource.type === "book" && <Book className="h-4 w-4" />}
                        {resource.type === "other" && <ExternalLink className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[200px]">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center"
                        >
                          {resource.url}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveResource(selectedCourseId, resource.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="space-y-3">
                {selectedCourse.resources.map((resource) => (
                  <Card key={resource.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {resource.type === "article" && <FileText className="h-3 w-3" />}
                            {resource.type === "video" && <Video className="h-3 w-3" />}
                            {resource.type === "book" && <Book className="h-3 w-3" />}
                            {resource.type === "other" && <ExternalLink className="h-3 w-3" />}
                            <span className="font-medium text-sm">{resource.title}</span>
                          </div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center text-xs font-mono text-muted-foreground"
                          >
                            {resource.url.length > 30 ? `${resource.url.substring(0, 30)}...` : resource.url}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemoveResource(selectedCourseId, resource.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">No resources added for this course yet</p>
          )}
        </div>
      )}
    </div>
  )
}

