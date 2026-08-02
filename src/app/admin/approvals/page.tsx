"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Reservation, SentEmail } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { EmailResultBanner } from "@/components/email-result-banner";

export default function ApprovalsPage() {
  const { user, token } = useAuthStore();
  const { t, locale } = useLocaleStore();
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState("");
  const [emails, setEmails] = useState<SentEmail[]>([]);

  const load = () => {
    if (!token) return;
    api
      .allReservations(token, "PENDING")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  };

  useEffect(load, [token]);

  if (!token || user?.role !== "ADMIN") {
    return <p className="text-[var(--muted)]">Admin only</p>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        {t("pendingApprovals")}
      </h1>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <EmailResultBanner emails={emails} />
      <div className="space-y-3">
        {items.map((r) => (
          <article key={r.id} className="surface-card p-4">
            <p className="font-medium">{r.title}</p>
            <p className="text-sm text-[var(--muted)]">
              {r.room.name} · {r.user.firstName} {r.user.lastName} ·{" "}
              {r.user.email} · {formatDateTime(r.startDateTime, locale)} ·{" "}
              {r.participants} pax
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="accent"
                onClick={async () => {
                  try {
                    setError("");
                    const result = await api.approve(token, r.id);
                    setEmails(result.emails ?? []);
                    load();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Approve failed");
                  }
                }}
              >
                {t("approve")}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  const reason = window.prompt("Reason / Arsyeja") || undefined;
                  try {
                    setError("");
                    const result = await api.reject(token, r.id, reason);
                    setEmails(result.emails ?? []);
                    load();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Reject failed");
                  }
                }}
              >
                {t("reject")}
              </Button>
            </div>
          </article>
        ))}
        {!items.length && (
          <p className="text-sm text-[var(--muted)]">{t("noData")}</p>
        )}
      </div>
    </div>
  );
}
