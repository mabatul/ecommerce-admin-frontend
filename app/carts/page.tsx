"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type Cart, type User, type Product } from "@/lib/api";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function CartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toClear, setToClear] = useState<Cart | null>(null);
  const [clearing, setClearing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([api.carts(), api.users(), api.products()])
      .then(([carts, users, products]) => {
        setCarts(carts.filter((c) => c.items.length > 0));
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
    if (!query.trim()) return carts;
    const q = query.trim().toLowerCase();
    return carts.filter((c) => userName(c.userId).toLowerCase().includes(q) || userEmail(c.userId).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carts, query, users]);

  async function confirmClear() {
    if (!toClear) return;
    setClearing(true);
    try {
      await api.deleteCart(toClear.userId);
      setCarts((prev) => prev.filter((c) => c.userId !== toClear.userId));
      toast.success(`Cleared ${userName(toClear.userId)}'s cart.`);
      setToClear(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear cart.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Carts</h1>
      <p className="mt-1 text-sm text-slate-500">Only users with items currently in their cart are listed.</p>

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
            {query ? "No results match your search." : "No active carts right now."}
          </p>
        ) : (
          visible.map((cart) => (
            <div key={cart.userId} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{userName(cart.userId)}</div>
                  <div className="text-xs text-slate-500">{userEmail(cart.userId)}</div>
                </div>
                <Button variant="danger" onClick={() => setToClear(cart)}>
                  Clear cart
                </Button>
              </div>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {cart.items.map((item) => (
                  <li key={item.productId} className="flex justify-between py-1.5">
                    <span className="text-slate-700">{productName(item.productId)}</span>
                    <span className="text-slate-400">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={toClear !== null}
        title={`Clear ${toClear ? userName(toClear.userId) : ""}'s cart?`}
        description="This can't be undone."
        confirmLabel="Clear cart"
        busy={clearing}
        onConfirm={confirmClear}
        onCancel={() => setToClear(null)}
      />
    </div>
  );
}
