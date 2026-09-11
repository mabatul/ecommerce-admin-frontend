"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { type User, type UserInput } from "@/lib/api";
import { FormField, fieldInputClass } from "@/components/FormField";
import { Button, ButtonLink } from "@/components/Button";
import { useToast } from "@/components/Toast";

interface UserFormProps {
  initial?: User;
  onSubmit: (input: UserInput) => Promise<unknown>;
  submitLabel: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserForm({ initial, onSubmit, submitLabel }: UserFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<"admin" | "customer">(initial?.role ?? "customer");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim() || !emailPattern.test(email.trim())) next.email = "Enter a valid email address.";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({ userId: initial?.userId ?? "", name: name.trim(), email: email.trim(), role });
      toast.success(initial ? "User updated." : "User created.");
      router.push("/users");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <FormField label="Name" error={errors.name}>
        <input value={name} onChange={(e) => setName(e.target.value)} className={fieldInputClass} />
      </FormField>

      <FormField label="Email" error={errors.email}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldInputClass} />
      </FormField>

      <FormField label="Role">
        <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "customer")} className={fieldInputClass}>
          <option value="customer">customer</option>
          <option value="admin">admin</option>
        </select>
      </FormField>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
        <ButtonLink href="/users" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
