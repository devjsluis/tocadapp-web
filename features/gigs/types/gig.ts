export interface Gig {
  id: string;
  title: string;
  place: string;
  location_address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  google_place_id?: string | null;
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
  location_address: string;
  latitude: string;
  longitude: string;
  google_place_id: string;
  date: string;
  time: string;
  hours: string;
  notes: string;
  band_id: string;
}

export interface SaveGigPayload {
  title: string;
  place: string;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
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
