"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, DoorOpen, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const { t, locale } = useLocaleStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .dashboard(token)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [token]);

  if (!user || !token) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--ink)] text-white shadow-2xl">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(13,148,136,0.45), transparent 42%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.1), transparent 30%)",
          }}
        />
        <div className="relative grid min-h-[70vh] items-end gap-10 px-8 py-14 sm:px-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.24em] text-teal-200/90">
              Institutional booking
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-[1.05] sm:text-7xl">
              {t("appName")}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/75">{t("appFull")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login">
                <Button variant="accent" size="lg">
                  {t("login")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="surface-card animate-fade-up-delay space-y-4 bg-white/95 p-6 text-[var(--ink)]">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              What you can do
            </p>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li className="flex gap-2">
                <DoorOpen className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                Book P31–P38 and open balcony spaces
              </li>
              <li className="flex gap-2">
                <CalendarClock className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                Day, week and month calendar views
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                Approval workflow with Outlook email alerts
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
    );
  }
  if (!data) {
    return <p className="text-[var(--muted)]">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {user.department}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
            {t("dashboard")}
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            {user.firstName} {user.lastName} · {user.email}
          </p>
        </div>
        <Link href="/reservations/new">
          <Button variant="accent" size="lg">
            {t("newReservation")}
          </Button>
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-fade-up-delay">
        <StatCard title={t("freeRoomsToday")} value={data.freeRoomsToday.length} />
        <StatCard title={t("todaysMeetings")} value={data.todaysMeetings.length} />
        <StatCard title={t("pendingApprovals")} value={data.pendingApprovals.length} />
        <StatCard title={t("monthlyStats")} value={data.monthlyStats.totalApproved} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title={t("freeRoomsToday")}>
          {data.freeRoomsToday.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.freeRoomsToday.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center gap-3 rounded-xl bg-[var(--paper)] px-3 py-3 text-sm"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: room.color }}
                  />
                  <span>
                    <span className="block font-medium">{room.name}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {room.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty t={t} />
          )}
        </Panel>

        <Panel title={t("todaysMeetings")}>
          <ReservationList items={data.todaysMeetings} locale={locale} t={t} />
        </Panel>
        <Panel title={t("pendingApprovals")}>
          <ReservationList items={data.pendingApprovals} locale={locale} t={t} />
        </Panel>
        <Panel title={t("upcoming")}>
          <ReservationList items={data.upcoming} locale={locale} t={t} />
        </Panel>
      </section>

      <Panel title={t("utilization")}>
        <div className="space-y-4">
          {data.monthlyStats.utilization.map((u) => (
            <div key={u.roomId}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium">{u.roomName}</span>
                <span className="text-[var(--muted)]">
                  {u.utilizationPercent}% · {u.bookings}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--paper-soft)]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${u.utilizationPercent}%`,
                    background: u.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="surface-card p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ t }: { t: (k: "noData") => string }) {
  return <p className="text-sm text-[var(--muted)]">{t("noData")}</p>;
}

function ReservationList({
  items,
  locale,
  t,
}: {
  items: DashboardData["todaysMeetings"];
  locale: string;
  t: (
    k:
      | "noData"
      | "PENDING"
      | "APPROVED"
      | "REJECTED"
      | "CANCELLED"
      | "COMPLETED",
  ) => string;
}) {
  if (!items.length) return <Empty t={t} />;
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border border-[var(--line)] bg-[var(--paper)]/60 px-3 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: r.room.color }}
                />
                {r.title}
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {r.room.name} · {formatDateTime(r.startDateTime, locale)}
              </p>
            </div>
            <StatusBadge status={r.status} label={t(r.status)} />
          </div>
        </li>
      ))}
    </ul>
  );
}
