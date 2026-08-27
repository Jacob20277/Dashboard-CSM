import type { ScopedLog, ScopedActiveAccount } from "@/lib/dashboard-queries";
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

type RenewalRateTarget = {
  kraName: string;
  targetText: string;
  kind: "renewal-rate";
  minPercent: number;
};

type RenewalPlanningTarget = {
  kraName: string;
  targetText: string;
  kind: "renewal-planning";
  windowDays: number;
  minPercent: number;
};

type ChurnRiskTarget = {
  kraName: string;
  targetText: string;
  kind: "churn-risk";
  minPercent: number;
};

type ProductAdoptionTarget = {
  kraName: string;
  targetText: string;
  kind: "product-adoption";
  minWorkflows: number;
  minPercent: number;
};

type UpsellIdentifyTarget = {
  kraName: string;
  targetText: string;
  kind: "upsell-identify";
  kpiName: string;
  minPercent: number;
};

type UpsellConvertTarget = {
  kraName: string;
  targetText: string;
  kind: "upsell-convert";
  kpiName: string;
  denominatorKpiName: string;
  minPercent: number;
};

type KpiTarget =
  | CoverageTarget
  | ConversionTarget
  | CsatTarget
  | UntrackedTarget
  | RenewalRateTarget
  | RenewalPlanningTarget
  | ChurnRiskTarget
  | ProductAdoptionTarget
  | UpsellIdentifyTarget
  | UpsellConvertTarget;

