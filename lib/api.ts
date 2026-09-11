// The browser calls the backend directly; the URL comes entirely from
// config (NEXT_PUBLIC_API_URL), never hardcoded, so the same build works
// against the local backend container, dev, or prod.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

export interface Product {
  productId: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  stock: number;
  createdAt: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string | null;
}

export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: string | null;
}

export interface Health {
  status: string;
  environment: string;
  backedBy: string;
}

export interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  cartItems: number;
  wishlistItems: number;
  recentProducts: Product[];
  recentUsers: User[];
}

export type ProductInput = Omit<Product, "createdAt">;
export type CategoryInput = Category;
export type UserInput = Omit<User, "createdAt">;

export const api = {
  health: () => get<Health>("/api/health"),
  stats: () => get<Stats>("/api/stats"),

  products: () => get<Product[]>("/api/products"),
  product: (id: string) => get<Product>(`/api/products/${id}`),
  createProduct: (input: ProductInput) => post<Product>("/api/products", input),
  updateProduct: (id: string, input: ProductInput) => put<Product>(`/api/products/${id}`, input),
  deleteProduct: (id: string) => del<void>(`/api/products/${id}`),

  categories: () => get<Category[]>("/api/categories"),
  category: (id: string) => get<Category>(`/api/categories/${id}`),
  createCategory: (input: CategoryInput) => post<Category>("/api/categories", input),
  updateCategory: (id: string, input: CategoryInput) => put<Category>(`/api/categories/${id}`, input),
  deleteCategory: (id: string) => del<void>(`/api/categories/${id}`),

  users: () => get<User[]>("/api/users"),
  user: (id: string) => get<User>(`/api/users/${id}`),
  createUser: (input: UserInput) => post<User>("/api/users", input),
  updateUser: (id: string, input: UserInput) => put<User>(`/api/users/${id}`, input),
  deleteUser: (id: string) => del<void>(`/api/users/${id}`),

  carts: () => get<Cart[]>("/api/carts"),
  cart: (userId: string) => get<Cart>(`/api/carts/${userId}`),
  deleteCart: (userId: string) => del<void>(`/api/carts/${userId}`),

  wishlists: () => get<Wishlist[]>("/api/wishlists"),
  wishlist: (userId: string) => get<Wishlist>(`/api/wishlists/${userId}`),
  deleteWishlist: (userId: string) => del<void>(`/api/wishlists/${userId}`),
};
