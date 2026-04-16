"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CONTRIBUTORS } from "@/types";
import { FUND_MANAGER } from "@/types";

interface AddEntryFormProps {
  isLoggedIn: boolean;
  onSuccess: () => void;
}

type Tab = "expense" | "contribution" | "fund";

export default function AddEntryForm({ isLoggedIn, onSuccess }: AddEntryFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>("expense");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Expense form
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expAmount, setExpAmount] = useState("");
  const [expNote, setExpNote] = useState("");

  // Contribution form
  const [conDate, setConDate] = useState(new Date().toISOString().split("T")[0]);
  const [conAmount, setConAmount] = useState("");
  const [conPartner, setConPartner] = useState<string>(CONTRIBUTORS[0]);
  const [conGivenTo, setConGivenTo] = useState(FUND_MANAGER);
  const [conNote, setConNote] = useState("");

  // Required Fund form
  const [rfDate, setRfDate] = useState(new Date().toISOString().split("T")[0]);
  const [rfAmount, setRfAmount] = useState("");
  const [rfNote, setRfNote] = useState("");

  const showFeedback = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const handleSubmitExpense = async () => {
    if (!expAmount || !expDate) return showFeedback("Fill all fields", true);
    setLoading(true);
    const { error: err } = await supabase.from("expenses").insert({
      date: expDate,
      amount: parseFloat(expAmount),
      note: expNote,
    });
    setLoading(false);
    if (err) return showFeedback(err.message, true);
    setExpAmount(""); setExpNote("");
    showFeedback("Expense added!");
    onSuccess();
  };

  const handleSubmitContribution = async () => {
    if (!conAmount || !conDate || !conPartner) return showFeedback("Fill all fields", true);
    setLoading(true);
    const { error: err } = await supabase.from("contributions").insert({
      date: conDate,
      amount: parseFloat(conAmount),
      partner_name: conPartner,
      given_to: conGivenTo || FUND_MANAGER,
      note: conNote,
    });
    setLoading(false);
    if (err) return showFeedback(err.message, true);
    setConAmount(""); setConNote("");
    showFeedback("Contribution added!");
    onSuccess();
  };

  const handleSubmitFund = async () => {
    if (!rfAmount || !rfDate) return showFeedback("Fill all fields", true);
    setLoading(true);
    const { error: err } = await supabase.from("required_fund").insert({
      date: rfDate,
      amount: parseFloat(rfAmount),
      note: rfNote,
    });
    setLoading(false);
    if (err) return showFeedback(err.message, true);
    setRfAmount(""); setRfNote("");
    showFeedback("Required fund added!");
    onSuccess();
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all";
  const labelClass = "text-xs font-medium text-gray-400 mb-1.5 block";

  const tabs: { id: Tab; label: string }[] = [
    { id: "expense", label: "Expense" },
    { id: "contribution", label: "Contribution" },
    { id: "fund", label: "Req. Fund" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="glass rounded-2xl border border-white/[0.06] p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="4" y="9" width="12" height="9" rx="2" stroke="#4b5563" strokeWidth="1.5"/>
            <path d="M7 9V6a3 3 0 016 0v3" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm text-gray-500 mb-1">Login required</p>
        <p className="text-xs text-gray-600">Please login to add entries</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-semibold tracking-wide transition-all ${
              activeTab === tab.id
                ? "text-indigo-300 border-b-2 border-indigo-500 bg-indigo-500/5"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-3">
        {/* Expense Tab */}
        {activeTab === "expense" && (
          <>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount (₹)</label>
              <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reason</label>
              <input type="text" value={expNote} onChange={(e) => setExpNote(e.target.value)} placeholder="What was this for?" className={inputClass} />
            </div>
            <button
              onClick={handleSubmitExpense}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 transition-all disabled:opacity-50 mt-1"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </>
        )}

        {/* Contribution Tab */}
        {activeTab === "contribution" && (
          <>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={conDate} onChange={(e) => setConDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount (₹)</label>
              <input type="number" value={conAmount} onChange={(e) => setConAmount(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contributor</label>
              <select value={conPartner} onChange={(e) => setConPartner(e.target.value)} className={inputClass}>
                {CONTRIBUTORS.map((c) => (
                  <option key={c} value={c} className="bg-gray-900">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Given To</label>
              <input type="text" value={conGivenTo} onChange={(e) => setConGivenTo(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Note</label>
              <input type="text" value={conNote} onChange={(e) => setConNote(e.target.value)} placeholder="Optional note" className={inputClass} />
            </div>
            <button
              onClick={handleSubmitContribution}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all disabled:opacity-50 mt-1"
            >
              {loading ? "Adding..." : "Add Contribution"}
            </button>
          </>
        )}

        {/* Required Fund Tab */}
        {activeTab === "fund" && (
          <>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={rfDate} onChange={(e) => setRfDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount (₹)</label>
              <input type="number" value={rfAmount} onChange={(e) => setRfAmount(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reason</label>
              <input type="text" value={rfNote} onChange={(e) => setRfNote(e.target.value)} placeholder="What is this fund for?" className={inputClass} />
            </div>
            <button
              onClick={handleSubmitFund}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25 transition-all disabled:opacity-50 mt-1"
            >
              {loading ? "Adding..." : "Add Required Fund"}
            </button>
          </>
        )}

        {success && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            ✗ {error}
          </div>
        )}
      </div>
    </div>
  );
}
