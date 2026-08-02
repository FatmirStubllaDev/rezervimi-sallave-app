"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Reservation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default function MyReservationsPage() {
  const token = useAuthStore((s) => s.token);
  const { t, locale } = useLocaleStore();
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState("");

  const load = () => {
    if (!token) return;
    api
      .myReservations(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  };

  useEffect(load, [token]);

  if (!token) return <p className="text-[var(--muted)]">{t("login")}</p>;

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {t("myReservations")}
      </h1>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="space-y-3">
        {items.map((r) => (
          <article
            key={r.id}
            className="surface-card flex flex-wrap items-center justify-between gap-3 p-4"
            style={{ borderLeft: `4px solid ${r.room.color}` }}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{r.title}</p>
                <StatusBadge status={r.status} label={t(r.status)} />
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {r.room.name} · {formatDateTime(r.startDateTime, locale)}
              </p>
            </div>
            {["PENDING", "APPROVED"].includes(r.status) && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await api.cancel(token, r.id);
                  load();
                }}
              >
                {t("cancel")}
              </Button>
            )}
          </article>
        ))}
        {!items.length && (
          <p className="text-sm text-[var(--muted)]">{t("noData")}</p>
        )}
      </div>
    </div>
  );
}
