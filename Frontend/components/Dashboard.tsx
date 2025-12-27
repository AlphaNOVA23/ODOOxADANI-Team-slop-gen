import { useAppStore } from "@/lib/store"
import { AlertTriangle, Users, ClipboardList, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RequestOverview } from "./RequestOverview"

export function Dashboard() {
  const { requests, equipment, teams, selectedRequest, setSelectedRequest } = useAppStore()

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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
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
