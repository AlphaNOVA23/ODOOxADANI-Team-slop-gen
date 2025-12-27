import { useState } from "react"
import { ArrowLeft, Search, Plus, Edit, Trash2, Eye, Wrench, AlertTriangle, Clock, CheckCircle, Diamond, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"

export function EquipmentCategories({ onBack }: { onBack: () => void }) {
  const { equipment, requests, addEquipment, createEquipment, createMaintenanceRequest, teams, technicians } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)
  const [showNewEquipmentForm, setShowNewEquipmentForm] = useState(false)
  const [isCreatingEquipment, setIsCreatingEquipment] = useState(false)
  const [createEquipmentError, setCreateEquipmentError] = useState("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    subject: "",
    request_type: "Preventive" as const,
    scheduled_date: "",
    priority: "Medium",
    description: "",
    notes: "",
  })
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    serialNumber: "",
    category: "",
    department: "",
    location: "",
    status: "Active" as const,
    health: 100,
    maintenanceTeam: "",
    assignedTo: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    warranty: {
      isActive: true,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  })

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const getRequestCount = (equipmentId: string) => {
    return requests.filter((r) => r.equipment.id === equipmentId && r.status !== "Repaired").length
  }

  const handleViewEquipment = (equipmentItem: any) => {
    setSelectedEquipment(equipmentItem)
  }

  const handleEditEquipment = (equipmentItem: any) => {
    console.log("Edit equipment:", equipmentItem)
    // TODO: Open edit modal
  }

  const handleDeleteEquipment = (equipmentItem: any) => {
    console.log("Delete equipment:", equipmentItem)
    // TODO: Show confirmation dialog
  }

  const handleCreateEquipment = () => {
    setShowNewEquipmentForm(true)
  }

  const handleScheduleMaintenance = () => {
    if (!selectedEquipment) return
    setScheduleData({
      subject: `Preventive Maintenance - ${selectedEquipment.name}`,
      request_type: "Preventive",
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "Medium",
      description: "",
      notes: "",
    })
    setShowScheduleModal(true)
  }

  const handleCreateScheduledRequest = async () => {
    if (!selectedEquipment) return
    setIsScheduling(true)
    const success = await createMaintenanceRequest({
      ...scheduleData,
      equipment_id: selectedEquipment.id,
    })
    if (success) {
      setShowScheduleModal(false)
    }
    setIsScheduling(false)
  }

  const handleSaveEquipment = async () => {
    if (!newEquipment.name || !newEquipment.serialNumber || !newEquipment.category) {
      setCreateEquipmentError("Please fill in all required fields")
      return
    }

    setIsCreatingEquipment(true)
    setCreateEquipmentError("")

    try {
      const payload = {
        name: newEquipment.name,
        serial_number: newEquipment.serialNumber,
        category: newEquipment.category,
        department: newEquipment.department || undefined,
        location: newEquipment.location || undefined,
        purchase_date: newEquipment.purchaseDate || undefined,
        warranty_info: newEquipment.warranty.isActive 
          ? `Warranty active until ${newEquipment.warranty.endDate}` 
          : "No warranty",
        maintenance_team_id: newEquipment.maintenanceTeam ? Number.parseInt(newEquipment.maintenanceTeam, 10) : undefined,
        default_technician_id: newEquipment.assignedTo ? Number.parseInt(newEquipment.assignedTo, 10) : undefined,
        is_active: newEquipment.status === "Active",
      }

      const success = await createEquipment(payload)
      if (!success) {
        setCreateEquipmentError("Failed to create equipment")
        return
      }

      setShowNewEquipmentForm(false)
      setNewEquipment({
        name: "",
        serialNumber: "",
        category: "",
        department: "",
        location: "",
        status: "Active" as const,
        health: 100,
        maintenanceTeam: "",
        assignedTo: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        warranty: {
          isActive: true,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      })
    } catch (error) {
      console.error("Create equipment error:", error)
      setCreateEquipmentError("An error occurred while creating the equipment")
    } finally {
      setIsCreatingEquipment(false)
    }
  }

  // Show equipment detail view
  if (selectedEquipment) {
    const equipmentRequests = requests.filter(r => r.equipment.id === selectedEquipment.id)
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedEquipment(null)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Equipment List
          </Button>
          <h2 className="text-2xl font-bold">Equipment Overview</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Equipment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Equipment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
                  <Input value={selectedEquipment.name} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <Input value={selectedEquipment.serialNumber} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Input value={selectedEquipment.category} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <Input value={selectedEquipment.department} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input value={selectedEquipment.location} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <Input value={new Date(selectedEquipment.purchaseDate).toLocaleDateString()} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>

            {/* Status and Health */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Status & Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Status</label>
                  <div className="mt-2">
                    <Badge className={getStatusColor(selectedEquipment.status)}>
                      {selectedEquipment.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                  <div className={`mt-2 text-lg font-semibold ${getHealthColor(selectedEquipment.health)}`}>
                    {selectedEquipment.health ? `${selectedEquipment.health}%` : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Warranty Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Warranty Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Status</label>
                  <div className="mt-2">
                    {new Date(selectedEquipment.warranty.endDate) > new Date() ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active until {new Date(selectedEquipment.warranty.endDate).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Expired on {new Date(selectedEquipment.warranty.endDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Requests */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleScheduleMaintenance}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Equipment
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Equipment
                </Button>
              </div>
            </div>

            {/* Maintenance Requests */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Maintenance Requests</h3>
              <div className="space-y-3">
                {equipmentRequests.length > 0 ? (
                  equipmentRequests.map(request => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{request.subject}</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.scheduledDate} • {request.priority}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No maintenance requests found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Equipment Form Modal */}
      {showNewEquipmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Equipment</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowNewEquipmentForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {createEquipmentError && (
              <div className="text-sm text-red-600 mb-4">
                {createEquipmentError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
                  <Input
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                    placeholder="Enter equipment name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                  <Input
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                    placeholder="Enter serial number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <Select value={newEquipment.category} onValueChange={(value) => setNewEquipment({...newEquipment, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computers">Computers</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Monitors">Monitors</SelectItem>
                      <SelectItem value="Machinery">Machinery</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <Input
                    value={newEquipment.department}
                    onChange={(e) => setNewEquipment({...newEquipment, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select value={newEquipment.status} onValueChange={(value: any) => setNewEquipment({...newEquipment, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Scrap">Scrap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Health (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newEquipment.health}
                    onChange={(e) => setNewEquipment({...newEquipment, health: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <Input
                    type="date"
                    value={newEquipment.purchaseDate}
                    onChange={(e) => setNewEquipment({...newEquipment, purchaseDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty End Date</label>
                  <Input
                    type="date"
                    value={newEquipment.warranty.endDate}
                    onChange={(e) => setNewEquipment({...newEquipment, warranty: {...newEquipment.warranty, endDate: e.target.value}})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Team</label>
                  <Select value={newEquipment.maintenanceTeam} onValueChange={(value) => setNewEquipment({...newEquipment, maintenanceTeam: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Technician</label>
                  <Select value={newEquipment.assignedTo} onValueChange={(value) => setNewEquipment({...newEquipment, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewEquipmentForm(false)} disabled={isCreatingEquipment}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  onClick={handleSaveEquipment}
                  disabled={isCreatingEquipment}
                >
                  {isCreatingEquipment ? "Saving..." : "Save Equipment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Equipment List</h2>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateEquipment}>
          <Plus className="w-4 h-4 mr-2" />
          New Equipment
        </Button>
      </div>

      {/* Search Bar */}
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
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Equipment Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Serial Number</TableHead>
              <TableHead className="font-semibold text-gray-900">Category</TableHead>
              <TableHead className="font-semibold text-gray-900">Department</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Health</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.map((eq) => (
              <TableRow key={eq.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => handleViewEquipment(eq)}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{eq.name}</div>
                    <div className="text-sm text-gray-500">{eq.location}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {eq.serialNumber}
                  </code>
                </TableCell>
                <TableCell>{eq.category}</TableCell>
                <TableCell>{eq.department}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(eq.status)}>
                    {eq.status}
                  </Badge>
                </TableCell>
                <TableCell className={getHealthColor(eq.health)}>
                  {eq.health ? `${eq.health}%` : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEquipment(eq)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEquipment(eq)}
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

      {/* Schedule Maintenance Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={scheduleData.subject}
                onChange={(e) => setScheduleData({ ...scheduleData, subject: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={scheduleData.request_type} onValueChange={(v) => setScheduleData({ ...scheduleData, request_type: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={scheduleData.priority} onValueChange={(v) => setScheduleData({ ...scheduleData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={scheduleData.scheduled_date}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduled_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={scheduleData.description}
                onChange={(e) => setScheduleData({ ...scheduleData, description: e.target.value })}
                placeholder="Describe the maintenance task..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateScheduledRequest} disabled={isScheduling}>
              {isScheduling ? "Scheduling..." : "Schedule Maintenance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
