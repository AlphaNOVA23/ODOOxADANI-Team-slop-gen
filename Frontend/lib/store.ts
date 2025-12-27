"use client"

import { create } from "zustand"
import type { MaintenanceRequest, Equipment, Team, Technician } from "@/types"
import { authApi, apiClient, equipmentApi, requestsApi, teamsApi, techniciansApi } from "./api-axios"

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
  updateRequestStatus: (id: string, status: string) => Promise<void>
  addRequest: (request: MaintenanceRequest) => void
  updateRequest: (request: MaintenanceRequest) => void
  addEquipment: (equipment: Equipment) => void
  initializeAuth: () => Promise<void>
  loadAppData: () => Promise<void>
  createMaintenanceRequest: (payload: { subject: string; request_type: "Corrective" | "Preventive"; equipment_id: string; scheduled_date?: string; priority?: string; description?: string; notes?: string }) => Promise<boolean>
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

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  requests: mockRequests,
  equipment: mockEquipment,
  teams: mockTeams,
  technicians: mockTechnicians,
  selectedRequest: null,

  setSelectedRequest: (request) => set({ selectedRequest: request }),

  updateRequestStatus: async (id, status) => {
    set((state) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, status: status as any } : r)),
    }))

    const requestId = Number.parseInt(id, 10)
    if (Number.isNaN(requestId)) {
      return
    }

    await requestsApi.updateRequest(requestId, { stage: status })
  },

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

  loadAppData: async () => {
    const [teamsRes, techniciansRes, equipmentRes, requestsRes] = await Promise.all([
      teamsApi.listTeamsWithMembers(),
      techniciansApi.listTechnicians(),
      equipmentApi.listEquipment(),
      requestsApi.listRequests(),
    ])

    if (teamsRes.error || techniciansRes.error || equipmentRes.error || requestsRes.error) {
      return
    }

    const technicians: Technician[] = (techniciansRes.data || []).map((t) => ({
      id: t.id.toString(),
      name: t.name,
      avatar: t.avatar_url || "👨‍🔧",
      email: t.username,
      phone: "",
    }))

    const teams: Team[] = (teamsRes.data || []).map((team) => ({
      id: team.id.toString(),
      name: team.name,
      description: team.description || "",
      members: (team.members || []).map((m) => ({
        id: m.id.toString(),
        name: m.name,
        avatar: m.avatar_url || "👨‍🔧",
        email: m.username,
        phone: "",
      })),
    }))

    const equipment: Equipment[] = (equipmentRes.data || []).map((eq) => {
      const purchaseDate = eq.purchase_date ? String(eq.purchase_date) : new Date().toISOString().split("T")[0]
      const warrantyStartDate = eq.warranty_start_date ? String(eq.warranty_start_date) : purchaseDate
      const warrantyEndDate = eq.warranty_end_date ? String(eq.warranty_end_date) : purchaseDate

      return {
        id: eq.id.toString(),
        name: eq.name,
        serialNumber: eq.serial_number,
        category: eq.category || "",
        purchaseDate,
        warranty: {
          startDate: warrantyStartDate,
          endDate: warrantyEndDate,
          isActive: new Date(warrantyEndDate) >= new Date(),
        },
        location: eq.location || "",
        department: eq.department || "",
        assignedTo: eq.default_technician_id ? eq.default_technician_id.toString() : "",
        maintenanceTeam: eq.maintenance_team_id.toString(),
        status: eq.is_active ? "Active" : "Inactive",
        health: undefined,
        requestCount: eq.open_requests_count,
      }
    })

    const equipmentById = new Map(equipment.map((e) => [e.id, e]))
    const teamsById = new Map(teams.map((t) => [t.id, t]))
    const techniciansById = new Map(technicians.map((t) => [t.id, t]))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const requests: MaintenanceRequest[] = (requestsRes.data || []).map((r) => {
      const scheduledDate = r.scheduled_date ? String(r.scheduled_date) : new Date().toISOString().split("T")[0]
      const createdDate = r.created_date ? String(r.created_date) : scheduledDate
      const completedDate = r.completed_date ? String(r.completed_date) : undefined
      const equipmentItem = equipmentById.get(r.equipment_id.toString())
      const teamItem = teamsById.get(r.maintenance_team_id.toString())
      const technicianItem = r.technician_id ? techniciansById.get(r.technician_id.toString()) : undefined

      const overdue = new Date(scheduledDate) < today && r.stage !== "Repaired"

      return {
        id: r.id.toString(),
        subject: r.subject,
        description: r.description || "",
        type: r.request_type,
        status: r.stage,
        equipment: equipmentItem || {
          id: r.equipment_id.toString(),
          name: "Unknown",
          serialNumber: "",
          category: "",
          purchaseDate: new Date().toISOString().split("T")[0],
          warranty: { startDate: new Date().toISOString().split("T")[0], endDate: new Date().toISOString().split("T")[0], isActive: true },
          location: "",
          department: "",
          assignedTo: "",
          maintenanceTeam: r.maintenance_team_id.toString(),
          status: "Active",
        },
        assignedTeam: teamItem || { id: r.maintenance_team_id.toString(), name: "Team", description: "", members: [] },
        assignedTo: technicianItem,
        priority: (r.priority as any) || "Low",
        scheduledDate,
        createdDate,
        completedDate,
        duration: r.duration,
        notes: r.notes || undefined,
        isOverdue: overdue,
      }
    })

    set({ teams, technicians, equipment, requests })
  },

  createMaintenanceRequest: async (payload) => {
    const equipmentId = Number.parseInt(payload.equipment_id, 10)
    if (Number.isNaN(equipmentId)) {
      return false
    }

    const res = await requestsApi.createRequest({
      subject: payload.subject,
      request_type: payload.request_type,
      equipment_id: equipmentId,
      scheduled_date: payload.scheduled_date,
      priority: payload.priority,
      description: payload.description,
      notes: payload.notes,
    })

    if (res.error) {
      return false
    }

    await get().loadAppData()
    return true
  },

  initializeAuth: async () => {
    if (typeof window === "undefined") {
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      set({ user: null, isAuthenticated: false })
      return
    }

    apiClient.setToken(token)

    const userResponse = await authApi.getCurrentUser()
    if (userResponse.data) {
      set({
        user: {
          id: userResponse.data.id.toString(),
          name: userResponse.data.name,
          email: userResponse.data.username,
          avatar: userResponse.data.avatar_url,
        },
        isAuthenticated: true,
      })

      await get().loadAppData()
      return
    }

    apiClient.clearToken()
    set({ user: null, isAuthenticated: false })
  },

  login: async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      if (response.data) {
        apiClient.setToken(response.data.access_token);
        
        // Get user details
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.data) {
          set({
            user: {
              id: userResponse.data.id.toString(),
              name: userResponse.data.name,
              email: userResponse.data.username,
              avatar: userResponse.data.avatar_url,
            },
            isAuthenticated: true,
          });

          await get().loadAppData()
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: () => {
    apiClient.clearToken();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  signup: async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      const response = await authApi.signup({
        username: userData.email,
        password: userData.password,
        name: userData.name,
        avatar_url: userData.avatar,
      });
      
      if (response.data) {
        apiClient.setToken(response.data.access_token);
        
        // Get user details
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.data) {
          set({
            user: {
              id: userResponse.data.id.toString(),
              name: userResponse.data.name,
              email: userResponse.data.username,
              avatar: userResponse.data.avatar_url,
            },
            isAuthenticated: true,
          });
          await get().loadAppData()
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  },
}))
