import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CsatSummaryCard({
  averageScore,
  responseCount,
}: {
  averageScore: number | null;
  responseCount: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm">Average CSAT score</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {averageScore === null ? "—" : `${averageScore} / 5`}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm">CSAT responses</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{responseCount}</CardContent>
      </Card>
    </div>
  );
}
