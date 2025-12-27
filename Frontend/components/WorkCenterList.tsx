import { useState } from "react"
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WorkCenter {
  id: string
  name: string
  code: string
  tag: string
  alternativeWorkcenters: string[]
  costPerHour: number
  capacityTimeEfficiency: number
  oeeTarget: number
  status: "Active" | "Inactive" | "Maintenance"
}

export function WorkCenterList({ onBack }: { onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenter | null>(null)

  // Mock data for work centers
  const workCenters: WorkCenter[] = [
    {
      id: "1",
      name: "Assembly 1",
      code: "WC-001",
      tag: "A1-MAIN",
      alternativeWorkcenters: ["Assembly 2", "Assembly 3"],
      costPerHour: 85.50,
      capacityTimeEfficiency: 92.5,
      oeeTarget: 85.0,
      status: "Active"
    },
    {
      id: "2", 
      name: "Drill 1",
      code: "WC-002",
      tag: "D1-DRILL",
      alternativeWorkcenters: ["Drill 2"],
      costPerHour: 65.00,
      capacityTimeEfficiency: 88.0,
      oeeTarget: 80.0,
      status: "Active"
    },
    {
      id: "3",
      name: "CNC Machine 1",
      code: "WC-003", 
      tag: "CNC-001",
      alternativeWorkcenters: ["CNC Machine 2"],
      costPerHour: 120.00,
      capacityTimeEfficiency: 95.2,
      oeeTarget: 90.0,
      status: "Maintenance"
    },
    {
      id: "4",
      name: "Paint Booth 1",
      code: "WC-004",
      tag: "PB-001",
      alternativeWorkcenters: [],
      costPerHour: 75.00,
      capacityTimeEfficiency: 78.5,
      oeeTarget: 75.0,
      status: "Active"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200"
      case "Inactive": return "bg-gray-100 text-gray-800 border-gray-200"
      case "Maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600 font-medium"
    if (efficiency >= 75) return "text-yellow-600 font-medium"
    return "text-red-600 font-medium"
  }

  const filteredWorkCenters = workCenters.filter(workCenter =>
    workCenter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workCenter.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workCenter.tag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (workCenter: WorkCenter) => {
    setSelectedWorkCenter(workCenter)
    // TODO: Navigate to work center detail view
    console.log("View work center details:", workCenter)
  }

  const handleEdit = (workCenter: WorkCenter) => {
    // TODO: Open edit modal or navigate to edit page
    console.log("Edit work center:", workCenter)
  }

  const handleDelete = (workCenter: WorkCenter) => {
    // TODO: Show confirmation dialog and delete
    console.log("Delete work center:", workCenter)
  }

  if (selectedWorkCenter) {
    // TODO: Render work center detail view
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedWorkCenter(null)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Work Centers
          </Button>
          <h2 className="text-2xl font-bold">Work Center Details</h2>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600">Work center detail view coming soon...</p>
          <pre className="mt-4 text-sm bg-gray-50 p-4 rounded">
            {JSON.stringify(selectedWorkCenter, null, 2)}
          </pre>
        </div>
      </div>
    )
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
          <h2 className="text-2xl font-bold">Work Center List</h2>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Work Center
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search work centers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Work Centers Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Work Center</TableHead>
              <TableHead className="font-semibold text-gray-900">Code</TableHead>
              <TableHead className="font-semibold text-gray-900">Tag</TableHead>
              <TableHead className="font-semibold text-gray-900">Alternative Workcenters</TableHead>
              <TableHead className="font-semibold text-gray-900">Cost per hour</TableHead>
              <TableHead className="font-semibold text-gray-900">Capacity Time Efficiency</TableHead>
              <TableHead className="font-semibold text-gray-900">OEE Target</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkCenters.map((workCenter) => (
              <TableRow key={workCenter.id} className="border-t hover:bg-gray-50">
                <TableCell className="font-medium">{workCenter.name}</TableCell>
                <TableCell>{workCenter.code}</TableCell>
                <TableCell>{workCenter.tag}</TableCell>
                <TableCell>
                  {workCenter.alternativeWorkcenters.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {workCenter.alternativeWorkcenters.map((alt, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">None</span>
                  )}
                </TableCell>
                <TableCell>${workCenter.costPerHour.toFixed(2)}</TableCell>
                <TableCell className={getEfficiencyColor(workCenter.capacityTimeEfficiency)}>
                  {workCenter.capacityTimeEfficiency.toFixed(1)}%
                </TableCell>
                <TableCell className={getEfficiencyColor(workCenter.oeeTarget)}>
                  {workCenter.oeeTarget.toFixed(1)}%
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(workCenter.status)}>
                    {workCenter.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(workCenter)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(workCenter)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workCenter)}
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

      {filteredWorkCenters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No work centers found matching your search.</p>
        </div>
      )}
    </div>
  )
}
