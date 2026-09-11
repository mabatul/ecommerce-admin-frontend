"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type Category, type Product } from "@/lib/api";
import { ProductForm } from "@/components/ProductForm";

// Client-side data fetching by id (not generateStaticParams) — this page
// only ever runs in the regular Next.js server deploy (Dockerfile.ci),
// not the STATIC_EXPORT=true S3 build; see next.config.js.
export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.product(productId), api.categories()])
      .then(([product, categories]) => {
        setProduct(product);
        setCategories(categories);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Edit Product</h1>
      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : product ? (
          <ProductForm
            categories={categories}
            initial={product}
            onSubmit={(input) => api.updateProduct(productId, input)}
            submitLabel="Save changes"
          />
        ) : null}
      </div>
    </div>
  );
}
