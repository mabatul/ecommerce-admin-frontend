"use client";

import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { ButtonLink, Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api
      .users()
      .then((users) => {
        setUsers(users);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteUser(toDelete.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== toDelete.userId));
      toast.success(`Deleted "${toDelete.name}".`);
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Users</h1>
      <p className="mt-1 text-sm text-slate-500">
        Accounts are created by people signing up on the storefront, not from here — admins can view, edit their
        info, or remove an account, but not create one.
      </p>

      <div className="mt-4">
        <DataTable
          rows={users}
          rowKey={(u) => u.userId}
          loading={loading}
          error={error}
          searchPlaceholder="Search users..."
          emptyMessage="No users yet — run the seed script (see README)."
          columns={[
            { header: "Name", cell: (u) => u.name, searchValue: (u) => u.name },
            { header: "Email", cell: (u) => u.email, searchValue: (u) => u.email },
            {
              header: "Role",
              cell: (u) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === "admin" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {u.role}
                </span>
              ),
            },
          ]}
          actions={(u) => (
            <div className="flex justify-end gap-2">
              <ButtonLink href={`/users/${u.userId}`} variant="secondary">
                View
              </ButtonLink>
              <Button variant="danger" onClick={() => setToDelete(u)}>
                Delete
              </Button>
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete "${toDelete?.name}"?`}
        description="This can't be undone — their cart and wishlist will still reference this user id."
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
