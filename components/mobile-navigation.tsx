"use client"

import { BookOpen, Calendar, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const menuItems = [
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "resources", label: "Resources", icon: FileText },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10 md:hidden">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon
              className={cn("h-5 w-5 mb-1", activeTab === item.id ? "text-primary" : "text-muted-foreground")}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

