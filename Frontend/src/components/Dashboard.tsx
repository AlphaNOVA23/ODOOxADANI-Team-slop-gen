import { useAppStore } from "../store"
import { AlertTriangle, Clock, CheckCircle2, Zap } from "lucide-react"

export function Dashboard() {
  const { requests, equipment, teams } = useAppStore()

  const stats = {
    totalRequests: requests.length,
    activeRequests: requests.filter((r) => r.status === "In Progress").length,
    overdue: requests.filter((r) => r.isOverdue).length,
    completedThisMonth: requests.filter((r) => r.status === "Repaired").length,
    equipment: equipment.length,
    teams: teams.length,
  }

  const recentRequests = requests.slice(-5).reverse()
  const criticalRequests = requests.filter((r) => r.priority === "Critical").slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to GearGuard Maintenance Management System</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-xs mb-1">Total Requests</p>
          <p className="text-2xl font-bold">{stats.totalRequests}</p>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Active</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.activeRequests}</p>
            </div>
            <Clock size={20} className="text-yellow-400 opacity-20" />
          </div>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Overdue</p>
              <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
            </div>
            <AlertTriangle size={20} className="text-destructive opacity-20" />
          </div>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.completedThisMonth}</p>
            </div>
            <CheckCircle2 size={20} className="text-green-400 opacity-20" />
          </div>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-xs mb-1">Equipment</p>
          <p className="text-2xl font-bold">{stats.equipment}</p>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-xs mb-1">Teams</p>
          <p className="text-2xl font-bold">{stats.teams}</p>
        </div>
      </div>

      {/* Recent and Critical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-secondary border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Requests</h3>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No requests yet</p>
            ) : (
              recentRequests.map((req) => (
                <div key={req.id} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{req.subject}</p>
                      <p className="text-xs text-muted-foreground">{req.equipment.name}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary/20 rounded">{req.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-secondary border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Zap size={20} className="text-destructive" />
            Critical Alerts
          </h3>
          <div className="space-y-3">
            {criticalRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No critical requests</p>
            ) : (
              criticalRequests.map((req) => (
                <div key={req.id} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-destructive">{req.subject}</p>
                      <p className="text-xs text-muted-foreground">{req.equipment.name}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded">Critical</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
