import Link from "next/link";

const stats = [
  { label: "Trading Volume", value: "$2.4B+", sub: "Last 30 days" },
  { label: "Active Traders", value: "12,847", sub: "Worldwide" },
  { label: "Win Rate", value: "73.2%", sub: "Avg. bot performance" },
  { label: "Uptime", value: "99.99%", sub: "Infrastructure SLA" },
];

const features = [
  {
    title: "Automated Bots",
    description: "Deploy pre-built or custom strategies that trade 24/7 across multiple exchanges.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Backtesting Engine",
    description: "Test strategies against years of historical data before risking real capital.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
      </svg>
    ),
  },
  {
    title: "Copy Trading",
    description: "Mirror the strategies of top-performing traders and earn while you learn.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Multi-Exchange",
    description: "Connect Binance, Coinbase, and more. Unified interface, one dashboard.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    description: "For paper trading and learning",
    features: ["1 Bot", "Paper Trading Only", "Basic Strategies", "Community Support"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "For serious traders",
    features: ["10 Bots", "Live Trading", "All Strategies", "Backtesting Engine", "Priority Support", "Copy Trading"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    description: "For funds and teams",
    features: ["Unlimited Bots", "Custom Strategies", "Dedicated Server", "API Access", "White-Glove Onboarding", "Custom Integrations"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen -m-6">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FF88]/5 rounded-full blur-[120px] pointer-events-none" />

        <p className="text-[9px] font-black uppercase tracking-widest text-[#00FF88] mb-6">
          Next-Gen Crypto Trading Infrastructure
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter max-w-4xl leading-[0.9]">
          The Future of{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00FF88] to-emerald-400">
            Automated Trading
          </span>
        </h1>

        <p className="mt-8 text-white/50 text-lg max-w-xl leading-relaxed">
          Deploy intelligent trading bots, backtest strategies on historical data,
          and copy top traders — all from one unified platform.
        </p>

        <div className="flex gap-4 mt-10">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] font-bold rounded-full hover:shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all duration-300 text-sm uppercase tracking-wider"
          >
            Start Trading
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 font-bold rounded-full hover:bg-white/10 transition-all duration-300 text-sm uppercase tracking-wider"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-6 py-8 text-center ${i < stats.length - 1 ? "border-r border-white/5" : ""}`}
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
                {stat.label}
              </p>
              <p className="text-2xl md:text-3xl font-black font-mono text-white">
                {stat.value}
              </p>
              <p className="text-xs text-white/30 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#00FF88] mb-4">
            Platform Features
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
            Built for Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:border-[#00FF88]/20 hover:shadow-[0_0_30px_rgba(0,255,136,0.05)] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-[#00FF88] mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tight mb-3">
                {feature.title}
              </h3>
              <p className="text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#00FF88] mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
            Choose Your Edge
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-[#0a0a0a]/80 backdrop-blur-xl border rounded-[2rem] p-8 flex flex-col ${
                plan.highlighted
                  ? "border-[#00FF88]/30 shadow-[0_0_30px_rgba(0,255,136,0.1)]"
                  : "border-white/10"
              }`}
            >
              {plan.highlighted && (
                <p className="text-[9px] font-black uppercase tracking-widest text-[#00FF88] mb-2">
                  Most Popular
                </p>
              )}
              <h3 className="text-xl font-black uppercase italic tracking-tight">
                {plan.name}
              </h3>
              <p className="text-white/40 text-sm mt-1">{plan.description}</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-black font-mono">{plan.price}</span>
                <span className="text-white/30 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="text-[#00FF88] text-xs">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 block text-center py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] hover:shadow-[0_0_30px_rgba(0,255,136,0.2)]"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/5 px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">
          Ready to Automate Your Trading?
        </h2>
        <p className="text-white/40 max-w-md mx-auto mb-8">
          Join thousands of traders already using our platform to generate consistent returns.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] font-bold rounded-full hover:shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all duration-300 text-sm uppercase tracking-wider"
        >
          Get Started for Free
        </Link>
      </section>
    </div>
  );
}
