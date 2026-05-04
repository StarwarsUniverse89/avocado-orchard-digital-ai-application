import Link from "next/link";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import AIAdvisorPanel from "@/components/AIAdvisorPanel";
import OrchardMap from "@/components/OrchardMap";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live System Active
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-50 mb-6 animate-fade-in">
              Avocado Orchard
              <br />
              <span className="gradient-text">Digital Twin Platform</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl animate-fade-in">
              High-performance AI agent system for real-time orchard analysis,
              simulation, and decision-making. Powered by AMD MI300X GPU
              infrastructure.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in">
              <Link href="/command-center">
                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-gray-950 font-semibold hover:opacity-90 transition-opacity glow-primary">
                  Launch Command Center
                </button>
              </Link>
              <button className="px-6 py-3 rounded-lg glass text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-12">
        {/* Key Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-50 mb-6">
            Orchard Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Average Yield"
              value="130"
              unit="kg/tree"
              change={8.5}
              trend="up"
              icon="🥑"
              status="success"
            />
            <MetricCard
              title="Soil Moisture"
              value="65"
              unit="%"
              change={-5.2}
              trend="down"
              icon="💧"
              status="warning"
            />
            <MetricCard
              title="Temperature"
              value="24.5"
              unit="°C"
              change={2.1}
              trend="up"
              icon="🌡️"
              status="info"
            />
            <MetricCard
              title="Tree Health"
              value="92"
              unit="%"
              change={3.4}
              trend="up"
              icon="🌳"
              status="success"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Orchard Map - Takes 2 columns */}
          <div className="lg:col-span-2">
            <OrchardMap />
          </div>

          {/* AI Advisor - Takes 1 column */}
          <div className="lg:col-span-1">
            <AIAdvisorPanel />
          </div>
        </div>

        {/* Predictive Insights Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-50 mb-6">
            Predictive Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-elevated rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center text-2xl">
                  📈
                </div>
                <div>
                  <h3 className="font-semibold text-gray-50">
                    Yield Forecast
                  </h3>
                  <p className="text-sm text-gray-400">Next 90 days</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-50 mb-2">
                19,500 kg
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Expected harvest based on current conditions and historical
                patterns
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success font-medium">↑ 12%</span>
                <span className="text-gray-500">vs last season</span>
              </div>
            </div>

            <div className="glass-elevated rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <h3 className="font-semibold text-gray-50">
                    Revenue Projection
                  </h3>
                  <p className="text-sm text-gray-400">Market analysis</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-50 mb-2">
                $54,600
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Estimated revenue at current market price of $2.80/kg
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary font-medium">Market: Strong</span>
              </div>
            </div>

            <div className="glass-elevated rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-semibold text-gray-50">Risk Analysis</h3>
                  <p className="text-sm text-gray-400">Threat assessment</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-50 mb-2">
                Medium
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Pest activity detected in 2 zones. Moisture levels below
                optimal in Zone B
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-warning font-medium">
                  2 Active Alerts
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section>
          <h2 className="text-2xl font-bold text-gray-50 mb-6">
            System Status
          </h2>
          <div className="glass-elevated rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-gray-300 mb-1">
                  GPU Compute
                </div>
                <div className="text-xs text-success">Active</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-gray-300 mb-1">
                  AI Models
                </div>
                <div className="text-xs text-success">Online</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-gray-300 mb-1">
                  Data Stream
                </div>
                <div className="text-xs text-success">Connected</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="text-primary font-mono text-sm">96</div>
                </div>
                <div className="text-sm font-medium text-gray-300 mb-1">
                  Trees Monitored
                </div>
                <div className="text-xs text-gray-400">Real-time</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              © 2026 Avocado Orchard Digital AI. Powered by AMD MI300X GPU
              Infrastructure.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                API Reference
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
