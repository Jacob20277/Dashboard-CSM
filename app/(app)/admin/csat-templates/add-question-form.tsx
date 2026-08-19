"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTemplateQuestion, type AddQuestionFormState } from "./actions";

const initialState: AddQuestionFormState = {};

export function AddQuestionForm({ templateId }: { templateId: string }) {
  const [state, formAction, pending] = useActionState(addTemplateQuestion, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2 pt-2">
      <input type="hidden" name="templateId" value={templateId} />
      <Input name="text" placeholder="Add a question..." className="h-8" />
      <Button variant="outline" size="sm" type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add question"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
