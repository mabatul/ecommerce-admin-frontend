"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, type Category, type Product, type ProductInput } from "@/lib/api";
import { FormField, fieldInputClass } from "@/components/FormField";
import { Button, ButtonLink } from "@/components/Button";
import { useToast } from "@/components/Toast";

interface ProductFormProps {
  categories: Category[];
  initial?: Product;
  onSubmit: (input: ProductInput) => Promise<unknown>;
  submitLabel: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  categoryId?: string;
  stock?: string;
}

export function ProductForm({ categories, initial, onSubmit, submitLabel }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.categoryId ?? "");
  const [stock, setStock] = useState(initial ? String(initial.stock) : "0");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    const priceNum = Number(price);
    if (price.trim() === "" || Number.isNaN(priceNum) || priceNum < 0) next.price = "Enter a valid price (0 or more).";
    if (!categoryId) next.categoryId = "Select a category.";
    const stockNum = Number(stock);
    if (stock.trim() === "" || !Number.isInteger(stockNum) || stockNum < 0) next.stock = "Enter a whole number, 0 or more.";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        productId: initial?.productId ?? "",
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        categoryId,
        stock: Number(stock),
      });
      toast.success(initial ? "Product updated." : "Product created.");
      router.push("/products");
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

      <FormField label="Description (optional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={fieldInputClass}
        />
      </FormField>

      <FormField label="Category" error={errors.categoryId}>
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">
            No categories yet —{" "}
            <a href="/categories/new" className="underline">
              add one first
            </a>
            .
          </p>
        ) : (
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={fieldInputClass}>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="flex gap-4">
        <FormField label="Price (USD)" error={errors.price}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={fieldInputClass}
          />
        </FormField>

        <FormField label="Stock" error={errors.stock}>
          <input
            type="number"
            step="1"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={fieldInputClass}
          />
        </FormField>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting || categories.length === 0}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
        <ButtonLink href="/products" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
