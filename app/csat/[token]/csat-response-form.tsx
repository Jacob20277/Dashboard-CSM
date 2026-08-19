"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CsatResponseFormState } from "./actions";

const initialState: CsatResponseFormState = {};

export function CsatResponseForm({
  action,
}: {
  action: (prev: CsatResponseFormState, formData: FormData) => Promise<CsatResponseFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);

  if (state?.success) {
    return (
      <p className="text-center text-sm font-medium">Thanks for your feedback!</p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="score" value={score} />
      <div className="space-y-2">
        <Label>How satisfied are you with our service?</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => setScore(value)}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl leading-none"
            >
              {(hovered || score) >= value ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="respondentName">Your name (optional)</Label>
        <Input id="respondentName" name="respondentName" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comments (optional)</Label>
        <Textarea id="comment" name="comment" rows={3} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending || score === 0}>
        {pending ? "Submitting..." : "Submit feedback"}
      </Button>
    </form>
  );
}
