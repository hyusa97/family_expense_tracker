"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ContributorCard from "@/components/ContributorCard";
import { supabase } from "@/lib/supabase";
import { calcDashboardMetrics } from "@/lib/calculations";
import { Expense, Contribution, RequiredFund, DashboardMetrics } from "@/types";

export default function ContributorsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [expRes, conRes, rfRes] = await Promise.all([
        supabase.from("expenses").select("*"),
        supabase.from("contributions").select("*"),
        supabase.from("required_fund").select("*"),
      ]);
      const expenses: Expense[] = expRes.data ?? [];
      const allContributions: Contribution[] = conRes.data ?? [];
      const requiredFunds: RequiredFund[] = rfRes.data ?? [];
      setContributions(allContributions);
      setMetrics(calcDashboardMetrics(expenses, allContributions, requiredFunds));
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Contributors</h1>
          <p className="text-sm text-gray-500 mt-1">Individual contribution details and settlement status</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : metrics ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {metrics.contributorStats.map((cs) => (
              <ContributorCard
                key={cs.name}
                stats={cs}
                settlements={metrics.settlements}
                contributions={contributions}
              />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
