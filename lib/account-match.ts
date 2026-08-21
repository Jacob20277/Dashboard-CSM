function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Every account whose normalized name equals, contains, or is contained by the
// normalized rawValue. Exact normalized matches take priority — if any exist,
// only exact matches are returned, so a partial hit never displaces a real one.
export function matchAccountCandidates<T extends { name: string }>(
  accounts: T[],
  rawValue: string
): T[] {
  const value = normalize(rawValue);
  if (!value) return [];

  const exact = accounts.filter((a) => normalize(a.name) === value);
  if (exact.length > 0) return exact;

  return accounts.filter((a) => {
    const name = normalize(a.name);
    return name.includes(value) || value.includes(name);
  });
}

// A confident match is exactly one candidate. Zero or multiple (ambiguous)
// both return undefined so callers fall back to their existing no-match path.
export function matchSingleAccount<T extends { name: string }>(
  accounts: T[],
  rawValue: string
): T | undefined {
  const candidates = matchAccountCandidates(accounts, rawValue);
  return candidates.length === 1 ? candidates[0] : undefined;
}
