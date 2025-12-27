"use client"

import { useState } from "react"
import { Navbar } from "./components/Navbar"
import { Dashboard } from "./components/Dashboard"
import { KanbanBoard } from "./components/KanbanBoard"
import { EquipmentList } from "./components/EquipmentList"
import { CalendarView } from "./components/CalendarView"
import { TeamsView } from "./components/TeamsView"
import { ReportsView } from "./components/ReportsView"

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard")

  const renderView = () => {
    switch (currentView) {
      case "kanban":
        return <KanbanBoard />
      case "equipment":
        return <EquipmentList />
      case "calendar":
        return <CalendarView />
      case "teams":
        return <TeamsView />
      case "reports":
        return <ReportsView />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 py-8">{renderView()}</main>
    </div>
  )
}
