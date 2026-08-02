"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { locale, setLocale, t } = useLocaleStore();
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  const mainLinks = user
    ? [
        { href: "/", label: t("dashboard") },
        { href: "/calendar", label: t("calendar") },
        { href: "/reservations/new", label: t("newReservation") },
        { href: "/reservations", label: t("myReservations") },
      ]
    : [];

  const adminLinks =
    user?.role === "ADMIN"
      ? [
          { href: "/admin/approvals", label: t("pendingApprovals") },
          { href: "/admin/rooms", label: t("rooms") },
          { href: "/admin/users", label: t("users") },
          { href: "/admin/emails", label: "Emails" },
          { href: "/admin/reports", label: t("reports") },
        ]
      : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!adminRef.current?.contains(e.target as Node)) setAdminOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ink)] text-sm font-bold text-white shadow-lg shadow-[var(--glow)] transition-transform group-hover:scale-105">
            MR
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-2 ring-white" />
          </span>
          <span>
            <span className="block font-[family-name:var(--font-display)] text-xl leading-none tracking-tight">
              {t("appName")}
            </span>
            <span className="mt-0.5 hidden text-[11px] text-[var(--muted)] sm:block">
              {t("appFull")}
            </span>
          </span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-1 lg:flex">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--paper-soft)] hover:text-[var(--ink)]",
                )}
              >
                {link.label}
              </Link>
            ))}

            {adminLinks.length > 0 && (
              <div className="relative" ref={adminRef}>
                <button
                  type="button"
                  onClick={() => setAdminOpen((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname.startsWith("/admin")
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--paper-soft)] hover:text-[var(--ink)]",
                  )}
                >
                  {t("admin")}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {adminOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] py-1 shadow-xl">
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setAdminOpen(false)}
                        className={cn(
                          "block px-4 py-2.5 text-sm transition-colors hover:bg-[var(--paper)]",
                          pathname === link.href
                            ? "bg-[var(--paper)] font-semibold text-[var(--ink)]"
                            : "text-[var(--muted)]",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5 text-xs font-semibold">
            {(["sq", "en"] as const).map((code) => (
              <button
                key={code}
                className={cn(
                  "rounded-md px-2.5 py-1.5 transition-colors",
                  locale === code
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--ink)]",
                )}
                onClick={() => setLocale(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-[var(--muted)]">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                {t("logout")}
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="accent">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {user && (
        <div className="flex gap-2 overflow-x-auto border-t border-[var(--line)] px-4 py-2 lg:hidden">
          {[...mainLinks, ...adminLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs",
                pathname === link.href
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--paper-soft)] text-[var(--muted)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
