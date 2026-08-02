"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid Microsoft email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const t = useLocaleStore((s) => s.t);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "emri.mbiemri@outlook.com",
      password: "password123",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      const result = await api.login(values);
      setAuth(result.user, result.accessToken);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  });

  return (
    <div className="grid min-h-[75vh] items-stretch gap-0 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xl shadow-[rgba(11,31,51,0.08)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[var(--ink)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(13,148,136,0.55), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 35%)",
          }}
        />
        <div className="relative animate-fade-up">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-200/90">
            Microsoft 365 ready
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight">
            {t("appName")}
          </h1>
          <p className="mt-4 max-w-sm text-white/70">{t("appFull")}</p>
        </div>
        <ul className="relative space-y-3 text-sm text-white/75 animate-fade-up-delay">
          <li>• Calendar day / week / month</li>
          <li>• Approval workflow + Outlook email alerts</li>
          <li>• Conflict-free room booking</li>
        </ul>
      </section>

      <section className="flex flex-col justify-center p-8 sm:p-12">
        <div className="animate-fade-up">
          <h2 className="font-[family-name:var(--font-display)] text-3xl">
            {t("signIn")}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("loginHint")}</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 animate-fade-up-delay"
        >
          <div>
            <Label htmlFor="email">Microsoft email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name.surname@outlook.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-700">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-red-700">
                {errors.password.message}
              </p>
            )}
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={isSubmitting}
          >
            {t("signIn")}
          </Button>
        </form>

        <div className="mt-8 rounded-2xl bg-[var(--paper)] p-4 text-xs text-[var(--muted)]">
          <p className="font-medium text-[var(--ink)]">Demo accounts</p>
          <p className="mt-1">emri.mbiemri@outlook.com</p>
          <p>admin.mrrs@outlook.com</p>
          <p className="mt-1">password123</p>
        </div>
      </section>
    </div>
  );
}
