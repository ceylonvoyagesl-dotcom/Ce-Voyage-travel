export type UserRole =
  | "super_admin"
  | "operations_manager"
  | "finance_hr"
  | "dispatcher";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "confirmed"
  | "completed"
  | "cancelled";

export type InquiryType =
  | "travel_request"
  | "tour_request"
  | "trip_plan"
  | "general";

export type Inquiry = {
  id: string;
  created_at: string;
  inquiry_number?: string | null;
  inquiry_type: InquiryType;
  status: InquiryStatus;
  source: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  contact?: string | null;
  travel_date: string | null;
  end_date?: string | null;
  travellers: string | null;
  interest: string | null;
  hotel_level: string | null;
  message: string | null;
  trip_items?: unknown[];
  language?: string | null;
  assigned_to?: string | null;
  estimated_value?: number | null;
  currency?: "USD" | "EUR" | "LKR";
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
};

export type BookingStatus =
  | "draft"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Booking = {
  id: string;
  booking_number: string;
  inquiry_id?: string | null;
  guest_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  tour_name: string;
  start_date: string;
  end_date: string;
  travellers: number;
  status: BookingStatus;
  total_amount: number;
  paid_amount: number;
  currency: "USD" | "EUR" | "LKR";
  driver_name?: string | null;
  vehicle_label?: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
};

export type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: "emerald" | "amber" | "blue" | "slate";
};
