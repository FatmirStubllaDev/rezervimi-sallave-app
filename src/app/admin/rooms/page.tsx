"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import type { Room } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  capacity: z.coerce.number().optional(),
  color: z.string().min(4),
  translationEquipment: z.boolean(),
  audioEquipment: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminRoomsPage() {
  const { user, token } = useAuthStore();
  const t = useLocaleStore((s) => s.t);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      color: "#2563eb",
      translationEquipment: true,
      audioEquipment: true,
    },
  });

  const load = () => {
    if (!token) return;
    api.rooms(token).then(setRooms).catch((e) => setError(e.message));
  };

  useEffect(load, [token]);

  if (!token || user?.role !== "ADMIN") {
    return <p className="text-[var(--muted)]">Admin only</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        {t("rooms")}
      </h1>
      {error && <p className="text-sm text-red-700">{error}</p>}

      <form
        className="grid gap-3 border border-[var(--line)] bg-[var(--paper)] p-4 sm:grid-cols-2"
        onSubmit={handleSubmit(async (values) => {
          await api.createRoom(token, values);
          reset();
          load();
        })}
      >
        <div>
          <Label>Name</Label>
          <Input {...register("name")} />
        </div>
        <div>
          <Label>Color</Label>
          <Input type="color" {...register("color")} />
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Input {...register("description")} />
        </div>
        <div>
          <Label>{t("capacity")}</Label>
          <Input type="number" {...register("capacity")} />
        </div>
        <div className="flex items-end gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("translationEquipment")} />
            {t("translation")}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("audioEquipment")} />
            {t("audio")}
          </label>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">{t("save")}</Button>
        </div>
      </form>

      <div className="space-y-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line)] bg-[var(--paper)] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: room.color }}
              />
              <div>
                <p className="font-medium">
                  {room.name} {!room.isActive && "(inactive)"}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {room.description} · {room.capacity ?? "n/a"} · 24/7
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await api.updateRoom(token, room.id, {
                  isActive: !room.isActive,
                });
                load();
              }}
            >
              {room.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
