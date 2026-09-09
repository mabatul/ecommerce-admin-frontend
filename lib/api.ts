// The browser calls the backend directly; the URL comes entirely from
// config (NEXT_PUBLIC_API_URL), never hardcoded, so the same build works
// against the local backend container, dev, or prod.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }
  return response.json();
}

export interface Product {
  productId: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
}

export interface Category {
  categoryId: string;
  name: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export const api = {
  health: () => get<{ status: string; environment: string; backedBy: string }>("/api/health"),
  products: () => get<Product[]>("/api/products"),
  categories: () => get<Category[]>("/api/categories"),
  users: () => get<User[]>("/api/users"),
};
