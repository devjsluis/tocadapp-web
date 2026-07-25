import { api } from "@/lib/axios";
import type {
  AttendanceStatus,
  Gig,
  SaveGigPayload,
} from "@/features/gigs/types/gig";

interface GetGigsResponse {
  ok: boolean;
  data: Gig[];
  totals: {
    count: number;
  };
}

export const gigsService = {
  getAll: async (): Promise<Gig[]> => {
    const { data } = await api.get<GetGigsResponse>("/gigs");
    return data.data;
  },

  create: async (payload: SaveGigPayload): Promise<Gig> => {
    const { data } = await api.post<Gig>("/gigs", payload);
    return data;
  },

  update: async (id: string, payload: SaveGigPayload): Promise<Gig> => {
    const { data } = await api.put<Gig>(`/gigs/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gigs/${id}`);
  },

  setAttendance: async (
    id: string,
    attending: AttendanceStatus,
  ): Promise<void> => {
    await api.put(`/gigs/${id}/attending`, { attending });
  },

  setOwnerCollectedAmount: async (
    id: string,
    amount: number | null,
  ): Promise<void> => {
    await api.put(`/gigs/${id}/collected`, { amount });
  },

  setMemberCollectedAmount: async (
    id: string,
    amount: number | null,
  ): Promise<void> => {
    await api.put(`/gigs/${id}/my-earnings`, {
      amount: null,
      collected_amount: amount,
    });
  },
};
