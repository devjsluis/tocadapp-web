import { api } from "@/lib/axios";
import type { Band } from "@/features/bands/types/band";

interface GetBandsResponse {
  ok: boolean;
  data: Band[];
}

export const bandsService = {
  getAll: async (): Promise<Band[]> => {
    const { data } = await api.get<GetBandsResponse>("/bands");
    return data.data;
  },

  getAvailableForGigCreation: async (): Promise<Band[]> => {
    const bands = await bandsService.getAll();

    return bands.filter((band) => {
      return band.is_owner || band.can_create_gigs;
    });
  },
};
