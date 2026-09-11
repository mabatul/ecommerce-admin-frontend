"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type Product, type Category } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { ButtonLink, Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([api.products(), api.categories()])
      .then(([products, categories]) => {
        setProducts(products);
        setCategories(categories);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const categoryName = (id: string) => categories.find((c) => c.categoryId === id)?.name ?? id;

  const visibleProducts = useMemo(
    () => (categoryFilter === "all" ? products : products.filter((p) => p.categoryId === categoryFilter)),
    [products, categoryFilter]
  );

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteProduct(toDelete.productId);
      setProducts((prev) => prev.filter((p) => p.productId !== toDelete.productId));
      toast.success(`Deleted "${toDelete.name}".`);
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Products</h1>
        <ButtonLink href="/products/new">Add Product</ButtonLink>
      </div>

      {categories.length > 0 && (
        <div className="mt-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3">
        <DataTable
          rows={visibleProducts}
          rowKey={(p) => p.productId}
          loading={loading}
          error={error}
          searchPlaceholder="Search products..."
          emptyMessage="No products yet — add one, or run the seed script (see README)."
          columns={[
            { header: "Name", cell: (p) => p.name, searchValue: (p) => p.name },
            { header: "Category", cell: (p) => categoryName(p.categoryId), searchValue: (p) => categoryName(p.categoryId) },
            { header: "Price", cell: (p) => `$${p.price.toFixed(2)}` },
            {
              header: "Stock",
              cell: (p) => (
                <span className={p.stock === 0 ? "font-medium text-red-600" : p.stock < 5 ? "font-medium text-amber-600" : ""}>
                  {p.stock}
                </span>
              ),
            },
          ]}
          actions={(p) => (
            <div className="flex justify-end gap-2">
              <ButtonLink href={`/products/${p.productId}/edit`} variant="secondary">
                Edit
              </ButtonLink>
              <Button variant="danger" onClick={() => setToDelete(p)}>
                Delete
              </Button>
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete "${toDelete?.name}"?`}
        description="This can't be undone."
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
