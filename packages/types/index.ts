export const UserRole = {
  ADMIN: "ADMIN",
  OPERATOR: "OPERATOR",
  PROVIDER: "PROVIDER",
  WORKER: "WORKER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  gender?: string;
  role: UserRole;
  tenantId: string;
}

export interface Worker extends User {
  skills: string[];
  isAvailable: boolean;
  rating: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Booking {
  id: string;
  workerId: string;
  customerId: string;
  status: BookingStatus;
  amount: number;
  startTime: Date;
  endTime?: Date;
}

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
