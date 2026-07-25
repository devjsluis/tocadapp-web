export interface Gig {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  amount: number | string;
  hours: number | string;
  notes?: string;
  band_id?: string | null;
  band_name?: string | null;
  is_owner: boolean;
  my_amount?: number | null;
  my_collected?: number | null;
  collected_amount?: number | null;
  my_attending?: boolean | null;
}

export interface GigFormData {
  title: string;
  place: string;
  date: string;
  time: string;
  hours: string;
  notes: string;
  band_id: string;
}

export interface SaveGigPayload {
  title: string;
  place: string;
  date: string;
  time: string;
  hours: string;
  notes: string;
  amount: number | null;
  band_id: string | null;
}

export type ViewMode = "grid" | "month" | "calendar";

export type GigFilter = "upcoming" | "past" | "all";

export type AttendanceStatus = boolean | null;
