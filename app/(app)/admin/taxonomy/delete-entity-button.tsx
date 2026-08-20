"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TaxonomyFormState } from "./actions";

const initialState: TaxonomyFormState = {};

export function DeleteEntityButton({
  action,
  id,
  confirmTitle,
}: {
  action: (prev: TaxonomyFormState, formData: FormData) => Promise<TaxonomyFormState>;
  id: string;
  confirmTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" type="button" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmTitle}</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction}>
          <input type="hidden" name="id" value={id} />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting..." : "Confirm delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
