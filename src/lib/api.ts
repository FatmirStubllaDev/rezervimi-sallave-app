import type { DashboardData, Reservation, Room, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
    raw?: boolean;
  } = {},
): Promise<T> {
  const headers: HeadersInit = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}/api${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (options.raw) {
    if (!res.ok) throw new Error("Export failed");
    return res as unknown as T;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<{ user: User; accessToken: string }>("/auth/login", {
      method: "POST",
      body,
    }),
  me: (token: string) => request<User>("/users/me", { token }),
  dashboard: (token: string) => request<DashboardData>("/dashboard", { token }),
  rooms: (token: string, activeOnly = false) =>
    request<Room[]>(`/rooms?activeOnly=${activeOnly}`, { token }),
  createRoom: (token: string, body: Partial<Room>) =>
    request<Room>("/rooms", { method: "POST", body, token }),
  updateRoom: (token: string, id: string, body: Partial<Room>) =>
    request<Room>(`/rooms/${id}`, { method: "PATCH", body, token }),
  calendar: (
    token: string,
    params: { from: string; to: string; roomId?: string },
  ) => {
    const qs = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    if (params.roomId) qs.set("roomId", params.roomId);
    return request<Reservation[]>(`/reservations/calendar?${qs}`, { token });
  },
  createReservation: (
    token: string,
    body: {
      roomId: string;
      title: string;
      description?: string;
      startDateTime: string;
      endDateTime: string;
      participants: number;
      notes?: string;
    },
  ) =>
    request<Reservation & { emails?: SentEmail[] }>("/reservations", {
      method: "POST",
      body,
      token,
    }),
  myReservations: (token: string) =>
    request<Reservation[]>("/reservations/mine", { token }),
  allReservations: (token: string, status?: string) =>
    request<Reservation[]>(
      `/reservations${status ? `?status=${status}` : ""}`,
      { token },
    ),
  approve: (token: string, id: string) =>
    request<Reservation & { emails?: SentEmail[] }>(
      `/reservations/${id}/approve`,
      {
        method: "POST",
        token,
      },
    ),
  reject: (token: string, id: string, reason?: string) =>
    request<Reservation & { emails?: SentEmail[] }>(
      `/reservations/${id}/reject`,
      {
        method: "POST",
        body: { reason },
        token,
      },
    ),
  cancel: (token: string, id: string) =>
    request<Reservation & { emails?: SentEmail[] }>(
      `/reservations/${id}/cancel`,
      {
        method: "POST",
        token,
      },
    ),
  emailOutbox: (token: string) =>
    request<
      {
        id: string;
        to: string;
        subject: string;
        mode: string;
        previewUrl?: string;
        error?: string;
        createdAt: string;
      }[]
    >("/emails/outbox", { token }),
  users: (token: string) => request<User[]>("/users", { token }),
  createUser: (
    token: string,
    body: {
      email: string;
      adUsername: string;
      password: string;
      firstName: string;
      lastName: string;
      department: string;
      position?: string;
      role: string;
    },
  ) => request<User>("/users", { method: "POST", body, token }),
  updateUser: (
    token: string,
    id: string,
    body: Partial<{
      email: string;
      adUsername: string;
      password: string;
      firstName: string;
      lastName: string;
      department: string;
      position?: string;
      role: string;
      isActive: boolean;
    }>,
  ) => request<User>(`/users/${id}`, { method: "PATCH", body, token }),
  deleteUser: (token: string, id: string) =>
    request<{ deleted: boolean }>(`/users/${id}`, {
      method: "DELETE",
      token,
    }),
  setRole: (token: string, id: string, role: string) =>
    request(`/users/${id}`, { method: "PATCH", body: { role }, token }),
  setUserActive: (token: string, id: string, isActive: boolean) =>
    request(`/users/${id}`, {
      method: "PATCH",
      body: { isActive },
      token,
    }),
  groups: (token: string) =>
    request<
      { id: string; groupName: string; description?: string; isActive: boolean }[]
    >("/access/groups", { token }),
  addGroup: (
    token: string,
    body: { groupName: string; description?: string },
  ) => request("/access/groups", { method: "POST", body, token }),
  setGroupActive: (token: string, id: string, isActive: boolean) =>
    request(`/access/groups/${id}`, {
      method: "PATCH",
      body: { isActive },
      token,
    }),
  reports: (token: string, from: string, to: string) =>
    request(`/reports?from=${from}&to=${to}`, { token }),
  audit: (token: string) => request("/audit", { token }),
  exportUrl: (kind: "excel" | "pdf", from: string, to: string) =>
    `${API_URL}/api/reports/export/${kind}?from=${from}&to=${to}`,
};
