"use client";

import { api } from "@/lib/api";
import { UserForm } from "@/components/UserForm";

export default function NewUserPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Add User</h1>
      <div className="mt-5">
        <UserForm onSubmit={(input) => api.createUser(input)} submitLabel="Create user" />
      </div>
    </div>
  );
}
