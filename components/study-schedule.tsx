"use client"

import { useState } from "react"
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
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
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
    const newSession: StudySession = {
      id: crypto.randomUUID(),
      courseId: values.courseId,
      date: selectedDate,
      duration: Number.parseInt(values.duration),
      notes: values.notes || "",
    }

    setSessions([...sessions, newSession])
    form.reset()
    setOpen(false)
  }

  const sessionsForSelectedDate = sessions.filter((session) => isSameDay(session.date, selectedDate))

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const onDateClick = (day: Date) => {
    setSelectedDate(day)
  }

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          <span className="sr-only">Previous month</span>
        </Button>

        <h3 className="text-base md:text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h3>

        <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
    )
  }

  const renderDays = () => {
    const days = []
    const dateFormat = "EEEEE"
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    return (
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {dayNames.map((day, i) => (
          <div key={i} className="text-xs md:text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d")
        const cloneDay = day
        const hasSession = sessions.some((session) => isSameDay(session.date, day))

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "h-10 md:h-12 flex items-center justify-center relative border rounded-md cursor-pointer transition-colors",
              !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/30",
              isSameDay(day, selectedDate) && "bg-primary text-primary-foreground",
              isSameDay(day, new Date()) && !isSameDay(day, selectedDate) && "border-primary",
              hasSession && !isSameDay(day, selectedDate) && "border-green-500",
            )}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className="text-xs md:text-sm">{formattedDate}</span>
            {hasSession && (
              <div
                className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  isSameDay(day, selectedDate) ? "bg-primary-foreground" : "bg-green-500",
                )}
              />
            )}
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>,
      )
      days = []
    }
    return <div className="space-y-1">{rows}</div>
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardContent className="p-0">
          {renderHeader()}
          <div className="p-4">
            {renderDays()}
            {renderCells()}
          </div>
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
          <h3 className="font-medium mb-2 text-sm md:text-base">{format(selectedDate, "MMMM d, yyyy")}</h3>

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

