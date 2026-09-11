"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type Category } from "@/lib/api";
import { CategoryForm } from "@/components/CategoryForm";

export default function EditCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .category(categoryId)
      .then(setCategory)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Edit Category</h1>
      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : category ? (
          <CategoryForm
            initial={category}
            onSubmit={(input) => api.updateCategory(categoryId, input)}
            submitLabel="Save changes"
          />
        ) : null}
      </div>
    </div>
  );
}
