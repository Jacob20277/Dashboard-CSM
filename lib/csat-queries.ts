import { prisma } from "@/lib/prisma";
import type { DateRange } from "@/lib/dashboard-queries";

export async function getCsatResponses(range: DateRange = {}) {
  return prisma.csatResponse.findMany({
    where: {
      submittedAt: { gte: range.from, lte: range.to },
    },
    include: {
      account: { select: { id: true, name: true } },
      csatLink: { include: { createdBy: { select: { id: true, name: true } } } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getAccountCsatResponses(accountId: string, range: DateRange = {}) {
  return prisma.csatResponse.findMany({
    where: {
      accountId,
      submittedAt: { gte: range.from, lte: range.to },
    },
    include: {
      account: { select: { id: true, name: true } },
      csatLink: { include: { createdBy: { select: { id: true, name: true } } } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

type CsatResponseRow = Awaited<ReturnType<typeof getCsatResponses>>[number];

export function computeCsatSummary(responses: CsatResponseRow[]) {
  const responseCount = responses.length;
  const averageScore =
    responseCount === 0
      ? null
      : Math.round((responses.reduce((sum, r) => sum + r.score, 0) / responseCount) * 10) / 10;
  return { averageScore, responseCount };
}
