"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type User, type Cart, type Wishlist } from "@/lib/api";
import { FormField, fieldInputClass } from "@/components/FormField";
import { Button, ButtonLink } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "customer">("customer");
  const [formError, setFormError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([api.user(userId), api.cart(userId), api.wishlist(userId)])
      .then(([user, cart, wishlist]) => {
        setUser(user);
        setCart(cart);
        setWishlist(wishlist);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    setFormError(undefined);
    setSaving(true);
    try {
      const updated = await api.updateUser(userId, { userId, name: name.trim(), email: email.trim(), role });
      setUser(updated);
      setEditing(false);
      toast.success("User updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteUser(userId);
      toast.success("User deleted.");
      router.push("/users");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user.");
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!user) return null;

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{user.name}</h1>
        {!editing && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <FormField label="Name" error={formError}>
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldInputClass} />
          </FormField>
          <FormField label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldInputClass} />
          </FormField>
          <FormField label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "customer")} className={fieldInputClass}>
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role} />
          <Row label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        </dl>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Cart items</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{cart?.items.length ?? 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Wishlist items</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{wishlist?.productIds.length ?? 0}</div>
        </div>
      </div>

      <div className="mt-6">
        <ButtonLink href="/users" variant="secondary">
          Back to users
        </ButtonLink>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${user.name}"?`}
        description="This can't be undone."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
