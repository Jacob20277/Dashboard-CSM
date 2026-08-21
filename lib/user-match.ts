function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function matchUserByEmailOrName<T extends { name: string; email: string }>(
  users: T[],
  rawValue: string
): T | undefined {
  const value = normalize(rawValue);
  if (!value) return undefined;

  return rawValue.includes("@")
    ? users.find((u) => normalize(u.email) === value)
    : users.find((u) => normalize(u.name) === value);
}
