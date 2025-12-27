"use client"

import { create } from "zustand"
import type { MaintenanceRequest, Equipment, Team, Technician } from "@/Frontend/types"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  department?: string
  avatar?: string
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  requests: MaintenanceRequest[]
  equipment: Equipment[]
  teams: Team[]
  technicians: Technician[]
  selectedRequest: MaintenanceRequest | null
  setSelectedRequest: (request: MaintenanceRequest | null) => void
  updateRequestStatus: (id: string, status: string) => void
  addRequest: (request: MaintenanceRequest) => void
  updateRequest: (request: MaintenanceRequest) => void
  addEquipment: (equipment: Equipment) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>
}

const mockTechnicians: Technician[] = [
  { id: "1", name: "John Smith", avatar: "👨‍🔧", email: "john@gearguard.com", phone: "555-0101" },
  { id: "2", name: "Sarah Davis", avatar: "👩‍🔧", email: "sarah@gearguard.com", phone: "555-0102" },
  { id: "3", name: "Mike Johnson", avatar: "👨‍🔧", email: "mike@gearguard.com", phone: "555-0103" },
  { id: "4", name: "Lisa Anderson", avatar: "👩‍🔧", email: "lisa@gearguard.com", phone: "555-0104" },
]

const mockTeams: Team[] = [
  {
    id: "1",
    name: "Mechanics",
    description: "General machinery repair",
    members: [mockTechnicians[0], mockTechnicians[1]],
  },
  {
    id: "2",
    name: "Electricians",
    description: "Electrical systems",
    members: [mockTechnicians[2], mockTechnicians[3]],
  },
  { id: "3", name: "IT Support", description: "Computer and IT equipment", members: [mockTechnicians[3]] },
]

const mockEquipment: Equipment[] = [
  {
    id: "1",
    name: "CNC Machine A",
    serialNumber: "CNC-2023-001",
    category: "Machinery",
    purchaseDate: "2022-03-15",
    warranty: { startDate: "2022-03-15", endDate: "2025-03-15", isActive: true },
    location: "Building A, Floor 2",
    department: "Production",
    assignedTo: "1",
    maintenanceTeam: "1",
    status: "Active",
    health: 25,
  },
  {
    id: "2",
    name: "Hydraulic Press",
    serialNumber: "HYD-2023-002",
    category: "Machinery",
    purchaseDate: "2021-06-20",
    warranty: { startDate: "2021-06-20", endDate: "2024-06-20", isActive: false },
    location: "Building A, Floor 1",
    department: "Production",
    assignedTo: "1",
    maintenanceTeam: "1",
    status: "Active",
    health: 45,
  },
  {
    id: "3",
    name: "Server Rack 01",
    serialNumber: "SRV-2023-001",
    category: "IT Equipment",
    purchaseDate: "2023-01-10",
    warranty: { startDate: "2023-01-10", endDate: "2026-01-10", isActive: true },
    location: "Building B, Room 105",
    department: "IT",
    assignedTo: "3",
    maintenanceTeam: "3",
    status: "Active",
    health: 85,
  },
]

const mockRequests: MaintenanceRequest[] = [
  {
    id: "1",
    subject: "Leaking Oil",
    description: "Hydraulic fluid leaking from main cylinder",
    type: "Corrective",
    status: "New",
    equipment: mockEquipment[1],
    assignedTeam: mockTeams[0],
    priority: "High",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isOverdue: true,
  },
  {
    id: "2",
    subject: "Spindle Bearing Replacement",
    description: "CNC spindle bearing showing signs of wear",
    type: "Preventive",
    status: "In Progress",
    equipment: mockEquipment[0],
    assignedTeam: mockTeams[0],
    assignedTo: mockTechnicians[0],
    priority: "Medium",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "3",
    subject: "Network Cable Issues",
    description: "Server rack network connectivity intermittent",
    type: "Corrective",
    status: "In Progress",
    equipment: mockEquipment[2],
    assignedTeam: mockTeams[2],
    assignedTo: mockTechnicians[3],
    priority: "Critical",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "4",
    subject: "Routine Monthly Checkup",
    description: "Regular preventive maintenance",
    type: "Preventive",
    status: "New",
    equipment: mockEquipment[0],
    assignedTeam: mockTeams[0],
    priority: "Low",
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdDate: new Date().toISOString().split("T")[0],
  },
]

export const useAppStore = create<AppState>((set) => ({
  requests: mockRequests,
  equipment: mockEquipment,
  teams: mockTeams,
  technicians: mockTechnicians,
  selectedRequest: null,

  setSelectedRequest: (request) => set({ selectedRequest: request }),

  updateRequestStatus: (id, status) =>
    set((state) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, status: status as any } : r)),
    })),

  addRequest: (request) =>
    set((state) => ({
      requests: [...state.requests, request],
    })),

  updateRequest: (request) =>
    set((state) => ({
      requests: state.requests.map((r) => (r.id === request.id ? request : r)),
    })),

  addEquipment: (equipment) =>
    set((state) => ({
      equipment: [...state.equipment, equipment],
    })),
}))
