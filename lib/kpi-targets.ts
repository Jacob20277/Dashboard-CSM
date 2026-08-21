import type { ScopedLog } from "@/lib/dashboard-queries";
import { computeResponseAverage, type CsatResponseRow } from "@/lib/csat-queries";

type CoverageTarget = {
  kraName: string;
  targetText: string;
  kind: "coverage";
  kpiName: string;
  minPercent: number;
};

type ConversionTarget = {
  kraName: string;
  targetText: string;
  kind: "conversion-rate";
  kpiName: string;
  denominatorKpiName: string;
  minPercent: number;
};

type CsatTarget = {
  kraName: string;
  targetText: string;
  kind: "csat";
  minPercent: number;
};

type UntrackedTarget = {
  kraName: string;
  targetText: string;
  kind: "untracked";
  reason: string;
};

type KpiTarget = CoverageTarget | ConversionTarget | CsatTarget | UntrackedTarget;

// Mirrors the KRA/KPI target-tracking sheet. Only targets we actually have
// data for get a real calculation — everything else is honestly "Not
// tracked" rather than a fabricated number.
export const KPI_TARGETS: KpiTarget[] = [
  {
    kraName: "Retention and Renewals",
    targetText: "90–95% renewal rate. Renewal planning to start 90 days before expiry.",
    kind: "untracked",
    reason: "No contract/renewal-date data is tracked in the app.",
  },
  {
    kraName: "Retention and Renewals",
    targetText:
      "Identify and manage churn risks (low usage, escalations, low engagement). Document recovery plans.",
    kind: "untracked",
    reason: "No usage/escalation risk scoring exists — see the Churned accounts count instead.",
  },
  {
    kraName: "Product Adoption",
    targetText: "Each account using at least 2–3 core workflows such as scheduling, job management, reporting.",
    kind: "untracked",
    reason: "Workflow usage isn't tracked in the app.",
  },
  {
    kraName: "Product Adoption",
    targetText: "At least one adoption improvement session per strategic account per quarter.",
    kind: "coverage",
    kpiName: "Adoption Improvement Activities",
    minPercent: 100,
  },
  {
    kraName: "EBR and MBR",
    targetText: "Conduct MBRs for 60–70% of accounts monthly.",
    kind: "coverage",
    kpiName: "Monthly Business Reviews",
    minPercent: 60,
  },
  {
    kraName: "EBR and MBR",
    targetText: "Quarterly or biannual EBRs for strategic accounts.",
    kind: "coverage",
    kpiName: "Executive Business Reviews",
    minPercent: 100,
  },
  {
    kraName: "Upselling",
    targetText: "Identify upsell opportunities in at least 20% of accounts.",
    kind: "coverage",
    kpiName: "Upsell Opportunities",
    minPercent: 20,
  },
  {
    kraName: "Upselling",
    targetText: "Convert 25–30% of identified opportunities.",
    kind: "conversion-rate",
    kpiName: "Upsell Conversion",
    denominatorKpiName: "Upsell Opportunities",
    minPercent: 25,
  },
  {
    kraName: "CSAT and Reviews",
    targetText: "Maintain CSAT score above 90%.",
    kind: "csat",
    minPercent: 90,
  },
  {
    kraName: "CSAT and Reviews",
    targetText: "1–2 customer reviews per quarter on platforms like G2 or Capterra.",
    kind: "untracked",
    reason: "No integration with external review platforms.",
  },
  {
    kraName: "Zuper Culture",
    targetText: "Maintain expected login hours and responsiveness.",
    kind: "untracked",
    reason: "Login/availability hours aren't tracked in the app.",
  },
  {
    kraName: "Zuper Culture",
    targetText:
      "Maintain CRM hygiene, meeting notes, and collaborate with support, product, and implementation teams.",
    kind: "untracked",
    reason: "No hygiene score or measurable numeric threshold exists for this.",
  },
];

export interface KpiTargetRow {
  kraName: string;
  targetText: string;
  tracked: boolean;
  attained: boolean | null;
  actualText: string;
  guidance: string | null;
}

function accountsTaggedWith(logs: ScopedLog[], kpiName: string): Set<string> {
  return new Set(
    logs.filter((log) => log.kpiTags.some((tag) => tag.kpi.name === kpiName)).map((log) => log.accountId)
  );
}

function listMissing(accounts: { id: string; name: string }[], coveredIds: Set<string>) {
  const missing = accounts.filter((a) => !coveredIds.has(a.id));
  if (missing.length === 0) return null;
  const shown = missing.slice(0, 8).map((a) => a.name);
  const rest = missing.length - shown.length;
  return `Missing: ${shown.join(", ")}${rest > 0 ? ` +${rest} more` : ""}`;
}

