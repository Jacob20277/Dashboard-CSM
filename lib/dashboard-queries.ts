import { prisma } from "@/lib/prisma";

export type DashboardScope =
  | { type: "me"; userId: string }
  | { type: "team" }
  | { type: "individual"; userId: string };

export interface DateRange {
  from?: Date;
  to?: Date;
}

async function scopeToUserIds(scope: DashboardScope): Promise<string[] | undefined> {
  if (scope.type === "team") {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }
  return [scope.userId];
}

export async function getScopedActivityLogs(scope: DashboardScope, range: DateRange = {}) {
  const userIds = await scopeToUserIds(scope);
  return prisma.activityLog.findMany({
    where: {
      userId: userIds ? { in: userIds } : undefined,
      activityDate: {
        gte: range.from,
        lte: range.to,
      },
    },
    include: {
      user: { select: { id: true, name: true } },
      account: { select: { id: true, name: true, isStrategic: true } },
      kpiTags: { include: { kpi: { include: { kra: true } } } },
    },
    orderBy: { activityDate: "desc" },
  });
}

export async function getAccountActivityLogs(accountId: string, range: DateRange = {}) {
  return prisma.activityLog.findMany({
    where: {
      accountId,
      activityDate: { gte: range.from, lte: range.to },
    },
    include: {
      user: { select: { id: true, name: true } },
      account: { select: { id: true, name: true, isStrategic: true } },
      kpiTags: { include: { kpi: { include: { kra: true } } } },
    },
    orderBy: { activityDate: "desc" },
  });
}

type ScopedLog = Awaited<ReturnType<typeof getScopedActivityLogs>>[number];

export function computeKpiTotals(logs: ScopedLog[]) {
  const map = new Map<
    string,
    {
      kpiId: string;
      kpiName: string;
      kraId: string;
      kraName: string;
      kraSortOrder: number;
      kpiSortOrder: number;
      totalMinutes: number;
      entryCount: number;
    }
  >();

  for (const log of logs) {
    if (log.isUnmatched) continue;
    for (const tag of log.kpiTags) {
      const existing =
        map.get(tag.kpiId) ??
        {
          kpiId: tag.kpi.id,
          kpiName: tag.kpi.name,
          kraId: tag.kpi.kraId,
          kraName: tag.kpi.kra.name,
          kraSortOrder: tag.kpi.kra.sortOrder,
          kpiSortOrder: tag.kpi.sortOrder,
          totalMinutes: 0,
          entryCount: 0,
        };
      existing.totalMinutes += log.durationMinutes;
      existing.entryCount += 1;
      map.set(tag.kpiId, existing);
    }
  }

  return [...map.values()].sort(
    (a, b) => a.kraSortOrder - b.kraSortOrder || a.kpiSortOrder - b.kpiSortOrder
  );
}

export function computeKraTotals(logs: ScopedLog[]) {
  const map = new Map<
    string,
    {
      kraId: string;
      kraName: string;
      sortOrder: number;
      totalMinutes: number;
      entryCount: number;
      seenActivityIds: Set<string>;
    }
  >();

  for (const log of logs) {
    if (log.isUnmatched) continue;
    const kraIdsTouched = new Set(log.kpiTags.map((t) => t.kpi.kraId));
    for (const kraId of kraIdsTouched) {
      const tagForKra = log.kpiTags.find((t) => t.kpi.kraId === kraId)!;
      const existing =
        map.get(kraId) ??
        {
          kraId,
          kraName: tagForKra.kpi.kra.name,
          sortOrder: tagForKra.kpi.kra.sortOrder,
          totalMinutes: 0,
          entryCount: 0,
          seenActivityIds: new Set<string>(),
        };
      if (!existing.seenActivityIds.has(log.id)) {
        existing.seenActivityIds.add(log.id);
        existing.totalMinutes += log.durationMinutes;
        existing.entryCount += 1;
      }
      map.set(kraId, existing);
    }
  }

  return [...map.values()]
    .map(({ seenActivityIds, ...rest }) => rest)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function computeAccountTotals(logs: ScopedLog[]) {
  const map = new Map<
    string,
    {
      accountId: string;
      accountName: string;
      isStrategic: boolean;
      totalMinutes: number;
      entryCount: number;
      flaggedCount: number;
    }
  >();

  for (const log of logs) {
    const existing =
      map.get(log.accountId) ??
      {
        accountId: log.accountId,
        accountName: log.account.name,
        isStrategic: log.account.isStrategic,
        totalMinutes: 0,
        entryCount: 0,
        flaggedCount: 0,
      };
    if (log.isUnmatched) {
      existing.flaggedCount += 1;
    } else {
      existing.totalMinutes += log.durationMinutes;
      existing.entryCount += 1;
    }
    map.set(log.accountId, existing);
  }

  return [...map.values()].sort((a, b) => a.accountName.localeCompare(b.accountName));
}

export function getFlaggedLogs(logs: ScopedLog[]) {
  return logs.filter((l) => l.isUnmatched);
}

export async function getAllKrasWithKpis() {
  return prisma.kra.findMany({
    orderBy: { sortOrder: "asc" },
    include: { kpis: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getActiveAccounts() {
  return prisma.account.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllAccounts() {
  return prisma.account.findMany({ orderBy: { name: "asc" } });
}

export async function getTeamMembers() {
  return prisma.user.findMany({ orderBy: { name: "asc" } });
}

export async function getActiveTeamMembers() {
  return prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}
