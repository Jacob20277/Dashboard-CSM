"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserAction, type UserFormState } from "./actions";

const initialState: UserFormState = {};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Temp password</Label>
        <Input id="password" name="password" type="text" minLength={8} required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add member"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
