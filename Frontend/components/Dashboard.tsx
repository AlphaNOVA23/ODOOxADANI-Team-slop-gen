import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { AlertTriangle, Users, ClipboardList, Search, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RequestOverview } from "./RequestOverview"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function Dashboard() {
  const { requests, equipment, teams, selectedRequest, setSelectedRequest, createMaintenanceRequest, loadAppData } = useAppStore()
  const [newOpen, setNewOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [newRequest, setNewRequest] = useState({
    subject: "",
    request_type: "Corrective" as const,
    equipment_id: "",
    scheduled_date: "",
    priority: "Low",
    description: "",
    notes: "",
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await loadAppData()
      setIsLoading(false)
    }
    loadData()
  }, [loadAppData])

  // Debug info
  console.log("Dashboard - Equipment count:", equipment.length)
  console.log("Dashboard - Requests count:", requests.length)

  const criticalEquipment = equipment.filter(e => e.health && e.health < 30).length
  const technicianLoad = 85 // Mock data - could be calculated from team assignments
  const openRequests = requests.filter(r => r.status === "New").length
  const overdueRequests = requests.filter(r => r.isOverdue).length

  const tableData = requests.map(request => ({
    id: request.id,
    subject: request.subject,
    employee: "Mitchell Admin", // Mock data - could be from user system
    technician: request.assignedTo?.name || "Unassigned",
    category: request.equipment.category.toLowerCase(),
    stage: request.status,
    company: "My company", // Mock data
    request: request
  }))

  const handleRowClick = (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (request) {
      setSelectedRequest(request)
    }
  }

  // Show RequestOverview if a request is selected
  if (selectedRequest) {
    return <RequestOverview />
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAppData()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
              <DialogDescription>Creates a new request and saves it in the backend.</DialogDescription>
            </DialogHeader>

            {createError ? (
              <div className="text-sm text-red-600">{createError}</div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={newRequest.subject}
                  onChange={(e) => setNewRequest({ ...newRequest, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newRequest.request_type}
                    onValueChange={(v) => setNewRequest({ ...newRequest, request_type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corrective">Corrective</SelectItem>
                      <SelectItem value="Preventive">Preventive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newRequest.priority}
                    onValueChange={(v) => setNewRequest({ ...newRequest, priority: v })}
                  >
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment</label>
                <Select
                  value={newRequest.equipment_id}
                  onValueChange={(v) => setNewRequest({ ...newRequest, equipment_id: v })}
                  disabled={isLoading || equipment.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading equipment..." : equipment.length === 0 ? "No equipment available" : "Select equipment"} />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-gray-500">
                        {isLoading ? "Loading..." : "No equipment found. Please add equipment first."}
                      </div>
                    ) : (
                      equipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name} ({eq.serialNumber})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  value={newRequest.scheduled_date}
                  onChange={(e) => setNewRequest({ ...newRequest, scheduled_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNewOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isCreating || equipment.length === 0}
                onClick={async () => {
                  setCreateError("")
                  if (!newRequest.subject || !newRequest.equipment_id) {
                    setCreateError("Subject and equipment are required")
                    return
                  }
                  setIsCreating(true)
                  try {
                    const ok = await createMaintenanceRequest(newRequest)
                    if (!ok) {
                      setCreateError("Failed to create request")
                      return
                    }
                    setNewOpen(false)
                    setNewRequest({
                      subject: "",
                      request_type: "Corrective",
                      equipment_id: "",
                      scheduled_date: "",
                      priority: "Low",
                      description: "",
                      notes: "",
                    })
                  } catch (error) {
                    console.error("Create request error:", error)
                    setCreateError("An error occurred while creating the request")
                  } finally {
                    setIsCreating(false)
                  }
                }}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Q Search..." 
              className="pl-10 w-64"
            />
          </div>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical Equipment */}
        <div className="border-2 border-red-500 rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Critical</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{criticalEquipment} Units</p>
            <p className="text-sm text-gray-600">(Health &lt; 30%)</p>
          </div>
        </div>

        {/* Technician Load */}
        <div className="border-2 border-blue-500 rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-blue-600 font-medium">Load</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{technicianLoad}% Utilized</p>
            <p className="text-sm text-gray-600">(Assign Carefully)</p>
          </div>
        </div>

        {/* Open Requests */}
        <div className="border-2 border-green-500 rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <ClipboardList className="w-8 h-8 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Requests</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{openRequests} Pending</p>
            <p className="text-sm text-red-600">{overdueRequests} Overdue</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Subjects</TableHead>
              <TableHead className="font-semibold text-gray-900">Employee</TableHead>
              <TableHead className="font-semibold text-gray-900">Technician</TableHead>
              <TableHead className="font-semibold text-gray-900">Category</TableHead>
              <TableHead className="font-semibold text-gray-900">Stage</TableHead>
              <TableHead className="font-semibold text-gray-900">Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow 
                key={row.id} 
                className="border-t cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRowClick(row.id)}
              >
                <TableCell className="font-medium">{row.subject}</TableCell>
                <TableCell>{row.employee}</TableCell>
                <TableCell>{row.technician}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {row.stage}
                  </span>
                </TableCell>
                <TableCell>{row.company}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
  
