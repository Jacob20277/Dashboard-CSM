import { prisma } from "@/lib/prisma";
import { scopeToUserIds, type DashboardScope, type DateRange } from "@/lib/dashboard-queries";

const csatResponseInclude = {
  account: { select: { id: true, name: true } },
  csatLink: { include: { createdBy: { select: { id: true, name: true } } } },
  answers: { include: { csatLinkQuestion: true } },
} as const;

export async function getCsatResponses(scope: DashboardScope, range: DateRange = {}) {
  const userIds = await scopeToUserIds(scope);
  return prisma.csatResponse.findMany({
    where: {
      submittedAt: { gte: range.from, lte: range.to },
      csatLink: userIds ? { createdByUserId: { in: userIds } } : undefined,
    },
    include: csatResponseInclude,
    orderBy: { submittedAt: "desc" },
  });
}

export async function getAccountCsatResponses(accountId: string, range: DateRange = {}) {
  return prisma.csatResponse.findMany({
    where: {
      accountId,
      submittedAt: { gte: range.from, lte: range.to },
    },
    include: csatResponseInclude,
    orderBy: { submittedAt: "desc" },
  });
}

export async function getLinkCsatResponses(csatLinkId: string, range: DateRange = {}) {
  return prisma.csatResponse.findMany({
    where: {
      csatLinkId,
      submittedAt: { gte: range.from, lte: range.to },
    },
    include: csatResponseInclude,
    orderBy: { submittedAt: "desc" },
  });
}

export type CsatResponseRow = Awaited<ReturnType<typeof getCsatResponses>>[number];

function responseAverage(response: CsatResponseRow) {
  if (response.answers.length === 0) return null;
  return response.answers.reduce((sum, a) => sum + a.score, 0) / response.answers.length;
}

export function computeCsatSummary(responses: CsatResponseRow[]) {
  const responseAverages = responses.map(responseAverage).filter((avg) => avg !== null);
  const responseCount = responses.length;
  const averageScore =
    responseAverages.length === 0
      ? null
      : Math.round(
          (responseAverages.reduce((sum, avg) => sum + avg, 0) / responseAverages.length) * 10
        ) / 10;
  return { averageScore, responseCount };
}

export function computeResponseAverage(response: CsatResponseRow) {
  return responseAverage(response);
}
