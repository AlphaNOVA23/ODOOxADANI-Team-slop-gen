"use client"

import { Menu, Settings, Bell, User } from "lucide-react"
import { useState } from "react"

interface NavbarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false)

  const views = [
    { id: "dashboard", label: "Dashboard" },
    { id: "kanban", label: "Kanban Board" },
    { id: "calendar", label: "Calendar" },
    { id: "equipment", label: "Equipment" },
    { id: "teams", label: "Teams" },
    { id: "reports", label: "Reports" },
  ]

  return (
    <nav className="bg-secondary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">GG</div>
          <h1 className="text-xl font-bold">GearGuard</h1>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === view.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-border"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-border rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-border rounded-lg transition-colors">
            <Settings size={20} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-border rounded-lg transition-colors">
            <User size={20} />
            <span className="hidden sm:inline text-sm">Admin</span>
          </button>
          <button className="md:hidden p-2 hover:bg-border rounded-lg" onClick={() => setShowMenu(!showMenu)}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {showMenu && (
        <div className="md:hidden bg-secondary border-t border-border px-4 py-3 space-y-2">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => {
                onViewChange(view.id)
                setShowMenu(false)
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentView === view.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-border"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
