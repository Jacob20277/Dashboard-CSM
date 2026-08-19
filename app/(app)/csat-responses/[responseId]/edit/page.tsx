import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { EditCsatResponseForm } from "./edit-csat-response-form";

export default async function EditCsatResponsePage({
  params,
}: {
  params: Promise<{ responseId: string }>;
}) {
  const { responseId } = await params;
  await requireAdmin();

  const response = await prisma.csatResponse.findUnique({
    where: { id: responseId },
    include: {
      account: true,
      answers: { include: { csatLinkQuestion: true }, orderBy: { csatLinkQuestion: { sortOrder: "asc" } } },
    },
  });
  if (!response) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Edit CSAT response — {response.account.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <EditCsatResponseForm
            responseId={response.id}
            answers={response.answers}
            respondentName={response.respondentName}
            comment={response.comment}
          />
        </CardContent>
      </Card>
    </div>
  );
}
