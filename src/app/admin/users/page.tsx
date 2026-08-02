"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const createSchema = z.object({
  email: z.string().email(),
  adUsername: z.string().min(2),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  department: z.string().min(2),
  position: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]),
});

const editSchema = createSchema.extend({
  password: z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

export default function AdminUsersPage() {
  const { user, token } = useAuthStore();
  const t = useLocaleStore((s) => s.t);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<
    { id: string; groupName: string; description?: string; isActive: boolean }[]
  >([]);
  const [groupName, setGroupName] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      role: "USER",
      department: "General",
      password: "password123",
    },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  });

  const load = async () => {
    if (!token) return;
    setUsers(await api.users(token));
    setGroups(await api.groups(token));
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!editing) return;
    editForm.reset({
      email: editing.email,
      adUsername: editing.adUsername,
      firstName: editing.firstName,
      lastName: editing.lastName,
      department: editing.department,
      position: editing.position || "",
      role: editing.role,
      password: "",
    });
  }, [editing, editForm]);

  if (!token || user?.role !== "ADMIN") {
    return <p className="text-[var(--muted)]">Admin only</p>;
  }

  return (
    <div className="space-y-10 animate-fade-up">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {t("users")}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Create, edit, enable/disable, and delete Microsoft-account users.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <section className="surface-card p-5 sm:p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl">
          Create user
        </h2>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={createForm.handleSubmit(async (values) => {
            try {
              setError("");
              setMessage("");
              await api.createUser(token, values);
              createForm.reset({
                role: "USER",
                department: "General",
                password: "password123",
                email: "",
                adUsername: "",
                firstName: "",
                lastName: "",
                position: "",
              });
              setMessage("User created");
              await load();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Create failed");
            }
          })}
        >
          <div>
            <Label>Email (Microsoft)</Label>
            <Input
              type="email"
              placeholder="name.surname@outlook.com"
              {...createForm.register("email")}
            />
          </div>
          <div>
            <Label>AD username</Label>
            <Input
              placeholder="name.surname"
              {...createForm.register("adUsername")}
            />
          </div>
          <div>
            <Label>First name</Label>
            <Input {...createForm.register("firstName")} />
          </div>
          <div>
            <Label>Last name</Label>
            <Input {...createForm.register("lastName")} />
          </div>
          <div>
            <Label>Department</Label>
            <Input {...createForm.register("department")} />
          </div>
          <div>
            <Label>Position</Label>
            <Input {...createForm.register("position")} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" {...createForm.register("password")} />
          </div>
          <div>
            <Label>Role</Label>
            <select
              className="flex h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm"
              {...createForm.register("role")}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="accent">
              Create user
            </Button>
          </div>
        </form>
      </section>

      {editing && (
        <section className="surface-card border-[var(--accent)] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              Edit user
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              Close
            </Button>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={editForm.handleSubmit(async (values) => {
              try {
                setError("");
                setMessage("");
                const payload = {
                  ...values,
                  password: values.password?.trim() || undefined,
                };
                await api.updateUser(token, editing.id, payload);
                setEditing(null);
                setMessage("User updated");
                await load();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Update failed");
              }
            })}
          >
            <div>
              <Label>Email</Label>
              <Input type="email" {...editForm.register("email")} />
            </div>
            <div>
              <Label>AD username</Label>
              <Input {...editForm.register("adUsername")} />
            </div>
            <div>
              <Label>First name</Label>
              <Input {...editForm.register("firstName")} />
            </div>
            <div>
              <Label>Last name</Label>
              <Input {...editForm.register("lastName")} />
            </div>
            <div>
              <Label>Department</Label>
              <Input {...editForm.register("department")} />
            </div>
            <div>
              <Label>Position</Label>
              <Input {...editForm.register("position")} />
            </div>
            <div>
              <Label>New password (optional)</Label>
              <Input type="password" {...editForm.register("password")} />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="flex h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm"
                {...editForm.register("role")}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" variant="accent">
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          All users
        </h2>
        {users.map((u) => (
          <div
            key={u.id}
            className="surface-card flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {u.firstName} {u.lastName}{" "}
                <span className="text-[var(--muted)]">({u.adUsername})</span>
              </p>
              <p className="text-sm text-[var(--muted)]">
                {u.email} · {u.department} · {u.role}
                {!u.isActive ? " · inactive" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(u)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await api.setUserActive(token, u.id, !u.isActive);
                  load();
                }}
              >
                {u.isActive ? "Disable" : "Enable"}
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={u.id === user.id}
                onClick={async () => {
                  if (!window.confirm(`Delete ${u.email}?`)) return;
                  try {
                    setError("");
                    await api.deleteUser(token, u.id);
                    setMessage("User deleted");
                    if (editing?.id === u.id) setEditing(null);
                    await load();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Delete failed");
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">
          {t("access")}
        </h2>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await api.addGroup(token, { groupName });
            setGroupName("");
            load();
          }}
        >
          <Input
            placeholder="MRRS-Users"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Button type="submit">{t("save")}</Button>
        </form>
        {groups.map((g) => (
          <div
            key={g.id}
            className="surface-card flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="font-medium">{g.groupName}</p>
              <p className="text-sm text-[var(--muted)]">{g.description}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await api.setGroupActive(token, g.id, !g.isActive);
                load();
              }}
            >
              {g.isActive ? "Disable" : "Enable"}
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
