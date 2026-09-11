"use client";

import { api } from "@/lib/api";
import { CategoryForm } from "@/components/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Add Category</h1>
      <div className="mt-5">
        <CategoryForm onSubmit={(input) => api.createCategory(input)} submitLabel="Create category" />
      </div>
    </div>
  );
}
