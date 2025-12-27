import { useAppStore } from "@/lib/store"
import { BarChart3, TrendingUp } from "lucide-react"

export function ReportsView() {
  const { requests, equipment, teams } = useAppStore()

  const requestsByTeam = teams.map((team) => ({
    name: team.name,
    count: requests.filter((r) => r.assignedTeam.id === team.id).length,
  }))

  const requestsByCategory = equipment.reduce(
    (acc, eq) => {
      const existing = acc.find((i) => i.category === eq.category)
      if (existing) {
        existing.count += requests.filter((r) => r.equipment.id === eq.id).length
      } else {
        acc.push({
          category: eq.category,
          count: requests.filter((r) => r.equipment.id === eq.id).length,
        })
      }
      return acc
    },
    [] as { category: string; count: number }[],
  )

  const statusCounts = {
    new: requests.filter((r) => r.status === "New").length,
    inProgress: requests.filter((r) => r.status === "In Progress").length,
    repaired: requests.filter((r) => r.status === "Repaired").length,
    scrap: requests.filter((r) => r.status === "Scrap").length,
  }

  const overdueCounts = requests.filter((r) => r.isOverdue).length
  const criticalPriority = requests.filter((r) => r.priority === "Critical").length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">View maintenance metrics and team performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Total Requests</p>
          <p className="text-3xl font-bold">{requests.length}</p>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Active Requests</p>
          <p className="text-3xl font-bold text-yellow-400">{statusCounts.new + statusCounts.inProgress}</p>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Overdue Tasks</p>
          <p className="text-3xl font-bold text-destructive">{overdueCounts}</p>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Critical Priority</p>
          <p className="text-3xl font-bold text-red-400">{criticalPriority}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-secondary border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Requests by Status
          </h3>
          <div className="space-y-3">
            {[
              { label: "New", count: statusCounts.new, color: "bg-blue-600" },
              { label: "In Progress", count: statusCounts.inProgress, color: "bg-yellow-600" },
              { label: "Repaired", count: statusCounts.repaired, color: "bg-green-600" },
              { label: "Scrap", count: statusCounts.scrap, color: "bg-red-600" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.count / requests.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Requests by Team
          </h3>
          <div className="space-y-3">
            {requestsByTeam.map((team) => (
              <div key={team.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold">{team.name}</span>
                  <span className="text-sm text-muted-foreground">{team.count}</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max((team.count / Math.max(...requestsByTeam.map((t) => t.count))) * 100, 5)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-secondary border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Maintenance by Equipment Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requestsByCategory.map((cat) => (
            <div key={cat.category} className="p-4 border border-border rounded-lg">
              <p className="font-semibold">{cat.category}</p>
              <p className="text-2xl font-bold text-primary mt-2">{cat.count}</p>
              <p className="text-xs text-muted-foreground mt-1">active requests</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
