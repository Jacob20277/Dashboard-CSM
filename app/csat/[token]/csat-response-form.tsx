"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import type { CsatResponseFormState } from "./actions";

const initialState: CsatResponseFormState = {};

type Question = { id: string; text: string };

export function CsatResponseForm({
  action,
  questions,
}: {
  action: (prev: CsatResponseFormState, formData: FormData) => Promise<CsatResponseFormState>;
  questions: Question[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [scores, setScores] = useState<Record<string, number>>({});

  if (state?.success) {
    return <p className="text-center text-sm font-medium">Thanks for your feedback!</p>;
  }

  const allAnswered = questions.every((q) => (scores[q.id] ?? 0) > 0);

  return (
    <form action={formAction} className="space-y-5">
      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <input type="hidden" name="questionId" value={q.id} />
          <input type="hidden" name="score" value={scores[q.id] ?? 0} />
          <Label>{q.text}</Label>
          <StarRating
            value={scores[q.id] ?? 0}
            onChange={(value) => setScores((prev) => ({ ...prev, [q.id]: value }))}
          />
        </div>
      ))}

      <div className="space-y-2">
        <Label htmlFor="respondentName">Your name (optional)</Label>
        <Input id="respondentName" name="respondentName" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comments (optional)</Label>
        <Textarea id="comment" name="comment" rows={3} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending || !allAnswered}>
        {pending ? "Submitting..." : "Submit feedback"}
      </Button>
    </form>
  );
}
