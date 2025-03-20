"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Course } from "@/lib/types"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMediaQuery } from "@/hooks/use-media-query"

interface StudySession {
  id: string
  courseId: string
  date: Date
  duration: number
  notes: string
}

interface StudyScheduleProps {
  courses: Course[]
}

const studySessionSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
})

type StudySessionFormValues = z.infer<typeof studySessionSchema>

export function StudySchedule({ courses }: StudyScheduleProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const form = useForm<StudySessionFormValues>({
    resolver: zodResolver(studySessionSchema),
    defaultValues: {
      courseId: "",
      duration: "60",
      notes: "",
    },
  })

  const handleAddSession = (values: StudySessionFormValues) => {
    if (!date) return

    const newSession: StudySession = {
      id: crypto.randomUUID(),
      courseId: values.courseId,
      date: date,
      duration: Number.parseInt(values.duration),
      notes: values.notes || "",
    }

    setSessions([...sessions, newSession])
    form.reset()
    setOpen(false)
  }

  const sessionsForSelectedDate = sessions.filter(
    (session) => date && format(session.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
  )

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardContent className="p-2 md:p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(date) => date < new Date("1900-01-01")}
            classNames={{
              day_today: "bg-primary text-primary-foreground",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_range_middle: "bg-accent text-accent-foreground",
              day_hidden: "invisible",
              caption: "text-sm md:text-base",
              caption_label: "text-sm md:text-base",
              nav_button: "h-6 w-6 md:h-7 md:w-7",
              table: "w-full border-collapse",
              head_cell: "text-xs md:text-sm font-normal text-muted-foreground",
              cell: "text-center text-xs md:text-sm p-0 relative",
              day: "h-7 w-7 md:h-9 md:w-9 p-0 font-normal",
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Add Study Session</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Study Session</DialogTitle>
              <DialogDescription>Plan a new study session for your courses</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddSession)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="15" step="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="What to focus on..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Add Session</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="rounded-md border p-3 md:p-4">
          <h3 className="font-medium mb-2 text-sm md:text-base">
            {date ? format(date, "MMMM d, yyyy") : "Select a date"}
          </h3>

          {sessionsForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {sessionsForSelectedDate.map((session) => {
                const course = courses.find((c) => c.id === session.courseId)
                return (
                  <div key={session.id} className="flex justify-between items-center p-2 rounded-md border">
                    <div>
                      <p className="font-medium text-xs md:text-sm">{course?.title}</p>
                      <p className="text-xs text-muted-foreground">{session.duration} minutes</p>
                      {session.notes && <p className="text-xs mt-1">{session.notes}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">No study sessions planned for this day</p>
          )}
        </div>
      </div>
    </div>
  )
}

