"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { editCsatResponseAction, type EditCsatResponseFormState } from "@/lib/csat-actions";

const initialState: EditCsatResponseFormState = {};

type Answer = { id: string; score: number; csatLinkQuestion: { id: string; text: string } };

export function EditCsatResponseForm({
  responseId,
  answers,
  respondentName,
  comment,
}: {
  responseId: string;
  answers: Answer[];
  respondentName: string | null;
  comment: string | null;
}) {
  const [state, formAction, pending] = useActionState(editCsatResponseAction, initialState);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(answers.map((a) => [a.id, a.score]))
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="responseId" value={responseId} />
      {answers.map((a) => (
        <div key={a.id} className="space-y-2">
          <input type="hidden" name="answerId" value={a.id} />
          <input type="hidden" name="answerScore" value={scores[a.id] ?? a.score} />
          <Label>{a.csatLinkQuestion.text}</Label>
          <StarRating
            value={scores[a.id] ?? a.score}
            onChange={(value) => setScores((prev) => ({ ...prev, [a.id]: value }))}
          />
        </div>
      ))}

      <div className="space-y-2">
        <Label htmlFor="respondentName">Respondent name</Label>
        <Input id="respondentName" name="respondentName" defaultValue={respondentName ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea id="comment" name="comment" rows={3} defaultValue={comment ?? ""} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
