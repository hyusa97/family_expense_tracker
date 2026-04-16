"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import KPICard from "@/components/KPICard";
import SettlementCard from "@/components/SettlementCard";
import ContributionChart from "@/components/ContributionChart";
import { supabase } from "@/lib/supabase";
import { calcDashboardMetrics, formatCurrency, getContributorSettlement } from "@/lib/calculations";
import { Expense, Contribution, RequiredFund, DashboardMetrics, CONTRIBUTORS } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("[v0] Fetching data from Supabase...");
      const [expRes, conRes, rfRes] = await Promise.all([
        supabase.from("expenses").select("*"),
        supabase.from("contributions").select("*"),
        supabase.from("required_fund").select("*"),
      ]);
      console.log("[v0] Expenses response:", expRes);
      console.log("[v0] Contributions response:", conRes);
      console.log("[v0] Required fund response:", rfRes);
      
      if (expRes.error) console.error("[v0] Expenses error:", expRes.error);
      if (conRes.error) console.error("[v0] Contributions error:", conRes.error);
      if (rfRes.error) console.error("[v0] Required fund error:", rfRes.error);
      
      const expenses: Expense[] = expRes.data ?? [];
      const contributions: Contribution[] = conRes.data ?? [];
      const requiredFunds: RequiredFund[] = rfRes.data ?? [];
      setMetrics(calcDashboardMetrics(expenses, contributions, requiredFunds));
    } catch (error) {
      console.error("[v0] Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const kpiData = metrics
    ? [
        {
          label: "Actual Required Fund",
          value: formatCurrency(metrics.actualRequiredFund),
          trend: (metrics.actualRequiredFund > 0 ? "negative" : "positive") as "positive" | "negative",
          highlight: true,
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M5 5h4.5a2 2 0 010 4H5" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        },
        {
          label: "Total Contribution",
          value: formatCurrency(metrics.totalContribution),
          trend: "positive" as const,
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        },
        {
          label: "Total Expense",
          value: formatCurrency(metrics.totalExpense),
          trend: "negative" as const,
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 5h12M4 2h8M5 9h6M6 12h4" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          label: "Treasury Balance",
          value: formatCurrency(metrics.treasuryBalance),
          trend: (metrics.treasuryBalance >= 0 ? "positive" : "negative") as "positive" | "negative",
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="#fbbf24" strokeWidth="1.4"/>
              <path d="M5 5V4a3 3 0 016 0v1" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          label: "Per Contributor Share",
          value: formatCurrency(metrics.perContributorShare),
          trend: "neutral" as const,
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="5" r="2" stroke="#a78bfa" strokeWidth="1.4"/>
              <circle cx="10" cy="5" r="2" stroke="#a78bfa" strokeWidth="1.4"/>
              <path d="M2 13c0-2.21 1.79-4 4-4M10 9c2.21 0 4 1.79 4 4" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          ),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Family expense tracking & settlement overview</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : metrics ? (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {kpiData.map((kpi, i) => (
                <KPICard
                  key={i}
                  label={kpi.label}
                  value={kpi.value}
                  icon={kpi.icon}
                  trend={kpi.trend}
                  highlight={kpi.highlight}
                />
              ))}
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Settlement Summary */}
              <div className="lg:col-span-2">
                <div className="glass rounded-2xl border border-white/[0.06] p-5">
                  <h2 className="text-sm font-semibold text-gray-300 mb-4">Settlement Summary</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {CONTRIBUTORS.map((name) => {
                      const s = getContributorSettlement(name, metrics.settlements);
                      return (
                        <SettlementCard
                          key={name}
                          name={name}
                          type={s.type}
                          amount={s.amount}
                          counterpart={s.counterpart}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Contributor Quick-View */}
                <div className="glass rounded-2xl border border-white/[0.06] p-5 mt-4">
                  <h2 className="text-sm font-semibold text-gray-300 mb-4">Contributor Overview</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/[0.05]">
                          <th className="text-left pb-3 font-medium">Contributor</th>
                          <th className="text-right pb-3 font-medium">Contributed</th>
                          <th className="text-right pb-3 font-medium">Share</th>
                          <th className="text-right pb-3 font-medium">Remaining</th>
                          <th className="text-right pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {metrics.contributorStats.map((cs) => {
                          const s = getContributorSettlement(cs.name, metrics.settlements);
                          return (
                            <tr key={cs.name} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 font-medium text-gray-300">{cs.name}</td>
                              <td className="py-3 text-right font-mono-jet text-emerald-400">{formatCurrency(cs.contributed)}</td>
                              <td className="py-3 text-right font-mono-jet text-gray-400">{formatCurrency(cs.share)}</td>
                              <td className="py-3 text-right font-mono-jet text-red-400">{formatCurrency(cs.remaining)}</td>
                              <td className="py-3 text-right">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  s.type === "paying"
                                    ? "bg-red-500/15 text-red-400 border border-red-500/20"
                                    : s.type === "receiving"
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                    : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                                }`}>
                                  {s.type === "paying" ? "देना है" : s.type === "receiving" ? "लेना है" : "✓ Settled"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div>
                <ContributionChart stats={metrics.contributorStats} />

                {/* Fund Manager Card */}
                <div className="glass rounded-2xl border border-white/[0.06] p-5 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-xs font-bold text-amber-400">
                      LR
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Lalbihari Ram</div>
                      <div className="text-xs text-amber-400 font-medium">Fund Manager</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Total Managed</span>
                      <span className="text-xs font-mono-jet font-medium text-white">{formatCurrency(metrics.totalExpense)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Fund Collected</span>
                      <span className="text-xs font-mono-jet font-medium text-emerald-400">{formatCurrency(metrics.totalContribution)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Still Required</span>
                      <span className={`text-xs font-mono-jet font-medium ${metrics.actualRequiredFund > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {formatCurrency(Math.abs(metrics.actualRequiredFund))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
