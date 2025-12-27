"use client"

import type React from "react"

import type { MaintenanceRequest } from "@/Frontend/types"
import { useAppStore } from "@/Frontend/lib/store"
import { AlertCircle, Clock, CheckCircle, Trash2 } from "lucide-react"
import { useState } from "react"

const STATUSES = ["New", "In Progress", "Repaired", "Scrap"]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "border-l-red-600 bg-red-950/20"
    case "High":
      return "border-l-orange-600 bg-orange-950/20"
    case "Medium":
      return "border-l-yellow-600 bg-yellow-950/20"
    default:
      return "border-l-blue-600 bg-blue-950/20"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "New":
      return <AlertCircle size={16} className="text-blue-400" />
    case "In Progress":
      return <Clock size={16} className="text-yellow-400" />
    case "Repaired":
      return <CheckCircle size={16} className="text-green-400" />
    default:
      return <Trash2 size={16} className="text-red-400" />
  }
}

interface KanbanColumnProps {
  status: string
  requests: MaintenanceRequest[]
  onDragStart: (e: React.DragEvent, request: MaintenanceRequest) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: string) => void
}

function KanbanColumn({ status, requests, onDragStart, onDragOver, onDrop }: KanbanColumnProps) {
  return (
    <div
      className="flex-1 min-w-80 bg-secondary rounded-lg border border-border p-4"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center gap-2 mb-4">
        {getStatusIcon(status)}
        <h3 className="font-semibold text-sm">{status}</h3>
        <span className="ml-auto bg-primary/20 px-2 py-1 rounded text-xs">{requests.length}</span>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            draggable
            onDragStart={(e) => onDragStart(e, request)}
            className={`p-4 rounded-lg border-l-4 cursor-move hover:shadow-lg transition-all ${getPriorityColor(request.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm line-clamp-2">{request.subject}</h4>
              {request.isOverdue && (
                <span className="bg-destructive/20 text-destructive px-2 py-1 rounded text-xs whitespace-nowrap ml-2">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{request.equipment.name}</p>
            <div className="flex items-center gap-2">
              {request.assignedTo && (
                <div className="w-6 h-6 rounded-full bg-primary/40 flex items-center justify-center text-xs font-bold">
                  {request.assignedTo.avatar}
                </div>
              )}
              <span className="text-xs text-muted-foreground">{request.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KanbanBoard() {
  const { requests, updateRequestStatus } = useAppStore()
  const [draggedRequest, setDraggedRequest] = useState<MaintenanceRequest | null>(null)

  const handleDragStart = (e: React.DragEvent, request: MaintenanceRequest) => {
    setDraggedRequest(request)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggedRequest) {
      updateRequestStatus(draggedRequest.id, status)
      setDraggedRequest(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Maintenance Kanban Board</h2>
        <p className="text-muted-foreground">Drag and drop requests to update their status</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            requests={requests.filter((r) => r.status === status)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}
