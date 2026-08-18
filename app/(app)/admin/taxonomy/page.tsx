import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAllKrasWithKpis } from "@/lib/dashboard-queries";
import { renameKpiAction, renameKraAction } from "./actions";

export default async function AdminTaxonomyPage() {
  const kras = await getAllKrasWithKpis();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Taxonomy</h1>
        <p className="text-muted-foreground text-sm">
          The 6 KRAs and 12 KPIs are fixed for now — you can rename labels here, but adding or
          removing KRAs/KPIs isn&apos;t supported yet.
        </p>
      </div>

      {kras.map((kra) => (
        <Card key={kra.id}>
          <CardHeader>
            <CardTitle>
              <form action={renameKraAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={kra.id} />
                <Input name="name" defaultValue={kra.name} className="h-8 max-w-sm font-semibold" />
                <Button variant="outline" size="sm" type="submit">
                  Save
                </Button>
              </form>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {kra.kpis.map((kpi) => (
              <form
                key={kpi.id}
                action={renameKpiAction}
                className="flex items-center gap-2 pl-4"
              >
                <input type="hidden" name="id" value={kpi.id} />
                <Input name="name" defaultValue={kpi.name} className="h-8 max-w-sm" />
                <Button variant="outline" size="sm" type="submit">
                  Save
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
