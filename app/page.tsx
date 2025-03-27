"use client"
import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseList } from "@/components/course-list"
import { AddCourseForm } from "@/components/add-course-form"
import { StudySchedule } from "@/components/study-schedule"
import { ResourceManager } from "@/components/resource-manager"
import { useCourses } from "@/lib/hooks/use-courses"
import { MainNavigation } from "@/components/main-navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { MobileNavigation } from "@/components/mobile-navigation"

// Make sure we're using Sonner toast properly in the main component

import { Toaster, toast } from "sonner"

export default function Dashboard() {
  const {
    courses,
    setCourses,
    addCourse,
    updateCourseProgress,
    deleteCourse,
    addResource,
    removeResource,
    undoDeleteCourse,
  } = useCourses()
  const [activeTab, setActiveTab] = useState("courses")
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Desktop navigation - only shown on md and larger screens */}
      {!isMobile && <MainNavigation activeTab={activeTab} onTabChange={setActiveTab} />}

      <div className="flex-1 overflow-auto">
        {/* Mobile header - only shown on smaller screens */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Learning Dashboard</h1>
            {activeTab === "courses" && courses.length > 0 && (
              <Button size="sm" onClick={() => setAddCourseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        )}

        <div className={`p-4 md:p-6 ${isMobile ? "pb-20" : ""}`}>
          {!isMobile && (
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  {activeTab === "courses" && "My Courses"}
                  {activeTab === "schedule" && "Study Schedule"}
                  {activeTab === "resources" && "Learning Resources"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "courses" && "View and manage your learning courses"}
                  {activeTab === "schedule" && "Manage your study schedule and upcoming sessions"}
                  {activeTab === "resources" && "Manage resources for your courses"}
                </p>
              </div>

              {activeTab === "courses" && courses.length > 0 && (
                <Button onClick={() => setAddCourseDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="courses" className="space-y-4 mt-0">
              <CourseList
                courses={courses}
                onUpdateProgress={updateCourseProgress}
                onDeleteCourse={(id) => {
                  // Store the course before deleting it
                  const courseToDelete = courses.find((course) => course.id === id)
                  if (courseToDelete) {
                    // Delete the course
                    deleteCourse(id)

                    // Show toast with direct undo function
                    toast("Course deleted", {
                      description: "The course has been removed",
                      action: {
                        label: "Undo",
                        onClick: () => {
                          // Add the course back
                          setCourses((prev) => [...prev, courseToDelete].sort((a, b) => a.createdAt - b.createdAt))
                          toast.success("Course restored")
                        },
                      },
                    })
                  }
                }}
                onUndoDeleteCourse={undoDeleteCourse}
                onAddCourse={() => setAddCourseDialogOpen(true)}
              />
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Study Schedule</CardTitle>
                  <CardDescription>Manage your study schedule and upcoming sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <StudySchedule courses={courses} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Learning Resources</CardTitle>
                  <CardDescription>Manage resources for your courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResourceManager courses={courses} onAddResource={addResource} onRemoveResource={removeResource} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* Add Course Dialog */}
      <Dialog open={addCourseDialogOpen} onOpenChange={setAddCourseDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px] max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Add a new course to your learning dashboard</DialogDescription>
          </DialogHeader>
          <AddCourseForm
            onAddCourse={(course) => {
              addCourse(course)
              setAddCourseDialogOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Make sure Toaster is included in the component with responsive positioning */}
      <Toaster position={isMobile ? "top-center" : "bottom-right"} />
    </div>
  )
}

