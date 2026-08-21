import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
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
      <div className="from-background to-accent flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b p-6">
        <BrandLogo className="h-10 w-auto" />
        <p className="text-muted-foreground max-w-sm text-center text-sm">
          This link is no longer valid. Please reach out to your contact for a new one.
        </p>
      </div>
    );
  }

  const action = submitCsatResponse.bind(null, token);

  return (
    <div className="from-background to-accent flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b p-6">
      <BrandLogo className="h-10 w-auto" />
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
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
