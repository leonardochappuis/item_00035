"use client"
import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseList } from "@/components/course-list"
import { AddCourseForm } from "@/components/add-course-form"
import { StudySchedule } from "@/components/study-schedule"
import { ResourceManager } from "@/components/resource-manager"
import { ProgressTracker } from "@/components/progress-tracker"
import { useCourses } from "@/lib/hooks/use-courses"
import { Toaster } from "@/components/ui/toaster"
import { MainNavigation } from "@/components/main-navigation"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Dashboard() {
  const { courses, addCourse, updateCourseProgress, deleteCourse, addResource, removeResource } = useCourses()
  const [activeTab, setActiveTab] = useState("courses")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Desktop navigation - only shown on md and larger screens */}
      {isDesktop && <MainNavigation activeTab={activeTab} onTabChange={setActiveTab} />}

      <div className="flex-1 overflow-auto">
        {/* Mobile header with navigation - only shown on smaller screens */}
        {!isDesktop && (
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Learning Dashboard</h1>
            <MainNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        <div className="p-4 md:p-6">
          {isDesktop && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                {activeTab === "courses" && "My Courses"}
                {activeTab === "add" && "Add New Course"}
                {activeTab === "schedule" && "Study Schedule"}
                {activeTab === "resources" && "Learning Resources"}
                {activeTab === "progress" && "Learning Progress"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === "courses" && "View and manage your learning courses"}
                {activeTab === "add" && "Add a new course to your learning dashboard"}
                {activeTab === "schedule" && "Manage your study schedule and upcoming sessions"}
                {activeTab === "resources" && "Manage resources for your courses"}
                {activeTab === "progress" && "Track your overall learning progress"}
              </p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="courses" className="space-y-4 mt-0">
              <CourseList courses={courses} onUpdateProgress={updateCourseProgress} onDeleteCourse={deleteCourse} />
            </TabsContent>

            <TabsContent value="add" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Add New Course</CardTitle>
                  <CardDescription>Add a new course to your learning dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddCourseForm onAddCourse={addCourse} />
                </CardContent>
              </Card>
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

            <TabsContent value="progress" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Learning Progress</CardTitle>
                  <CardDescription>Track your overall learning progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressTracker courses={courses} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

