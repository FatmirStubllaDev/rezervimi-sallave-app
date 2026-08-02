"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
  const { user, token } = useAuthStore();
  const t = useLocaleStore((s) => s.t);
  const [from, setFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<{
    total: number;
    byRoom: { roomName: string; count: number; hours: number }[];
    byDepartment: { department: string; count: number }[];
  } | null>(null);

  if (!token || user?.role !== "ADMIN") {
    return <p className="text-[var(--muted)]">Admin only</p>;
  }

  const download = (kind: "excel" | "pdf") => {
    const url = api.exportUrl(
      kind,
      new Date(from).toISOString(),
      new Date(to + "T23:59:59").toISOString(),
    );
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = kind === "excel" ? "mrrs-report.xlsx" : "mrrs-report.pdf";
        a.click();
      });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        {t("reports")}
      </h1>
      <div className="grid max-w-xl gap-3 sm:grid-cols-2">
        <div>
          <Label>From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label>To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            const data = await api.reports(
              token,
              new Date(from).toISOString(),
              new Date(to + "T23:59:59").toISOString(),
            );
            setReport(data as never);
          }}
        >
          Generate
        </Button>
        <Button variant="outline" onClick={() => download("excel")}>
          {t("exportExcel")}
        </Button>
        <Button variant="outline" onClick={() => download("pdf")}>
          {t("exportPdf")}
        </Button>
      </div>

      {report && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="border border-[var(--line)] bg-[var(--paper)] p-4">
            <h2 className="mb-3 font-medium">By room</h2>
            <ul className="space-y-2 text-sm">
              {report.byRoom.map((r) => (
                <li key={r.roomName}>
                  {r.roomName}: {r.count} / {r.hours}h
                </li>
              ))}
            </ul>
          </section>
          <section className="border border-[var(--line)] bg-[var(--paper)] p-4">
            <h2 className="mb-3 font-medium">By department</h2>
            <ul className="space-y-2 text-sm">
              {report.byDepartment.map((d) => (
                <li key={d.department}>
                  {d.department}: {d.count}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Total: {report.total}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
