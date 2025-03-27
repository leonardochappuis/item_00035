"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen, Calendar, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface MainNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MainNavigation({ activeTab, onTabChange }: MainNavigationProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const menuItems = [
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "schedule", label: "Study Schedule", icon: Calendar },
    { id: "resources", label: "Resources", icon: FileText },
  ]

  const handleMenuItemClick = (tabId: string) => {
    onTabChange(tabId)
    setOpen(false)
  }

  // Mobile menu (Sheet)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="py-4 border-b mb-4">
            <h2 className="text-lg font-semibold px-4">Learning Dashboard</h2>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="justify-start"
                onClick={() => handleMenuItemClick(item.id)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden md:flex h-screen w-[240px] flex-col border-r bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Learning Dashboard</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
            onClick={() => handleMenuItemClick(item.id)}
          >
            <item.icon className="mr-2 h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  )
}

