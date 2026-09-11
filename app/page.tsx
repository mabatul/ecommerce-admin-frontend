"use client";

import { useEffect, useState } from "react";
import { api, type Stats, type Health } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.stats(), api.health()])
      .then(([stats, health]) => {
        setStats(stats);
        setHealth(health);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        {health ? (
          <>
            backend: <span className="font-medium text-slate-700">{health.status}</span> · environment:{" "}
            <span className="font-medium text-slate-700">{health.environment}</span> · data source:{" "}
            <span className="font-medium text-slate-700">{health.backedBy}</span>
          </>
        ) : error ? (
          <span className="text-red-600">Could not reach backend: {error}</span>
        ) : (
          "Connecting to backend..."
        )}
      </p>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats?.totalUsers} loading={loading} />
        <StatCard label="Total Products" value={stats?.totalProducts} loading={loading} />
        <StatCard label="Total Categories" value={stats?.totalCategories} loading={loading} />
        <StatCard label="Cart Items" value={stats?.cartItems} loading={loading} />
        <StatCard label="Wishlist Items" value={stats?.wishlistItems} loading={loading} />
      </section>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {stats && (
        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <ActivityList
            title="Recently added products"
            items={stats.recentProducts.map((p) => ({ id: p.productId, primary: p.name, secondary: `$${p.price.toFixed(2)}` }))}
            emptyMessage="No products yet."
          />
          <ActivityList
            title="Recently added users"
            items={stats.recentUsers.map((u) => ({ id: u.userId, primary: u.name, secondary: u.email }))}
            emptyMessage="No users yet."
          />
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {loading ? <span className="text-slate-300">—</span> : value ?? 0}
      </div>
    </div>
  );
}

function ActivityList({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: { id: string; primary: string; secondary: string }[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-800">{item.primary}</span>
              <span className="text-slate-400">{item.secondary}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
