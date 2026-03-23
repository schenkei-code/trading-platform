export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your trading activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value="$0.00" change="+0.00%" />
        <StatCard label="Active Bots" value="0" />
        <StatCard label="Open Positions" value="0" />
        <StatCard label="Today's PnL" value="$0.00" change="+0.00%" />
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6 min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Equity Curve</h2>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Chart placeholder
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No trades yet
          </div>
        </div>
      </div>

      {/* Active Bots */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Active Bots</h2>
        <div className="flex items-center justify-center h-[150px] text-muted-foreground">
          No active bots. Create one to get started.
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change?: string;
}) {
  const isPositive = change?.startsWith("+");
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1 font-mono">{value}</p>
      {change && (
        <p className={`text-sm mt-1 ${isPositive ? "text-long" : "text-short"}`}>
          {change}
        </p>
      )}
    </div>
  );
}
