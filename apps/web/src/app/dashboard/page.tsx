export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-[#00FF88] mb-1">
          Overview
        </p>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">
          Dashboard
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value="$48,293.12"
          change="+12.4%"
          positive
        />
        <StatCard label="Active Bots" value="3" icon="bot" />
        <StatCard label="Open Positions" value="7" icon="layers" />
        <StatCard
          label="Today's PnL"
          value="+$1,847.23"
          change="+3.8%"
          positive
        />
      </div>

      {/* Chart + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candlestick Chart Area */}
        <div className="lg:col-span-2 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">
                BTC/USDT
              </p>
              <p className="text-2xl font-black font-mono">$67,842.50</p>
            </div>
            <div className="flex gap-2">
              {["1H", "4H", "1D", "1W"].map((tf) => (
                <button
                  key={tf}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${
                    tf === "4H"
                      ? "bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88]"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Placeholder candlestick chart */}
          <div className="h-[300px] border border-white/5 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {/* Fake candles */}
              <div className="flex items-end justify-around h-full px-4 pb-4 pt-8 gap-1">
                {[65, 40, 55, 70, 45, 80, 60, 75, 50, 85, 55, 70, 90, 60, 75, 65, 80, 70, 85, 95, 75, 88, 70, 82].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${i % 3 === 0 ? "bg-[#ff3e3e]" : "bg-[#00FF88]"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-white/20 text-sm font-mono z-10">
              Candlestick Chart
            </p>
            <p className="text-white/10 text-xs mt-1 z-10">
              Connect an exchange to view live data
            </p>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">
            Recent Trades
          </p>
          <div className="space-y-3">
            {[
              { pair: "BTC/USDT", side: "BUY", pnl: "+$234.50", win: true },
              { pair: "ETH/USDT", side: "SELL", pnl: "-$45.20", win: false },
              { pair: "SOL/USDT", side: "BUY", pnl: "+$128.90", win: true },
              { pair: "DOGE/USDT", side: "BUY", pnl: "+$67.30", win: true },
              { pair: "BNB/USDT", side: "SELL", pnl: "-$12.80", win: false },
            ].map((trade, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm font-bold font-mono">{trade.pair}</p>
                  <p
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      trade.side === "BUY" ? "text-[#00FF88]" : "text-[#ff3e3e]"
                    }`}
                  >
                    {trade.side}
                  </p>
                </div>
                <p
                  className={`text-sm font-mono font-bold ${
                    trade.win ? "text-[#ffd700]" : "text-[#ff3e3e]"
                  }`}
                >
                  {trade.pnl}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Bots */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">
          Active Bots
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Grid Bot #1", pair: "BTC/USDT", profit: "+18.4%", status: "Running" },
            { name: "DCA Bot", pair: "ETH/USDT", profit: "+7.2%", status: "Running" },
            { name: "Momentum Alpha", pair: "SOL/USDT", profit: "+24.1%", status: "Running" },
          ].map((bot, i) => (
            <div
              key={i}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-[#00FF88]/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm">{bot.name}</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded-full">
                  {bot.status}
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">
                {bot.pair}
              </p>
              <p className="text-xl font-black font-mono text-[#ffd700]">
                {bot.profit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  positive,
  icon,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: string;
}) {
  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:border-[#00FF88]/20 hover:shadow-[0_0_30px_rgba(0,255,136,0.05)] transition-all duration-500">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
        {label}
      </p>
      <p className="text-2xl font-black font-mono">{value}</p>
      {change && (
        <p
          className={`text-sm font-mono font-bold mt-1 ${
            positive ? "text-[#ffd700]" : "text-[#ff3e3e]"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}