// Mirrors the KRA/KPI target-tracking sheet. Only targets we actually have
// data for get a real calculation — everything else is honestly "Not
// tracked" rather than a fabricated number.
export const KPI_TARGETS: KpiTarget[] = [
  {
    kraName: "Retention and Renewals",
    targetText: "90–95% renewal rate. Renewal planning to start 90 days before expiry.",
    kind: "renewal-rate",
    minPercent: 90,
  },
  {
    kraName: "Retention and Renewals",
    targetText: "Renewal planning to start 90 days before expiry.",
    kind: "renewal-planning",
    windowDays: 90,
    minPercent: 100,
  },
  {
    kraName: "Retention and Renewals",
    targetText:
      "Identify and manage churn risks (low usage, escalations, low engagement). Document recovery plans.",
    kind: "churn-risk",
    minPercent: 100,
  },
  {
    kraName: "Product Adoption",
    targetText: "Each account using at least 2–3 core workflows such as scheduling, job management, reporting.",
    kind: "product-adoption",
    minWorkflows: 2,
    minPercent: 100,
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
    kind: "upsell-identify",
    kpiName: "Upsell Opportunities",
    minPercent: 20,
  },
  {
    kraName: "Upselling",
    targetText: "Convert 25–30% of identified opportunities.",
    kind: "upsell-convert",
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
  href?: string;
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

function noAccountsRow(target: { kraName: string; targetText: string }): KpiTargetRow {
  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained: null,
    actualText: "No accounts in scope",
    guidance: null,
  };
}

function computeCoverage(target: CoverageTarget, logs: ScopedLog[], accounts: ScopedActiveAccount[]): KpiTargetRow {
  if (accounts.length === 0) return noAccountsRow(target);

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
  accounts: ScopedActiveAccount[]
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

// --- CRM-deal-driven calculations -------------------------------------

type CrmDealLite = ScopedActiveAccount["deals"][number];

const RENEWED_STAGES = new Set(["Renewed", "Auto-renewal"]);
const CHURNED_STAGES = new Set(["Churned"]);

function isRenewalPipeline(deal: CrmDealLite) {
  return deal.pipeline === "Renewal Pipeline";
}

// The account's current renewal cycle: an open (not yet Renewed/Churned)
// Renewal Pipeline deal if one exists, otherwise the most recently closed
// one — used as the source of the "current" renewal date / renewal status.
function currentRenewalDeal(deals: CrmDealLite[]): CrmDealLite | undefined {
  const renewalDeals = deals.filter(isRenewalPipeline);
  if (renewalDeals.length === 0) return undefined;

  const open = renewalDeals.filter((d) => !RENEWED_STAGES.has(d.stage) && !CHURNED_STAGES.has(d.stage));
  if (open.length > 0) {
    return open.sort((a, b) => {
      const aTime = (a.renewalDate ?? a.closingDate)?.getTime() ?? Infinity;
      const bTime = (b.renewalDate ?? b.closingDate)?.getTime() ?? Infinity;
      return aTime - bTime;
    })[0];
  }

  return renewalDeals.sort((a, b) => (b.closingDate?.getTime() ?? 0) - (a.closingDate?.getTime() ?? 0))[0];
}

function computeRenewalRate(target: RenewalRateTarget, accounts: ScopedActiveAccount[]): KpiTargetRow {
  let renewed = 0;
  let churned = 0;
  for (const account of accounts) {
    for (const deal of account.deals) {
      if (!isRenewalPipeline(deal)) continue;
      if (RENEWED_STAGES.has(deal.stage)) renewed++;
      else if (CHURNED_STAGES.has(deal.stage)) churned++;
    }
  }

  const total = renewed + churned;
  if (total === 0) {
    return {
      kraName: target.kraName,
      targetText: target.targetText,
      tracked: true,
      attained: null,
      actualText: "No closed renewal outcomes recorded yet",
      guidance: null,
    };
  }

  const percent = Math.round((renewed / total) * 1000) / 10;
  const attained = percent >= target.minPercent;

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${percent}% (${renewed} renewed of ${total} closed renewal deals)`,
    guidance: attained ? null : `${churned} churned`,
  };
}

export interface UpcomingRenewal {
  accountId: string;
  accountName: string;
  csmName: string | null;
  renewalDate: Date;
  dealId: string | null;
  outreachStarted: boolean;
  stage: string | null;
  renewalStatus: string | null;
}

// Single source of truth for "what's renewing soon" — used by both the
// dashboard KPI card and the dedicated /dashboard/renewals checklist page.
export function computeUpcomingRenewals(accounts: ScopedActiveAccount[], windowDays = 90): UpcomingRenewal[] {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  const results: UpcomingRenewal[] = [];
  for (const account of accounts) {
    const deal = currentRenewalDeal(account.deals);
    const renewalDate = deal?.renewalDate ?? account.renewalDateOverride ?? null;
    if (!renewalDate) continue;
    if (renewalDate < now || renewalDate > windowEnd) continue;

    results.push({
      accountId: account.id,
      accountName: account.name,
      csmName: account.csm?.name ?? null,
      renewalDate,
      dealId: deal?.id ?? null,
      outreachStarted: Boolean(deal?.renewalOutreachAt),
      stage: deal?.stage ?? null,
      renewalStatus: deal?.renewalStatus ?? null,
    });
  }

  return results.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());
}

function computeRenewalPlanning(target: RenewalPlanningTarget, accounts: ScopedActiveAccount[]): KpiTargetRow {
  const upcoming = computeUpcomingRenewals(accounts, target.windowDays);
  if (upcoming.length === 0) {
    return {
      kraName: target.kraName,
      targetText: target.targetText,
      tracked: true,
      attained: null,
      actualText: "No renewals due in the next 90 days",
      guidance: null,
      href: "/dashboard/renewals",
    };
  }

  const started = upcoming.filter((u) => u.outreachStarted);
  const percent = Math.round((started.length / upcoming.length) * 1000) / 10;
  const attained = percent >= target.minPercent;
  const notStarted = upcoming.filter((u) => !u.outreachStarted);
  const shown = notStarted.slice(0, 8).map((u) => u.accountName);
  const rest = notStarted.length - shown.length;

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${percent}% (${started.length} of ${upcoming.length} upcoming renewals have outreach started)`,
    guidance: attained ? null : `Needs outreach: ${shown.join(", ")}${rest > 0 ? ` +${rest} more` : ""}`,
    href: "/dashboard/renewals",
  };
}

function isFlaggedAtRisk(account: ScopedActiveAccount): boolean {
  if (account.healthStatus === "Bad" || account.healthStatus === "Worse") return true;
  const deal = currentRenewalDeal(account.deals);
  return deal?.renewalStatus === "At Risk" || deal?.renewalStatus === "Churn";
}

function hasRecoveryPlan(account: ScopedActiveAccount): boolean {
  return Boolean(account.recoveryPlanNotes && account.recoveryPlanNotes.trim().length > 0);
}

function computeChurnRisk(target: ChurnRiskTarget, accounts: ScopedActiveAccount[]): KpiTargetRow {
  const flagged = accounts.filter(isFlaggedAtRisk);
  if (flagged.length === 0) {
    return {
      kraName: target.kraName,
      targetText: target.targetText,
      tracked: true,
      attained: null,
      actualText: "No accounts currently flagged at risk",
      guidance: null,
    };
  }

  const withPlan = flagged.filter(hasRecoveryPlan);
  const percent = Math.round((withPlan.length / flagged.length) * 1000) / 10;
  const attained = percent >= target.minPercent;
  const missing = flagged.filter((a) => !hasRecoveryPlan(a));
  const shown = missing.slice(0, 8).map((a) => a.name);
  const rest = missing.length - shown.length;

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${flagged.length} accounts flagged at risk — ${percent}% have a recovery plan documented`,
    guidance: attained ? null : `Needs a recovery plan: ${shown.join(", ")}${rest > 0 ? ` +${rest} more` : ""}`,
  };
}

function computeProductAdoption(target: ProductAdoptionTarget, accounts: ScopedActiveAccount[]): KpiTargetRow {
  if (accounts.length === 0) return noAccountsRow(target);

  const adopting = accounts.filter((a) => (a.workflowsEnabledCount ?? 0) >= target.minWorkflows);
  const percent = Math.round((adopting.length / accounts.length) * 1000) / 10;
  const attained = percent >= target.minPercent;
  const coveredIds = new Set(adopting.map((a) => a.id));

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${percent}% (${adopting.length} of ${accounts.length} accounts)`,
    guidance: attained ? null : listMissing(accounts, coveredIds),
  };
}

