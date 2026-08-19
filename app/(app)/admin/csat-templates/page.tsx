import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import {
  archiveCsatTemplate,
  deleteTemplateQuestion,
  moveTemplateQuestion,
  renameTemplateQuestion,
} from "./actions";
import { AddQuestionForm } from "./add-question-form";
import { CreateTemplateForm } from "./create-template-form";

export default async function AdminCsatTemplatesPage() {
  const templates = await prisma.csatTemplate.findMany({
    orderBy: { sortOrder: "asc" },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">CSAT templates</h1>
        <p className="text-muted-foreground text-sm">
          Predefined question sets reps can pick from when generating a CSAT link (e.g.
          &quot;Onboarding&quot;, &quot;Support Resolution&quot;). Editing a template&apos;s
          questions here only affects links generated after the change — links already sent
          keep their original wording.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New template</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTemplateForm />
        </CardContent>
      </Card>

      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {template.name}
              {!template.isActive && <Badge variant="outline">Archived</Badge>}
            </CardTitle>
            <form action={archiveCsatTemplate}>
              <input type="hidden" name="id" value={template.id} />
              <input type="hidden" name="isActive" value={String(template.isActive)} />
              <Button variant="outline" size="sm" type="submit">
                {template.isActive ? "Archive" : "Restore"}
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-2">
            {template.questions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-2">
                <form action={renameTemplateQuestion} className="flex flex-1 items-center gap-2">
                  <input type="hidden" name="id" value={q.id} />
                  <Input name="text" defaultValue={q.text} className="h-8" />
                  <Button variant="outline" size="sm" type="submit">
                    Save
                  </Button>
                </form>
                <form action={moveTemplateQuestion}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="templateId" value={template.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button variant="outline" size="sm" type="submit" disabled={i === 0}>
                    ↑
                  </Button>
                </form>
                <form action={moveTemplateQuestion}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="templateId" value={template.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button
                    variant="outline"
                    size="sm"
                    type="submit"
                    disabled={i === template.questions.length - 1}
                  >
                    ↓
                  </Button>
                </form>
                <form action={deleteTemplateQuestion}>
                  <input type="hidden" name="id" value={q.id} />
                  <Button variant="outline" size="sm" type="submit">
                    Delete
                  </Button>
                </form>
              </div>
            ))}
            {template.questions.length === 0 && (
              <p className="text-muted-foreground text-sm">No questions yet.</p>
            )}
            <AddQuestionForm templateId={template.id} />
          </CardContent>
        </Card>
      ))}

      {templates.length === 0 && <p className="text-muted-foreground text-sm">No templates yet.</p>}
    </div>
  );
}
