export type RequestStatus = "New" | "In Progress" | "Repaired" | "Scrap"
export type RequestType = "Corrective" | "Preventive"
export type Priority = "Low" | "Medium" | "High" | "Critical"

export interface Technician {
  id: string
  name: string
  avatar: string
  email: string
  phone: string
}

export interface Team {
  id: string
  name: string
  description: string
  members: Technician[]
}

export interface Equipment {
  id: string
  name: string
  serialNumber: string
  category: string
  purchaseDate: string
  warranty: {
    startDate: string
    endDate: string
    isActive: boolean
  }
  location: string
  department: string
  assignedTo: string // Technician ID
  maintenanceTeam: string // Team ID
  status: "Active" | "Maintenance" | "Inactive" | "Scrap"
  requestCount?: number
}

export interface MaintenanceRequest {
  id: string
  subject: string
  description: string
  type: RequestType
  status: RequestStatus
  equipment: Equipment
  assignedTeam: Team
  assignedTo?: Technician
  priority: Priority
  scheduledDate: string
  createdDate: string
  completedDate?: string
  duration?: number
  notes?: string
  isOverdue?: boolean
}
