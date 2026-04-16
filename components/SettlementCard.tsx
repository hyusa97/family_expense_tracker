import { formatCurrency } from "@/lib/calculations";

interface SettlementCardProps {
  name: string;
  type: "paying" | "receiving" | "settled";
  amount: number;
  counterparts: { name: string; amount: number }[];
}

export default function SettlementCard({
  name,
  type,
  amount,
  counterparts,
}: SettlementCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const config = {
    paying: {
      label: "देना है",
      sublabel: "Payable",
      bg: "bg-red-500/8",
      border: "border-red-500/20",
      pillBg: "bg-red-500/15",
      pillText: "text-red-400",
      pillBorder: "border-red-500/20",
      avatarBg: "bg-red-500/15",
      avatarText: "text-red-400",
      arrow: "→",
    },
    receiving: {
      label: "लेना है",
      sublabel: "Receivable",
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/20",
      pillBg: "bg-emerald-500/15",
      pillText: "text-emerald-400",
      pillBorder: "border-emerald-500/20",
      avatarBg: "bg-emerald-500/15",
      avatarText: "text-emerald-400",
      arrow: "←",
    },
    settled: {
      label: "Fully Settled",
      sublabel: "No dues",
      bg: "bg-white/[0.02]",
      border: "border-white/[0.06]",
      pillBg: "bg-blue-500/15",
      pillText: "text-blue-400",
      pillBorder: "border-blue-500/20",
      avatarBg: "bg-blue-500/15",
      avatarText: "text-blue-400",
      arrow: "✓",
    },
  };

  const c = config[type];

  return (
    <div className={`rounded-xl p-4 border ${c.bg} ${c.border} transition-all hover:scale-[1.01]`}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-xl ${c.avatarBg} border ${c.pillBorder} flex items-center justify-center text-xs font-bold ${c.avatarText}`}
        >
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">{name}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${c.pillBg} ${c.pillText} border ${c.pillBorder} font-medium`}>
            {c.label}
          </span>
        </div>
      </div>

      {type !== "settled" ? (
        <div className="mt-2">
          <div className="text-lg font-bold font-mono-jet text-white">
            {formatCurrency(amount)}
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
            {counterparts.map((cp, idx) => (
              <div key={idx}>
                {type === "paying" ? "To" : "From"}{" "}
                <span className="text-gray-300 font-medium">{cp.name}</span>
                <span className="text-gray-400 ml-1">({formatCurrency(cp.amount)})</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">All dues cleared</div>
      )}
    </div>
  );
}
