"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { api } from "@/lib/api";
import type { Room, SentEmail } from "@/lib/types";
import { toLocalInputValue } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailResultBanner } from "@/components/email-result-banner";

const schema = z.object({
  roomId: z.string().uuid("Select a room"),
  title: z.string().min(3),
  startDateTime: z.string().min(1),
  endDateTime: z.string().min(1, "End time is required"),
  participants: z.coerce.number().int().min(1),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewReservationPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const t = useLocaleStore((s) => s.t);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDateTime: toLocalInputValue(start),
      endDateTime: toLocalInputValue(end),
      participants: 10,
    },
  });

  useEffect(() => {
    if (!token) return;
    api.rooms(token, true).then(setRooms).catch(() => undefined);
  }, [token]);

  if (!token || !user) {
    return <p className="text-[var(--muted)]">{t("login")}</p>;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      setInfo("");
      setEmails([]);
      const result = await api.createReservation(token, {
        ...values,
        startDateTime: new Date(values.startDateTime).toISOString(),
        endDateTime: new Date(values.endDateTime).toISOString(),
      });
      setEmails(result.emails ?? []);
      setInfo(
        `Request created. Email notification sent to ${user.email} and administrators.`,
      );
      setTimeout(() => router.push("/reservations"), 3500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface-card p-6 sm:p-8 animate-fade-up">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {t("newReservation")}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t("organizer")}: {user.firstName} {user.lastName}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="title">{t("title")}</Label>
            <Input
              id="title"
              placeholder="Takim me Delegacionin e Bashkimit Evropian"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-700">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="roomId">{t("room")}</Label>
            <select
              id="roomId"
              className="flex h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-sm"
              {...register("roomId")}
            >
              <option value="">—</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} — {room.description}
                  {room.capacity ? ` (${room.capacity})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDateTime">{t("startTime")}</Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                {...register("startDateTime")}
              />
            </div>
            <div>
              <Label htmlFor="endDateTime">{t("endTime")}</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                required
                {...register("endDateTime", { required: "End time is required" })}
              />
              {errors.endDateTime && (
                <p className="mt-1 text-xs text-red-700">
                  {errors.endDateTime.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="participants">{t("participants")}</Label>
            <Input
              id="participants"
              type="number"
              min={1}
              {...register("participants")}
            />
          </div>
          <div>
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {info}
            </p>
          )}
          <EmailResultBanner emails={emails} />
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </div>

      <aside className="surface-card h-fit space-y-4 p-6 animate-fade-up-delay">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[var(--accent)]">
          <Mail className="h-5 w-5" />
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Email notifications
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          When you submit a reservation, MRRS emails your Microsoft account (
          <strong className="text-[var(--ink)]">{user.email}</strong>) and notifies
          administrators for approval.
        </p>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          <li>• Created → pending approval mail</li>
          <li>• Approved / rejected → status mail</li>
          <li>• Cancelled → cancellation mail</li>
        </ul>
      </aside>
    </div>
  );
}
