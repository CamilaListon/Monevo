export type BillStatus = "paid" | "pending" | "overdue";
export type StatusFilter = BillStatus | "all";
export type ThemeMode = "light" | "dark";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Bill {
  id: string;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  notes: string | null;
  recurring: boolean;
  recurrenceSourceId: string | null;
  status: BillStatus;
}

export interface DashboardData {
  month: string;
  summary: { total: number; paid: number; pending: number; overdue: number };
  byCategory: { category: string; total: number }[];
  bills: Bill[];
  recentPayments: Bill[];
}

export interface BillInput {
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  notes: string;
  recurring?: boolean;
}
