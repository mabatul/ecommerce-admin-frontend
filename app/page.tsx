"use client";

import { useEffect, useState } from "react";
import { api, type Product, type Category, type User } from "@/lib/api";

// Client-rendered on purpose: this page must also work as a static export
// served from S3 (no server available to fetch data at build/request time).
export default function DashboardPage() {
  const [health, setHealth] = useState<{ status: string; environment: string; backedBy: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.health(), api.products(), api.categories(), api.users()])
      .then(([health, products, categories, users]) => {
        setHealth(health);
        setProducts(products);
        setCategories(categories);
        setUsers(users);
      })
      .catch((err) => setError(err.message));
  }, []);

  const categoryName = (id: string) => categories.find((c) => c.categoryId === id)?.name ?? id;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ marginBottom: 0 }}>ecommerce-admin</h1>
      <p style={{ color: "#666" }}>
        {health ? (
          <>
            backend: <strong>{health.status}</strong> · environment: <strong>{health.environment}</strong> ·
            data source: <strong>{health.backedBy}</strong>
          </>
        ) : error ? (
          <span style={{ color: "crimson" }}>Could not reach backend: {error}</span>
        ) : (
          "Connecting to backend..."
        )}
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", margin: "1.5rem 0" }}>
        <StatCard label="Products" value={products.length} />
        <StatCard label="Categories" value={categories.length} />
        <StatCard label="Users" value={users.length} />
      </section>

      <h2>Products</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e2e2" }}>
            <th style={{ padding: "0.5rem" }}>Name</th>
            <th style={{ padding: "0.5rem" }}>Category</th>
            <th style={{ padding: "0.5rem" }}>Price</th>
            <th style={{ padding: "0.5rem" }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem" }}>{product.name}</td>
              <td style={{ padding: "0.5rem" }}>{categoryName(product.categoryId)}</td>
              <td style={{ padding: "0.5rem" }}>${product.price.toFixed(2)}</td>
              <td style={{ padding: "0.5rem" }}>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && !error && (
        <p style={{ color: "#999" }}>No products yet — run the seed script (see README).</p>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e2e2", borderRadius: 8, padding: "1rem" }}>
      <div style={{ fontSize: "0.8rem", color: "#666" }}>{label}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
