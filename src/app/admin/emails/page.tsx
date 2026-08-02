"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type OutboxItem = {
  id: string;
  to: string;
  subject: string;
  mode: string;
  previewUrl?: string;
  error?: string;
  createdAt: string;
};

export default function EmailOutboxPage() {
  const { user, token } = useAuthStore();
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .emailOutbox(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [token]);

  if (!token || user?.role !== "ADMIN") {
    return <p className="text-[var(--muted)]">Admin only</p>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Email outbox
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Recent reservation emails. In local/dev mode, open the Ethereal preview
          link to read the message.
        </p>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="surface-card p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{item.subject}</p>
              <span className="text-xs uppercase text-[var(--muted)]">
                {item.mode}
              </span>
            </div>
            <p className="mt-1 text-[var(--muted)]">
              To: {item.to} · {new Date(item.createdAt).toLocaleString()}
            </p>
            {item.previewUrl && (
              <a
                href={item.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-semibold text-[var(--accent)] underline"
              >
                Open email preview
              </a>
            )}
            {item.error && (
              <p className="mt-2 text-red-700">{item.error}</p>
            )}
          </article>
        ))}
        {!items.length && (
          <p className="text-sm text-[var(--muted)]">
            No emails sent yet. Create or approve a reservation first.
          </p>
        )}
      </div>
    </div>
  );
}
