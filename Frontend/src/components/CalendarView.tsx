"use client"
import { useAppStore } from "../store"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function CalendarView() {
  const { requests } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 27)) // December 27, 2024

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const previousMonthDays = Array.from({ length: firstDay }, (_, i) => i)

  const getRequestsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return requests.filter((r) => r.scheduledDate === dateStr && r.type === "Preventive")
  }

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Preventive Maintenance Calendar</h2>
        <p className="text-muted-foreground">Schedule and view preventive maintenance tasks</p>
      </div>

      <div className="bg-secondary border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{monthName}</h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-border rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-border rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-muted-foreground text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {previousMonthDays.map(() => (
            <div key={`prev-${Math.random()}`} className="bg-secondary/50 rounded-lg p-2 h-24"></div>
          ))}

          {days.map((day) => {
            const dayRequests = getRequestsForDate(day)
            const isToday =
              currentDate.getFullYear() === new Date().getFullYear() &&
              currentDate.getMonth() === new Date().getMonth() &&
              day === new Date().getDate()

            return (
              <div
                key={day}
                className={`rounded-lg p-2 h-24 border cursor-pointer transition-colors overflow-hidden ${
                  isToday ? "bg-primary/20 border-primary" : "bg-secondary border-border hover:border-accent"
                }`}
              >
                <div className="font-semibold text-sm mb-1">{day}</div>
                <div className="space-y-1 text-xs">
                  {dayRequests.slice(0, 2).map((req) => (
                    <div key={req.id} className="bg-accent/30 text-accent-foreground px-1 py-0.5 rounded truncate">
                      {req.subject}
                    </div>
                  ))}
                  {dayRequests.length > 2 && (
                    <div className="text-muted-foreground text-xs">+{dayRequests.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
