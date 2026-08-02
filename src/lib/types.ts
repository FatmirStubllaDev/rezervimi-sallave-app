export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  adUsername: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  department: string;
  position?: string | null;
  role: Role;
  isActive?: boolean;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  capacity: number | null;
  translationEquipment: boolean;
  audioEquipment: boolean;
  color: string;
  isActive: boolean;
  availableFrom: string;
  availableTo: string;
};

export type ReservationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type Reservation = {
  id: string;
  title: string;
  description?: string | null;
  startDateTime: string;
  endDateTime: string;
  participants: number;
  notes?: string | null;
  status: ReservationStatus;
  rejectionReason?: string | null;
  room: Room;
  user: {
    id: string;
    adUsername: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  } | null;
};

export type SentEmail = {
  to: string;
  subject: string;
  mode: "smtp" | "ethereal" | "failed";
  messageId?: string;
  previewUrl?: string;
  error?: string;
};

export type DashboardData = {
  freeRoomsToday: Room[];
  todaysMeetings: Reservation[];
  pendingApprovals: Reservation[];
  upcoming: Reservation[];
  monthlyStats: {
    totalApproved: number;
    utilization: {
      roomId: string;
      roomName: string;
      color: string;
      bookings: number;
      utilizationPercent: number;
    }[];
  };
};
