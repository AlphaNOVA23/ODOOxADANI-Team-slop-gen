"use client"

import type { Equipment } from "../types"
import { useAppStore } from "../store"
import { AlertCircle, Wrench, Calendar } from "lucide-react"
import { useState } from "react"

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-950/40 text-green-300 border-green-600"
    case "Maintenance":
      return "bg-yellow-950/40 text-yellow-300 border-yellow-600"
    case "Inactive":
      return "bg-gray-950/40 text-gray-400 border-gray-600"
    default:
      return "bg-red-950/40 text-red-300 border-red-600"
  }
}

const isWarrantyActive = (endDate: string) => {
  return new Date(endDate) > new Date()
}

interface EquipmentCardProps {
  equipment: Equipment
  requestCount: number
}

function EquipmentCard({ equipment, requestCount }: EquipmentCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-secondary border border-border rounded-lg p-6 hover:border-accent transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{equipment.name}</h3>
          <p className="text-sm text-muted-foreground">SN: {equipment.serialNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(equipment.status)}`}>
          {equipment.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground">Category</p>
          <p className="font-semibold">{equipment.category}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Department</p>
          <p className="font-semibold">{equipment.department}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Location</p>
          <p className="font-semibold text-xs">{equipment.location}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Purchase Date</p>
          <p className="font-semibold">{new Date(equipment.purchaseDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg">
        {isWarrantyActive(equipment.warranty.endDate) ? (
          <>
            <Calendar size={16} className="text-green-400" />
            <span className="text-sm">
              Warranty active until {new Date(equipment.warranty.endDate).toLocaleDateString()}
            </span>
          </>
        ) : (
          <>
            <AlertCircle size={16} className="text-destructive" />
            <span className="text-sm text-destructive">Warranty expired</span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-primary hover:bg-accent text-primary-foreground px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
          <Wrench size={16} />
          Maintenance ({requestCount})
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 border border-border hover:bg-border rounded-lg transition-colors text-sm"
        >
          Details
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Assigned Technician ID:</span> {equipment.assignedTo}
          </p>
          <p>
            <span className="text-muted-foreground">Maintenance Team ID:</span> {equipment.maintenanceTeam}
          </p>
        </div>
      )}
    </div>
  )
}

export function EquipmentList() {
  const { equipment, requests } = useAppStore()

  const getRequestCount = (equipmentId: string) => {
    return requests.filter((r) => r.equipment.id === equipmentId && r.status !== "Repaired").length
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Equipment Management</h2>
        <p className="text-muted-foreground">Track all company assets and their maintenance status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((eq) => (
          <EquipmentCard key={eq.id} equipment={eq} requestCount={getRequestCount(eq.id)} />
        ))}
      </div>
    </div>
  )
}
