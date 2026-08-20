import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAllKrasWithKpis } from "@/lib/dashboard-queries";
import { deleteKpiAction, deleteKraAction, renameKpiAction, renameKraAction } from "./actions";
import { CreateKraForm } from "./create-kra-form";
import { CreateKpiForm } from "./create-kpi-form";
import { DeleteEntityButton } from "./delete-entity-button";

export default async function AdminTaxonomyPage() {
  const kras = await getAllKrasWithKpis();
  const kpiCount = kras.reduce((n, kra) => n + kra.kpis.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Taxonomy</h1>
        <p className="text-muted-foreground text-sm">
          {kras.length} KRAs and {kpiCount} KPIs today — rename labels, add new KRAs/KPIs, or
          delete ones that have no logged activity against them.
        </p>
      </div>

      {kras.map((kra) => (
        <Card key={kra.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <form action={renameKraAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={kra.id} />
                <Input name="name" defaultValue={kra.name} className="h-8 max-w-sm font-semibold" />
                <Button variant="outline" size="sm" type="submit">
                  Save
                </Button>
              </form>
              <DeleteEntityButton
                action={deleteKraAction}
                id={kra.id}
                confirmTitle={`Delete "${kra.name}"?`}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {kra.kpis.map((kpi) => (
              <div key={kpi.id} className="flex items-center justify-between gap-2 pl-4">
                <form action={renameKpiAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={kpi.id} />
                  <Input name="name" defaultValue={kpi.name} className="h-8 max-w-sm" />
                  <Button variant="outline" size="sm" type="submit">
                    Save
                  </Button>
                </form>
                <DeleteEntityButton
                  action={deleteKpiAction}
                  id={kpi.id}
                  confirmTitle={`Delete "${kpi.name}"?`}
                />
              </div>
            ))}
            <CreateKpiForm kraId={kra.id} />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Add a new KRA</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateKraForm />
        </CardContent>
      </Card>
    </div>
  );
}
