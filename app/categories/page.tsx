"use client";

import { useEffect, useState } from "react";
import { api, type Category, type Product } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { ButtonLink, Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([api.categories(), api.products()])
      .then(([categories, products]) => {
        setCategories(categories);
        setProducts(products);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const productCount = (categoryId: string) => products.filter((p) => p.categoryId === categoryId).length;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteCategory(toDelete.categoryId);
      setCategories((prev) => prev.filter((c) => c.categoryId !== toDelete.categoryId));
      toast.success(`Deleted "${toDelete.name}".`);
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  }

  const affectedProducts = toDelete ? productCount(toDelete.categoryId) : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Categories</h1>
        <ButtonLink href="/categories/new">Add Category</ButtonLink>
      </div>

      <div className="mt-4">
        <DataTable
          rows={categories}
          rowKey={(c) => c.categoryId}
          loading={loading}
          error={error}
          searchPlaceholder="Search categories..."
          emptyMessage="No categories yet — add one to start organizing products."
          columns={[
            { header: "Name", cell: (c) => c.name, searchValue: (c) => c.name },
            { header: "Description", cell: (c) => c.description || <span className="text-slate-400">—</span> },
            { header: "Products", cell: (c) => productCount(c.categoryId) },
          ]}
          actions={(c) => (
            <div className="flex justify-end gap-2">
              <ButtonLink href={`/categories/${c.categoryId}/edit`} variant="secondary">
                Edit
              </ButtonLink>
              <Button variant="danger" onClick={() => setToDelete(c)}>
                Delete
              </Button>
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete "${toDelete?.name}"?`}
        description={
          affectedProducts > 0
            ? `This can't be undone. ${affectedProducts} product${affectedProducts === 1 ? " still references" : "s still reference"} this category.`
            : "This can't be undone."
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
