import type { Team } from "../types"
import { useAppStore } from "../store"
import { Users } from "lucide-react"

interface TeamCardProps {
  team: Team
}

function TeamCard({ team }: TeamCardProps) {
  return (
    <div className="bg-secondary border border-border rounded-lg p-6 hover:border-accent transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Users size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{team.name}</h3>
          <p className="text-sm text-muted-foreground">{team.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground mb-3">Team Members ({team.members.length})</p>
        {team.members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors">
            <span className="text-lg">{member.avatar}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
            <span className="text-xs text-muted-foreground">{member.phone}</span>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 bg-primary hover:bg-accent text-primary-foreground px-4 py-2 rounded-lg transition-colors text-sm font-semibold">
        Manage Team
      </button>
    </div>
  )
}

export function TeamsView() {
  const { teams } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Maintenance Teams</h2>
        <p className="text-muted-foreground">Manage teams and technicians responsible for maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  )
}
