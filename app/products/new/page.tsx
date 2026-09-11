"use client";

import { useEffect, useState } from "react";
import { api, type Category } from "@/lib/api";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories().then(setCategories).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Add Product</h1>
      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <ProductForm categories={categories} onSubmit={(input) => api.createProduct(input)} submitLabel="Create product" />
        )}
      </div>
    </div>
  );
}
