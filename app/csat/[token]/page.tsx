import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { submitCsatResponse } from "./actions";
import { CsatResponseForm } from "./csat-response-form";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function CsatSurveyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const link = await prisma.csatLink.findUnique({
    where: { token },
    include: { account: true, questions: { orderBy: { sortOrder: "asc" } } },
  });

  if (!link || link.revokedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-muted-foreground max-w-sm text-center text-sm">
          This link is no longer valid. Please reach out to your contact for a new one.
        </p>
      </div>
    );
  }

  const action = submitCsatResponse.bind(null, token);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>How are we doing, {link.account.name}?</CardTitle>
        </CardHeader>
        <CardContent>
          <CsatResponseForm action={action} questions={link.questions} />
        </CardContent>
      </Card>
    </div>
  );
}