function dealAccountIds(accounts: ScopedActiveAccount[], predicate: (deal: CrmDealLite) => boolean): Set<string> {
  const ids = new Set<string>();
  for (const account of accounts) {
    if (account.deals.some(predicate)) ids.add(account.id);
  }
  return ids;
}

const isExpansionDeal = (deal: CrmDealLite) => deal.dealType === "Expansion";
const isWonExpansionDeal = (deal: CrmDealLite) => deal.dealType === "Expansion" && deal.stage === "Closed/Won";

function computeUpsellIdentify(
  target: UpsellIdentifyTarget,
  logs: ScopedLog[],
  accounts: ScopedActiveAccount[]
): KpiTargetRow {
  if (accounts.length === 0) return noAccountsRow(target);

  const coveredIds = new Set([
    ...accountsTaggedWith(logs, target.kpiName),
    ...dealAccountIds(accounts, isExpansionDeal),
  ]);
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

function computeUpsellConvert(
  target: UpsellConvertTarget,
  logs: ScopedLog[],
  accounts: ScopedActiveAccount[]
): KpiTargetRow {
  const identifiedIds = new Set([
    ...accountsTaggedWith(logs, target.denominatorKpiName),
    ...dealAccountIds(accounts, isExpansionDeal),
  ]);
  const identifiedAccounts = accounts.filter((a) => identifiedIds.has(a.id));

  if (identifiedAccounts.length === 0) {
    return {
      kraName: target.kraName,
      targetText: target.targetText,
      tracked: true,
      attained: null,
      actualText: "No identified opportunities yet",
      guidance: null,
    };
  }

  const convertedIds = new Set([
    ...accountsTaggedWith(logs, target.kpiName),
    ...dealAccountIds(accounts, isWonExpansionDeal),
  ]);
  const convertedCount = identifiedAccounts.filter((a) => convertedIds.has(a.id)).length;
  const percent = Math.round((convertedCount / identifiedAccounts.length) * 1000) / 10;
  const attained = percent >= target.minPercent;

  return {
    kraName: target.kraName,
    targetText: target.targetText,
    tracked: true,
    attained,
    actualText: `${percent}% (${convertedCount} of ${identifiedAccounts.length} opportunities)`,
    guidance: attained ? null : listMissing(identifiedAccounts, convertedIds),
  };
}

export function computeKpiTargets(
  logs: ScopedLog[],
  scopedActiveAccounts: ScopedActiveAccount[],
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
      case "renewal-rate":
        return computeRenewalRate(target, scopedActiveAccounts);
      case "renewal-planning":
        return computeRenewalPlanning(target, scopedActiveAccounts);
      case "churn-risk":
        return computeChurnRisk(target, scopedActiveAccounts);
      case "product-adoption":
        return computeProductAdoption(target, scopedActiveAccounts);
      case "upsell-identify":
        return computeUpsellIdentify(target, logs, scopedActiveAccounts);
      case "upsell-convert":
        return computeUpsellConvert(target, logs, scopedActiveAccounts);
      case "untracked":
        return {
          kraName: target.kraName,
          targetText: target.targetText,
          tracked: false,
          attained: null,
          actualText: "",
          guidance: target.reason,
        };
    }
  });
}
