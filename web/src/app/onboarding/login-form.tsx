"use client";

import { useActionState } from "react";
import { CircleAlertIcon } from "lucide-react";
import { login } from "@/app/actions";
import { Crab } from "@/components/crab";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="name">Your name</FieldLabel>
          <Input
            id="name"
            name="name"
            required
            maxLength={80}
            autoComplete="name"
            aria-invalid={error ? true : undefined}
          />
          <FieldDescription>There are no passwords yet, so we find your profile by name.</FieldDescription>
        </Field>
        {error && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle className="line-clamp-none">{error}</AlertTitle>
          </Alert>
        )}
        <Button disabled={pending} className="w-full">
          {pending && <Crab size={24} walking />}
          {pending ? "One moment…" : "Log in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
