"use client"

import { useAppStore } from "@/Frontend/lib/store"
import { ArrowLeft, Search, Plus, Edit, Trash2, Eye, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function EquipmentList({ onBack }: { onBack: () => void }) {
  const { equipment, requests, teams, technicians } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Get technician name by ID
  const getTechnicianName = (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId)
    return technician ? technician.name : "Unassigned"
  }

  // Get team name by ID
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    return team ? team.name : "No Team"
  }

  // Get request count for equipment
  const getRequestCount = (equipmentId: string) => {
    return requests.filter((r) => r.equipment.id === equipmentId && r.status !== "Repaired").length
  }

  // Get current assigned technician from active requests
  const getCurrentTechnician = (equipmentId: string) => {
    const activeRequest = requests.find(r => 
      r.equipment.id === equipmentId && 
      (r.status === "New" || r.status === "In Progress") &&
      r.assignedTo
    )
    return activeRequest && activeRequest.assignedTo 
      ? activeRequest.assignedTo.name 
      : getTechnicianName(equipment.find(eq => eq.id === equipmentId)?.assignedTo || "")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200"
      case "Maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Inactive": return "bg-gray-100 text-gray-800 border-gray-200"
      case "Scrap": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getHealthColor = (health: number | undefined) => {
    if (!health) return "text-gray-600"
    if (health >= 80) return "text-green-600 font-medium"
    if (health >= 50) return "text-yellow-600 font-medium"
    return "text-red-600 font-medium"
  }

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.department.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(eq => {
    if (selectedFilter === "all") return true
    return eq.status.toLowerCase() === selectedFilter.toLowerCase()
  })

  const handleViewDetails = (equipmentItem: any) => {
    console.log("View equipment details:", equipmentItem)
    // TODO: Navigate to equipment detail view
  }

  const handleEdit = (equipmentItem: any) => {
    console.log("Edit equipment:", equipmentItem)
    // TODO: Open edit modal
  }

  const handleDelete = (equipmentItem: any) => {
    console.log("Delete equipment:", equipmentItem)
    // TODO: Show confirmation dialog
  }

  const handleScheduleMaintenance = (equipmentItem: any) => {
    console.log("Schedule maintenance for:", equipmentItem)
    // TODO: Navigate to maintenance request form
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Equipment List</h2>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Equipment
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search equipment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="scrap">Scrap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Equipment Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Employee</TableHead>
              <TableHead className="font-semibold text-gray-900">Department</TableHead>
              <TableHead className="font-semibold text-gray-900">Serial Number</TableHead>
              <TableHead className="font-semibold text-gray-900">Technician</TableHead>
              <TableHead className="font-semibold text-gray-900">Equipment Category</TableHead>
              <TableHead className="font-semibold text-gray-900">Company</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Health</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.map((eq) => (
              <TableRow key={eq.id} className="border-t hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{eq.name}</div>
                    <div className="text-sm text-gray-500">{eq.location}</div>
                  </div>
                </TableCell>
                <TableCell>Mitchell Admin</TableCell>
                <TableCell>{eq.department}</TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {eq.serialNumber}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{getCurrentTechnician(eq.id)}</span>
                    {getRequestCount(eq.id) > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {getRequestCount(eq.id)} active
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{eq.category}</TableCell>
                <TableCell>My Company (San Francisco)</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(eq.status)}>
                    {eq.status}
                  </Badge>
                </TableCell>
                <TableCell className={getHealthColor(eq.health)}>
                  {eq.health ? `${eq.health}%` : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(eq)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleScheduleMaintenance(eq)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Wrench className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(eq)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(eq)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No equipment found matching your search.</p>
        </div>
      )}
    </div>
  )
}
