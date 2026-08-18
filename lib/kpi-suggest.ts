const KPI_KEYWORDS: Record<string, string[]> = {
  "Renewal Rate": [
    "renewal",
    "renew ",
    "renewed",
    "renewing",
    "contract renewal",
    "expiry",
    "expiring",
    "re-sign",
    "resign the contract",
    "subscription renewal",
  ],
  "Churn Risk Management": [
    "churn",
    "at-risk",
    "at risk",
    "escalation",
    "escalated",
    "low usage",
    "disengaged",
    "recovery plan",
    "save call",
    "risk mitigation",
    "cancellation",
    "cancel the account",
    "downgrade risk",
  ],
  "Feature Adoption": [
    "feature adoption",
    "adopting",
    "adopted the feature",
    "workflow",
    "scheduling module",
    "job management",
    "reporting module",
    "using the feature",
    "core workflow",
    "go-live",
    "rollout",
  ],
  "Adoption Improvement Activities": [
    "training session",
    "walkthrough",
    "demo session",
    "enablement",
    "best practices session",
    "improvement session",
    "coaching call",
    "workshop",
    "onboarding session",
  ],
  "Monthly Business Reviews": [
    "mbr",
    "monthly business review",
    "monthly review",
    "monthly call",
    "monthly sync",
    "monthly check-in",
  ],
  "Executive Business Reviews": [
    "ebr",
    "executive business review",
    "quarterly review",
    "executive review",
    "executive sync",
    "leadership review",
    "qbr",
  ],
  "Upsell Opportunities": [
    "upsell opportunity",
    "expansion opportunity",
    "cross-sell",
    "identified upsell",
    "upgrade opportunity",
    "additional license",
    "add-on opportunity",
  ],
  "Upsell Conversion": [
    "upsell conversion",
    "closed upsell",
    "upgraded the plan",
    "converted the opportunity",
    "purchased add-on",
    "expansion deal closed",
    "deal closed",
  ],
  "CSAT Score": ["csat", "satisfaction score", "customer satisfaction", "survey score", "nps"],
  "Customer Reviews": [
    "g2 review",
    "capterra",
    "testimonial",
    "case study",
    "customer reference",
    "left a review",
    "star rating",
  ],
};

export function suggestKpiIds(
  title: string,
  notes: string,
  kpis: { id: string; name: string }[]
): string[] {
  const text = `${title} ${notes}`.toLowerCase();
  const matches: string[] = [];

  for (const kpi of kpis) {
    const keywords = KPI_KEYWORDS[kpi.name];
    if (!keywords) continue;
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      matches.push(kpi.id);
    }
  }

  return matches;
}
