const KPI_KEYWORDS: Record<string, string[]> = {
  "Renewal Rate": [
    "renew",
    "contract expiry",
    "contract expiring",
    "re-sign",
    "resign the contract",
    "subscription renewal",
  ],
  "Churn Risk Management": [
    "churn",
    "at-risk",
    "at risk",
    "escalat",
    "low usage",
    "disengag",
    "recovery plan",
    "save call",
    "risk mitigation",
    "cancel",
    "downgrade",
  ],
  "Feature Adoption": [
    "adopt",
    "workflow",
    "scheduling module",
    "job management",
    "reporting module",
    "using the feature",
    "core workflow",
    "go-live",
    "go live",
    "rollout",
  ],
  "Adoption Improvement Activities": [
    "training",
    "walkthrough",
    "demo session",
    "enablement",
    "best practice",
    "improvement session",
    "coaching",
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
    "qbr",
    "executive business review",
    "quarterly review",
    "executive review",
    "executive sync",
    "leadership review",
  ],
  "Upsell Opportunities": [
    "upsell",
    "up-sell",
    "cross-sell",
    "cross sell",
    "expansion opportunity",
    "upgrade opportunity",
    "additional license",
    "add-on",
    "add on opportunity",
  ],
  "Upsell Conversion": [
    "upsell closed",
    "closed the upsell",
    "converted the upsell",
    "upsell conversion",
    "purchased the upsell",
    "signed the upsell",
    "won the upsell",
    "upgraded their plan",
    "upgraded to",
    "expansion deal closed",
  ],
  "CSAT Score": [
    "csat",
    "satisfaction score",
    "customer satisfaction",
    "survey score",
    "nps",
  ],
  "Customer Reviews": [
    "g2",
    "capterra",
    "testimonial",
    "case study",
    "customer reference",
    "left a review",
    "star rating",
    "review request",
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
