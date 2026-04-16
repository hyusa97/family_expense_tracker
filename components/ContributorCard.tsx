import { ContributorStats, Settlement } from "@/types";
import { formatCurrency, getContributorSettlement } from "@/lib/calculations";
import { Contribution } from "@/types";

const COLORS = ["#818cf8", "#34d399", "#fb923c", "#f472b6"];
const CONTRIBUTOR_COLORS = {
  "Ajay Kumar": { index: 0, bg: "bg-indigo-500/10", border: "border-indigo-500/25", text: "text-indigo-400", ring: "ring-indigo-500/30" },
  "Ranjay Kumar": { index: 1, bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  "Pawan Kumar": { index: 2, bg: "bg-orange-500/10", border: "border-orange-500/25", text: "text-orange-400", ring: "ring-orange-500/30" },
  "Rishi Kumar": { index: 3, bg: "bg-pink-500/10", border: "border-pink-500/25", text: "text-pink-400", ring: "ring-pink-500/30" },
};

interface ContributorCardProps {
  stats: ContributorStats;
  settlements: Settlement[];
  contributions: Contribution[];
}

export default function ContributorCard({
  stats,
  settlements,
  contributions,
}: ContributorCardProps) {
  const settlement = getContributorSettlement(stats.name, settlements);
  const myContributions = contributions
    .filter((c) => c.partner_name === stats.name)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const colorConfig = CONTRIBUTOR_COLORS[stats.name as keyof typeof CONTRIBUTOR_COLORS] ?? CONTRIBUTOR_COLORS["Ajay Kumar"];

  const settlementBorderClass =
    settlement.type === "paying"
      ? "border-red-500/30"
      : settlement.type === "receiving"
      ? "border-emerald-500/30"
      : "border-blue-500/20";

  const initials = stats.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const progressPct = stats.share > 0 ? Math.min(100, (stats.contributed / stats.share) * 100) : 0;

  return (
    <div className={`rounded-2xl border ${settlementBorderClass} bg-gray-900/60 overflow-hidden transition-all hover:scale-[1.005]`}>
      {/* Header */}
      <div className={`${colorConfig.bg} border-b ${colorConfig.border} p-5`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${colorConfig.bg} border ${colorConfig.border} ring-2 ${colorConfig.ring} flex items-center justify-center text-sm font-bold ${colorConfig.text}`}>
            {initials}
          </div>
          <div>
            <div className="font-semibold text-white">{stats.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              {settlement.type === "paying" ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium">
                  देना है
                </span>
              ) : settlement.type === "receiving" ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                  लेना है
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium">
                  ✓ Settled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Detail */}
      {settlement.type !== "settled" && (
        <div className="px-5 pt-4">
          <div className={`rounded-xl p-3.5 border ${
            settlement.type === "paying"
              ? "bg-red-500/8 border-red-500/15"
              : "bg-emerald-500/8 border-emerald-500/15"
          }`}>
            <div className="text-lg font-bold font-mono-jet text-white">
              {formatCurrency(settlement.amount)}
            </div>
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              {settlement.counterparts.map((cp, idx) => (
                <div key={idx}>
                  {settlement.type === "paying" ? "Pay to" : "Receive from"}{" "}
                  <span className={`font-medium ${settlement.type === "paying" ? "text-red-300" : "text-emerald-300"}`}>
                    {cp.name}
                  </span>
                  <span className="text-gray-400 ml-1">({formatCurrency(cp.amount)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-sm font-bold font-mono-jet text-white">{formatCurrency(stats.contributed)}</div>
          <div className="text-xs text-gray-600 mt-0.5">Contributed</div>
        </div>
        <div className="text-center border-x border-white/[0.06]">
          <div className="text-sm font-bold font-mono-jet text-white">{formatCurrency(stats.share)}</div>
          <div className="text-xs text-gray-600 mt-0.5">Share</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-bold font-mono-jet ${stats.remaining > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {formatCurrency(stats.remaining)}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">Remaining</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? "bg-emerald-400" : colorConfig.text.replace("text-", "bg-")}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-1">{progressPct.toFixed(0)}% of share paid</div>
      </div>

      {/* Ledger */}
      <div className="border-t border-white/[0.04] px-5 py-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contributions</div>
        {myContributions.length === 0 ? (
          <div className="text-xs text-gray-600 py-2 text-center">No contributions yet</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {myContributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                <div>
                  <div className="text-xs text-gray-400">{new Date(c.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                  <div className="text-xs text-gray-600">To: {c.given_to}</div>
                </div>
                <div className="text-xs font-mono-jet font-medium text-white">{formatCurrency(c.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
