"use client";

import { useActionState, useState } from "react";
import { AccountCombobox } from "@/components/account-combobox";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCsatLink, type CsatLinkFormState } from "./actions";

const initialState: CsatLinkFormState = {};

type Template = { id: string; name: string; questions: { id: string; text: string }[] };

export function CreateCsatLinkForm({
  accounts,
  templates,
}: {
  accounts: { id: string; name: string }[];
  templates: Template[];
}) {
  const [state, formAction, pending] = useActionState(createCsatLink, initialState);
  const [questions, setQuestions] = useState<string[]>([""]);
  const url =
    state?.token && typeof window !== "undefined"
      ? `${window.location.origin}/csat/${state.token}`
      : undefined;

  function applyTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setQuestions(template.questions.map((q) => q.text));
    }
  }

  function updateQuestion(index: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? text : q)));
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64 space-y-2">
            <Label htmlFor="accountId">Account</Label>
            <AccountCombobox accounts={accounts} />
          </div>
          {templates.length > 0 && (
            <div className="w-64 space-y-2">
              <Label htmlFor="templateId">Start from a template (optional)</Label>
              <select
                id="templateId"
                onChange={(e) => applyTemplate(e.target.value)}
                defaultValue=""
                className="border-input h-9 w-full rounded-lg border bg-transparent px-2.5 text-sm"
              >
                <option value="">No template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Questions (each is a 1-5 rating)</Label>
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                name="questionText"
                value={q}
                onChange={(e) => updateQuestion(i, e.target.value)}
                placeholder={`Question ${i + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeQuestion(i)}
                disabled={questions.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQuestions((prev) => [...prev, ""])}
          >
            + Add question
          </Button>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Generating..." : "Generate link"}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {url && (
        <div className="flex items-center gap-2">
          <Input readOnly value={url} className="h-8 max-w-md text-xs" />
          <CopyButton text={url} />
        </div>
      )}
    </div>
  );
}
