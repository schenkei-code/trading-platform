import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-gradient">Trading Platform</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Automated crypto trading with bots, strategies, backtesting, and copy trading.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
