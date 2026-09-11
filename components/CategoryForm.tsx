"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { type Category, type CategoryInput } from "@/lib/api";
import { FormField, fieldInputClass } from "@/components/FormField";
import { Button, ButtonLink } from "@/components/Button";
import { useToast } from "@/components/Toast";

interface CategoryFormProps {
  initial?: Category;
  onSubmit: (input: CategoryInput) => Promise<unknown>;
  submitLabel: string;
}

export function CategoryForm({ initial, onSubmit, submitLabel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [nameError, setNameError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Name is required.");
      return;
    }
    setNameError(undefined);
    setSubmitting(true);
    try {
      await onSubmit({
        categoryId: initial?.categoryId ?? "",
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success(initial ? "Category updated." : "Category created.");
      router.push("/categories");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <FormField label="Name" error={nameError}>
        <input value={name} onChange={(e) => setName(e.target.value)} className={fieldInputClass} />
      </FormField>

      <FormField label="Description (optional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={fieldInputClass}
        />
      </FormField>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
        <ButtonLink href="/categories" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
