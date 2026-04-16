"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import AddEntryForm from "@/components/AddEntryForm";
import { supabase } from "@/lib/supabase";
import { calcTotalExpense, formatCurrency } from "@/lib/calculations";
import { isLoggedIn } from "@/lib/auth";
import { Expense } from "@/types";

const PAGE_SIZE = 10;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState(0);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setExpenses(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    fetchExpenses();
  }, [fetchExpenses]);

  const total = calcTotalExpense(expenses);
  const paginated = expenses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(expenses.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">All family expense records</p>
        </div>

        {/* Total Banner */}
        <div className="glass rounded-2xl border border-red-500/20 p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Expenses</div>
            <div className="text-3xl font-bold font-mono-jet text-red-400">{formatCurrency(total)}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6h14M5 3h10M6 11h8M7 14h6" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-300">Expense Records</span>
                <span className="text-xs text-gray-600">{expenses.length} entries</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/[0.05]">
                          <th className="text-left px-5 py-3 font-medium">Date</th>
                          <th className="text-right px-5 py-3 font-medium">Amount</th>
                          <th className="text-left px-5 py-3 font-medium">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {paginated.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-5 py-12 text-center text-gray-600 text-sm">
                              No expenses yet
                            </td>
                          </tr>
                        ) : (
                          paginated.map((e) => (
                            <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3.5 text-gray-400 font-mono-jet text-xs">
                                {new Date(e.date).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-5 py-3.5 text-right font-mono-jet font-medium text-red-400">
                                {formatCurrency(e.amount)}
                              </td>
                              <td className="px-5 py-3.5 text-gray-400 truncate max-w-[200px]">
                                {e.note || <span className="text-gray-700 italic">—</span>}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        Page {page + 1} of {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={page === 0}
                          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition-all"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={page === totalPages - 1}
                          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition-all"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="mb-2 text-xs text-gray-500 uppercase tracking-wider font-medium px-1">
              {loggedIn ? "Add Entry" : "Locked"}
            </div>
            <AddEntryForm isLoggedIn={loggedIn} onSuccess={fetchExpenses} />
          </div>
        </div>
      </main>
    </div>
  );
}
