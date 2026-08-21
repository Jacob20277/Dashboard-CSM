function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const currRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow.push(
        Math.min(
          prevRow[j] + 1, // deletion
          currRow[j - 1] + 1, // insertion
          prevRow[j - 1] + cost // substitution
        )
      );
    }
    prevRow = currRow;
  }
  return prevRow[n];
}

// Exact first-word match always counts. A near-match (typo) only counts once
// both words are long enough that a couple of edited characters is still a
// safely small fraction of the word — short words get much stricter or no
// fuzzy tolerance at all, to avoid coincidentally matching unrelated names.
function firstWordsMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 5) return false;
  const threshold = Math.max(a.length, b.length) >= 8 ? 2 : 1;
  return levenshtein(a, b) <= threshold;
}

// Every account whose normalized name equals, contains/is contained by, or
// shares a (possibly typo'd) first word with the normalized rawValue. Exact
// normalized matches take priority — if any exist, only those are returned,
// so a looser hit never displaces a real one.
export function matchAccountCandidates<T extends { name: string }>(
  accounts: T[],
  rawValue: string
): T[] {
  const value = normalize(rawValue);
  if (!value) return [];

  const exact = accounts.filter((a) => normalize(a.name) === value);
  if (exact.length > 0) return exact;

  const valueFirstWord = value.split(" ")[0] ?? "";

  return accounts.filter((a) => {
    const name = normalize(a.name);
    if (name.includes(value) || value.includes(name)) return true;
    const nameFirstWord = name.split(" ")[0] ?? "";
    return firstWordsMatch(valueFirstWord, nameFirstWord);
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
