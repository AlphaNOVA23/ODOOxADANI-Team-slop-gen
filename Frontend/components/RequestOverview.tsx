import { useAppStore } from "@/lib/store"
import { useState } from "react"
import { ArrowLeft, Calendar, User, Wrench, AlertTriangle, Clock, CheckCircle, Diamond } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { EquipmentCategories } from "./EquipmentCategories"

export function RequestOverview() {
  const { requests, selectedRequest, setSelectedRequest } = useAppStore()
  const [showEquipmentCategories, setShowEquipmentCategories] = useState(false)
  const [maintenanceFor, setMaintenanceFor] = useState<'equipment' | 'workcenter'>('equipment')
  const [selectedWorkCenter, setSelectedWorkCenter] = useState('')
  
  if (!selectedRequest) return null

  const request = requests.find(r => r.id === selectedRequest.id)
  if (!request) return null

  // Show EquipmentCategories when requested
  if (showEquipmentCategories) {
    return (
      <EquipmentCategories 
        onBack={() => setShowEquipmentCategories(false)}
      />
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200"
      case "High": return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800 border-blue-200"
      case "In Progress": return "bg-purple-100 text-purple-800 border-purple-200"
      case "Repaired": return "bg-green-100 text-green-800 border-green-200"
      case "Scrap": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New": return <Clock className="w-4 h-4" />
      case "In Progress": return <Wrench className="w-4 h-4" />
      case "Repaired": return <CheckCircle className="w-4 h-4" />
      case "Scrap": return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPriorityDiamonds = (priority: string) => {
    switch (priority) {
      case "Critical": return 3
      case "High": return 2
      case "Medium": return 1
      case "Low": return 0
      default: return 0
    }
  }

  const getStageIndex = (status: string) => {
    switch (status) {
      case "New": return 0
      case "In Progress": return 1
      case "Repaired": return 2
      case "Scrap": return 3
      default: return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedRequest(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Maintenance Requests</h2>
            <p className="text-sm text-gray-600">&gt; {request.subject}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Request Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <Input value={request.subject} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <Input value="Mitchell Admin" readOnly className="bg-gray-50" />
              </div>
            </div>
            
            {/* Maintenance For Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance For</label>
              <RadioGroup 
                value={maintenanceFor} 
                onValueChange={(value: 'equipment' | 'workcenter') => setMaintenanceFor(value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equipment" id="equipment" />
                  <Label htmlFor="equipment">Equipment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="workcenter" id="workcenter" />
                  <Label htmlFor="workcenter">Work Center</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Equipment/Work Center Field */}
            <div className="mt-4">
              {maintenanceFor === 'equipment' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                  <div 
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setShowEquipmentCategories(true)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{request.equipment.name}/{request.equipment.serialNumber}</span>
                      <span className="text-xs text-blue-600 hover:text-blue-700">View Equipment Categories →</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Center</label>
                  <Select value={selectedWorkCenter} onValueChange={setSelectedWorkCenter}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Select work center" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wc1">Work Center 1</SelectItem>
                      <SelectItem value="wc2">Work Center 2</SelectItem>
                      <SelectItem value="wc3">Work Center 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Input value={request.equipment.category} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Date</label>
                <Input value={request.createdDate} readOnly className="bg-gray-50" />
              </div>
            </div>

            {/* Maintenance Type */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
              <RadioGroup value={request.type} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Corrective" id="corrective" disabled />
                  <Label htmlFor="corrective">Corrective</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Preventive" id="preventive" disabled />
                  <Label htmlFor="preventive">Preventive</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <Input value={request.assignedTeam.name} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <Input 
                  value={request.assignedTo?.name || "Not assigned"} 
                  readOnly 
                  className="bg-gray-50" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Scheduled Date
                </label>
                <Input value={`${request.scheduledDate} 14:30:00`} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <Input value="00:00 hours" readOnly className="bg-gray-50" />
              </div>
            </div>

            {/* Priority with Diamond Icons */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((level) => (
                  <Diamond 
                    key={level}
                    className={`w-6 h-6 ${
                      level <= getPriorityDiamonds(request.priority)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{request.priority}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <Input value="My Company (San Francisco)" readOnly className="bg-gray-50" />
            </div>
          </div>

          {/* Maintenance Stages */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Stages of Maintenance</h3>
            <div className="flex items-center justify-between">
              {['New Request', 'In Progress', 'Repaired', 'Scrap'].map((stage, index) => (
                <div key={stage} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index <= getStageIndex(request.status)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 text-center">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Notes */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Wrench className="w-4 h-4 mr-2" />
                Start Work
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Reassign
              </Button>
            </div>
          </div>

          {/* Notes and Instructions Tabs */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Notes & Instructions</h3>
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="space-y-4">
                <Textarea 
                  placeholder="Add notes about this maintenance request..."
                  className="min-h-[120px]"
                />
                <Button className="w-full" variant="outline">
                  Add Note
                </Button>
              </TabsContent>
              <TabsContent value="instructions" className="space-y-4">
                <Textarea 
                  placeholder="Add instructions for this maintenance request..."
                  className="min-h-[120px]"
                />
                <Button className="w-full" variant="outline">
                  Add Instruction
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Smart Button */}
          <div className="bg-white rounded-lg border p-6">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Smart button that opens the worksheet comment section
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