function computeCoverage(
  target: CoverageTarget,
  logs: ScopedLog[],
  accounts: { id: string; name: string }[]
): KpiTargetRow {
  if (accounts.length === 0) {
    return {
      kraName: target.kraName,
      targetText: target.targetText,
      tracked: true,
      attained: null,
      actualText: "No accounts in scope",
      guidance: null,
    };
  }

  const coveredIds = accountsTaggedWith(logs, target.kpiName);
  const coveredCount = accounts.filter((a) => coveredIds.has(a.id)).length;
  const percent = Math.round((coveredCount / accounts.length) * 1000) / 10;
  const attained = percent >= target.minPercent;

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${percent}% (${coveredCount} of ${accounts.length} accounts)`,
    guidance: attained ? null : listMissing(accounts, coveredIds),
  };
}

function computeConversionRate(
  target: ConversionTarget,
  logs: ScopedLog[],
  accounts: { id: string; name: string }[]
): KpiTargetRow {
  const opportunityIds = accountsTaggedWith(logs, target.denominatorKpiName);
  const convertedIds = accountsTaggedWith(logs, target.kpiName);
  const opportunityAccounts = accounts.filter((a) => opportunityIds.has(a.id));

  if (opportunityAccounts.length === 0) {
    return {
      kraName: target.kraName,
      targetText: target.targetText,
      tracked: true,
      attained: null,
      actualText: "No identified opportunities yet",
      guidance: null,
    };
  }

  const convertedCount = opportunityAccounts.filter((a) => convertedIds.has(a.id)).length;
  const percent = Math.round((convertedCount / opportunityAccounts.length) * 1000) / 10;
  const attained = percent >= target.minPercent;

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${percent}% (${convertedCount} of ${opportunityAccounts.length} opportunities)`,
    guidance: attained ? null : listMissing(opportunityAccounts, convertedIds),
  };
}

function computeCsat(target: CsatTarget, csatResponses: CsatResponseRow[]): KpiTargetRow {
  const byAccount = new Map<string, { name: string; scores: number[] }>();
  for (const response of csatResponses) {
    const avg = computeResponseAverage(response);
    if (avg === null) continue;
    const entry = byAccount.get(response.accountId) ?? { name: response.account.name, scores: [] };
    entry.scores.push(avg);
    byAccount.set(response.accountId, entry);
  }

  const allScores = [...byAccount.values()].flatMap((e) => e.scores);
  if (allScores.length === 0) {
    return {
      kraName: target.kraName,
      targetText: target.targetText,
      tracked: true,
      attained: null,
      actualText: "No CSAT responses yet",
      guidance: null,
    };
  }

  const overallAvg = allScores.reduce((sum, v) => sum + v, 0) / allScores.length;
  const percent = Math.round((overallAvg / 5) * 1000) / 10;
  const attained = percent >= target.minPercent;

  const belowTarget = [...byAccount.entries()]
    .map(([, entry]) => ({
      name: entry.name,
      avg: entry.scores.reduce((sum, v) => sum + v, 0) / entry.scores.length,
    }))
    .filter((a) => (a.avg / 5) * 100 < target.minPercent)
    .sort((a, b) => a.avg - b.avg);

  const guidance =
    attained || belowTarget.length === 0
      ? null
      : `Below-target accounts: ${belowTarget
          .slice(0, 8)
          .map((a) => `${a.name} (${a.avg.toFixed(1)}/5)`)
          .join(", ")}${belowTarget.length > 8 ? ` +${belowTarget.length - 8} more` : ""}`;

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${percent}% (avg ${overallAvg.toFixed(1)}/5 across ${byAccount.size} accounts)`,
    guidance,
  };
}

export function computeKpiTargets(
  logs: ScopedLog[],
  scopedActiveAccounts: { id: string; name: string }[],
  csatResponses: CsatResponseRow[]
): KpiTargetRow[] {
  return KPI_TARGETS.map((target) => {
    switch (target.kind) {
      case "coverage":
        return computeCoverage(target, logs, scopedActiveAccounts);
      case "conversion-rate":
        return computeConversionRate(target, logs, scopedActiveAccounts);
      case "csat":
        return computeCsat(target, csatResponses);
      case "untracked":
        return {
          kraName: target.kraName,
          targetText: target.targetText,
          tracked: false,
          attained: null,
          actualText: "Not tracked",
          guidance: target.reason,
        };
    }
  });
}
