import {
  Expense,
  Contribution,
  RequiredFund,
  ContributorName,
  ContributorStats,
  Settlement,
  DashboardMetrics,
  CONTRIBUTORS,
  FUND_MANAGER,
} from "@/types";

export function calcTotalExpense(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

export function calcTotalContribution(contributions: Contribution[]): number {
  return contributions.reduce((sum, c) => sum + Number(c.amount), 0);
}

export function calcTotalRequiredFund(requiredFunds: RequiredFund[]): number {
  return requiredFunds.reduce((sum, r) => sum + Number(r.amount), 0);
}

export const DEFAULT_SHARE_PERSONS = 4;

export function calcPerContributorShare(
  totalContribution: number,
  sharePersons: number = DEFAULT_SHARE_PERSONS
): number {
  return totalContribution / sharePersons;
}

export function calcActualRequiredFund(
  totalRequiredFund: number,
  totalContribution: number
): number {
  return totalRequiredFund - totalContribution;
}

export function calcTreasuryBalance(
  totalContribution: number,
  totalExpense: number
): number {
  return totalContribution - totalExpense;
}

export function calcContributorStats(
  contributions: Contribution[],
  requiredFund: number
): ContributorStats[] {
  // Each person's required share of the fund
  const perPersonShare = requiredFund / DEFAULT_SHARE_PERSONS;
  
  return CONTRIBUTORS.map((name) => {
    // Get contributions made BY this person (given_to indicates who they gave money for)
    const contributed = contributions
      .filter((c) => c.partner_name === name)
      .reduce((sum, c) => sum + Number(c.amount), 0);
    const remaining = Math.max(0, perPersonShare - contributed);
    const balance = contributed - perPersonShare;
    return { name, contributed, share: perPersonShare, remaining, balance };
  });
}

export function calcSettlements(
  contributorStats: ContributorStats[],
  actualRequiredFund: number
): Settlement[] {
  const settlements: Settlement[] = [];

  if (actualRequiredFund > 0) {
    // Underpaid contributors pay Lalbihari Ram
    contributorStats.forEach((cs) => {
      if (cs.balance < 0) {
        settlements.push({
          from: cs.name,
          to: FUND_MANAGER,
          amount: Math.abs(cs.balance),
        });
      }
    });
  } else {
    // Contributor-to-contributor settlement
    const underpaid = contributorStats
      .filter((cs) => cs.balance < 0)
      .map((cs) => ({ name: cs.name, amount: Math.abs(cs.balance) }));
    const overpaid = contributorStats
      .filter((cs) => cs.balance > 0)
      .map((cs) => ({ name: cs.name, amount: cs.balance }));

    let i = 0;
    let j = 0;
    while (i < underpaid.length && j < overpaid.length) {
      const transfer = Math.min(underpaid[i].amount, overpaid[j].amount);
      if (transfer > 0.01) {
        settlements.push({
          from: underpaid[i].name,
          to: overpaid[j].name,
          amount: transfer,
        });
      }
      underpaid[i].amount -= transfer;
      overpaid[j].amount -= transfer;
      if (underpaid[i].amount < 0.01) i++;
      if (overpaid[j].amount < 0.01) j++;
    }
  }

  return settlements;
}

export function calcDashboardMetrics(
  expenses: Expense[],
  contributions: Contribution[],
  requiredFunds: RequiredFund[]
): DashboardMetrics {
  const totalExpense = calcTotalExpense(expenses);
  const totalContribution = calcTotalContribution(contributions);
  const totalRequiredFund = calcTotalRequiredFund(requiredFunds);
  const perContributorShare = calcPerContributorShare(totalContribution);
  const actualRequiredFund = calcActualRequiredFund(
    totalRequiredFund,
    totalContribution
  );
  const treasuryBalance = calcTreasuryBalance(totalContribution, totalExpense);
  const contributorStats = calcContributorStats(contributions, perContributorShare);
  const settlements = calcSettlements(contributorStats, actualRequiredFund);

  return {
    totalExpense,
    totalContribution,
    totalRequiredFund,
    perContributorShare,
    actualRequiredFund,
    treasuryBalance,
    contributorStats,
    settlements,
  };
}

export function getContributorSettlement(
  name: string,
  settlements: Settlement[]
): { type: "paying" | "receiving" | "settled"; amount: number; counterparts: { name: string; amount: number }[] } {
  // Find all settlements where this person is paying
  const payingSettlements = settlements.filter((s) => s.from === name);
  if (payingSettlements.length > 0) {
    const totalAmount = payingSettlements.reduce((sum, s) => sum + s.amount, 0);
    const counterparts = payingSettlements.map((s) => ({ name: s.to, amount: s.amount }));
    return { type: "paying", amount: totalAmount, counterparts };
  }

  // Find all settlements where this person is receiving
  const receivingSettlements = settlements.filter((s) => s.to === name);
  if (receivingSettlements.length > 0) {
    const totalAmount = receivingSettlements.reduce((sum, s) => sum + s.amount, 0);
    const counterparts = receivingSettlements.map((s) => ({ name: s.from, amount: s.amount }));
    return { type: "receiving", amount: totalAmount, counterparts };
  }

  return { type: "settled", amount: 0, counterparts: [] };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
