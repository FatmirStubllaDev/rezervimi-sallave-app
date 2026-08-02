"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Reservation, Room } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";

type View = "day" | "week" | "month";

export default function CalendarPage() {
  const token = useAuthStore((s) => s.token);
  const { t } = useLocaleStore();
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState("");

  const range = useMemo(() => getRange(anchor, view), [anchor, view]);

  useEffect(() => {
    if (!token) return;
    api.rooms(token, true).then(setRooms).catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    api
      .calendar(token, {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        roomId: roomId || undefined,
      })
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [token, range.from, range.to, roomId]);

  if (!token) return <p className="text-[var(--muted)]">{t("login")}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl">
            {t("calendar")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {range.from.toLocaleDateString()} – {range.to.toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month"] as View[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? "default" : "outline"}
              onClick={() => setView(v)}
            >
              {t(v)}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAnchor(shift(anchor, view, -1))}
          >
            ‹
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAnchor(shift(anchor, view, 1))}
          >
            ›
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 text-sm"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        >
          <option value="">{t("room")}: all</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-3 text-xs">
          {rooms.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: r.color }}
              />
              {r.name}
            </span>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="space-y-3">
        {items.map((r) => (
          <article
            key={r.id}
            className="border border-[var(--line)] bg-[var(--paper)] p-4"
            style={{ borderLeft: `4px solid ${r.room.color}` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">{r.title}</h2>
              <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {t(r.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {r.room.name} · {r.user.firstName} {r.user.lastName} ·{" "}
              {new Date(r.startDateTime).toLocaleString()} –{" "}
              {new Date(r.endDateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </article>
        ))}
        {!items.length && (
          <p className="text-sm text-[var(--muted)]">{t("noData")}</p>
        )}
      </div>
    </div>
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function getRange(anchor: Date, view: View) {
  const from = startOfDay(anchor);
  const to = new Date(from);
  if (view === "day") {
    to.setHours(23, 59, 59, 999);
  } else if (view === "week") {
    const day = from.getDay() || 7;
    from.setDate(from.getDate() - day + 1);
    to.setTime(from.getTime());
    to.setDate(from.getDate() + 6);
    to.setHours(23, 59, 59, 999);
  } else {
    from.setDate(1);
    to.setMonth(from.getMonth() + 1, 0);
    to.setHours(23, 59, 59, 999);
  }
  return { from, to };
}

function shift(anchor: Date, view: View, dir: number) {
  const next = new Date(anchor);
  if (view === "day") next.setDate(next.getDate() + dir);
  else if (view === "week") next.setDate(next.getDate() + 7 * dir);
  else next.setMonth(next.getMonth() + dir);
  return next;
}
