"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type Wishlist, type User, type Product } from "@/lib/api";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toClear, setToClear] = useState<Wishlist | null>(null);
  const [clearing, setClearing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([api.wishlists(), api.users(), api.products()])
      .then(([wishlists, users, products]) => {
        setWishlists(wishlists.filter((w) => w.productIds.length > 0));
        setUsers(users);
        setProducts(products);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const userName = (userId: string) => users.find((u) => u.userId === userId)?.name ?? userId;
  const userEmail = (userId: string) => users.find((u) => u.userId === userId)?.email ?? "";
  const productName = (productId: string) => products.find((p) => p.productId === productId)?.name ?? productId;

  const visible = useMemo(() => {
    if (!query.trim()) return wishlists;
    const q = query.trim().toLowerCase();
    return wishlists.filter(
      (w) => userName(w.userId).toLowerCase().includes(q) || userEmail(w.userId).toLowerCase().includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlists, query, users]);

  async function confirmClear() {
    if (!toClear) return;
    setClearing(true);
    try {
      await api.deleteWishlist(toClear.userId);
      setWishlists((prev) => prev.filter((w) => w.userId !== toClear.userId));
      toast.success(`Cleared ${userName(toClear.userId)}'s wishlist.`);
      setToClear(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear wishlist.");
    } finally {
      setClearing(false);
    }
  }

  async function removeItem(wishlist: Wishlist, productId: string) {
    const productIds = wishlist.productIds.filter((id) => id !== productId);
    try {
      const updated = await api.updateWishlist(wishlist.userId, productIds);
      setWishlists((prev) =>
        updated.productIds.length === 0
          ? prev.filter((w) => w.userId !== wishlist.userId)
          : prev.map((w) => (w.userId === wishlist.userId ? updated : w))
      );
      toast.success(`Removed "${productName(productId)}" from ${userName(wishlist.userId)}'s wishlist.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove item.");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Wishlists</h1>
      <p className="mt-1 text-sm text-slate-500">Only users with items currently in their wishlist are listed.</p>

      <div className="mt-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by user..."
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none sm:w-64"
        />
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
            {query ? "No results match your search." : "No active wishlists right now."}
          </p>
        ) : (
          visible.map((wishlist) => (
            <div key={wishlist.userId} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{userName(wishlist.userId)}</div>
                  <div className="text-xs text-slate-500">{userEmail(wishlist.userId)}</div>
                </div>
                <Button variant="danger" onClick={() => setToClear(wishlist)}>
                  Clear wishlist
                </Button>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {wishlist.productIds.map((productId) => (
                  <li
                    key={productId}
                    className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-2.5 pr-1.5 text-slate-700"
                  >
                    {productName(productId)}
                    <button
                      type="button"
                      onClick={() => removeItem(wishlist, productId)}
                      className="rounded-full px-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                      aria-label={`Remove ${productName(productId)} from ${userName(wishlist.userId)}'s wishlist`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={toClear !== null}
        title={`Clear ${toClear ? userName(toClear.userId) : ""}'s wishlist?`}
        description="This can't be undone."
        confirmLabel="Clear wishlist"
        busy={clearing}
        onConfirm={confirmClear}
        onCancel={() => setToClear(null)}
      />
    </div>
  );
}
