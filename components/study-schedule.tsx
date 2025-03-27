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
import type { Course, StudySession } from "@/lib/types"
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
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface StudyScheduleProps {
  courses: Course[]
}

// Update the schema to include date validation
const studySessionSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
})

type StudySessionFormValues = z.infer<typeof studySessionSchema>

export function StudySchedule({ courses }: StudyScheduleProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to beginning of day
    return today
  })
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [deletedSessions, setDeletedSessions] = useState<StudySession[]>([])
  const isMobile = useIsMobile()

  const form = useForm<StudySessionFormValues>({
    resolver: zodResolver(studySessionSchema),
    defaultValues: {
      courseId: "",
      duration: "60",
      notes: "",
    },
  })

  const handleAddSession = (values: StudySessionFormValues) => {
    if (isEditing && currentSession) {
      // Update existing session
      const updatedSessions = sessions.map((session) =>
        session.id === currentSession.id
          ? {
              ...session,
              courseId: values.courseId,
              duration: Number.parseInt(values.duration),
              notes: values.notes || "",
            }
          : session,
      )

      setSessions(updatedSessions)
      toast.success("Session updated", {
        description: "Your study session has been updated",
      })
    } else {
      // Add new session
      const newSession: StudySession = {
        id: crypto.randomUUID(),
        courseId: values.courseId,
        date: selectedDate,
        duration: Number.parseInt(values.duration),
        notes: values.notes || "",
        createdAt: Date.now(), // Add timestamp for sorting
      }

      setSessions([...sessions, newSession])
      toast.success("Session added", {
        description: "Your study session has been scheduled",
      })
    }

    form.reset()
    setOpen(false)
    setIsEditing(false)
    setCurrentSession(null)
  }

  const handleEditSession = (session: StudySession) => {
    setCurrentSession(session)
    setIsEditing(true)

    form.reset({
      courseId: session.courseId,
      duration: session.duration.toString(),
      notes: session.notes,
    })

    setOpen(true)
  }

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId)
  }

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      const sessionToRemove = sessions.find((s) => s.id === sessionToDelete)
      if (sessionToRemove) {
        // Create a deep copy of the session to store
        const sessionCopy = {
          ...sessionToRemove,
          date: new Date(sessionToRemove.date.getTime()), // Create a new Date object
          createdAt: sessionToRemove.createdAt || Date.now(), // Ensure createdAt exists
        }

        // Remove the session from active sessions
        setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete))

        // Show toast with direct undo action
        toast("Session deleted", {
          description: "The study session has been removed",
          action: {
            label: "Undo",
            onClick: () => {
              // Add the session back and sort by createdAt to maintain original order
              setSessions((prev) => {
                const newSessions = [...prev, sessionCopy]
                return newSessions.sort((a, b) => {
                  const aTime = a.createdAt || 0
                  const bTime = b.createdAt || 0
                  return aTime - bTime
                })
              })
              toast.success("Session restored")
            },
          },
        })
      }
      setSessionToDelete(null)
    }
  }

  // Remove or comment out the undoDeleteSession function since we're using the direct approach
  // const undoDeleteSession = (sessionId: string) => { ... }

  const handleDialogOpen = () => {
    if (!isEditing) {
      form.reset({
        courseId: "",
        duration: "60",
        notes: "",
      })
    }
    setOpen(true)
  }

  const handleDialogClose = () => {
    setOpen(false)
    setIsEditing(false)
    setCurrentSession(null)
  }

  const sessionsForSelectedDate = sessions.filter((session) => isSameDay(session.date, selectedDate))

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const onDateClick = (day: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to beginning of day for proper comparison

    // Only allow selecting current or future dates
    if (day >= today) {
      setSelectedDate(day)
    } else {
      toast.error("Cannot schedule sessions for past dates")
    }
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
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to beginning of day for proper comparison

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d")
        const cloneDay = day
        const hasSession = sessions.some((session) => isSameDay(session.date, day))
        const isPastDate = day < today

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "h-10 md:h-12 flex items-center justify-center relative border rounded-md transition-colors",
              !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/30",
              isSameDay(day, selectedDate) && "bg-primary text-primary-foreground",
              isSameDay(day, new Date()) && !isSameDay(day, selectedDate) && "border-primary",
              hasSession && !isSameDay(day, selectedDate) && "border-green-500",
              isPastDate && "opacity-50 cursor-not-allowed bg-muted/20",
              !isPastDate && "cursor-pointer",
            )}
            onClick={() => !isPastDate && onDateClick(cloneDay)}
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
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) handleDialogClose()
            else handleDialogOpen()
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full">{isEditing ? "Edit Study Session" : "Add Study Session"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-[425px] max-h-[85vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Study Session" : "Add Study Session"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update your study session details" : "Plan a new study session for your courses"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddSession)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                      <FormLabel>Duration (minutes) *</FormLabel>
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
                  <Button type="submit">{isEditing ? "Update" : "Add"} Session</Button>
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
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEditSession(session)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(session.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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

      {/* Delete Confirmation Dialog - Using regular Dialog instead of AlertDialog */}
      <Dialog open={sessionToDelete !== null} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-[425px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Delete study session?</DialogTitle>
            <DialogDescription>This will remove the study session from your schedule.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSession}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

