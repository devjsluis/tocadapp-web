"use client";

import { useCallback, useEffect, useState } from "react";

import { gigsService } from "@/features/gigs/services/gigs.service";
import type { Gig, SaveGigPayload } from "@/features/gigs/types/gig";

export function useGigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchGigs = useCallback(async () => {
    try {
      const gigsData = await gigsService.getAll();
      setGigs(gigsData);
    } catch (error) {
      console.error("Error al obtener tocadas", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGigs();
  }, [fetchGigs]);

  const saveGig = async (editingGig: Gig | null, payload: SaveGigPayload) => {
    try {
      if (editingGig) {
        await gigsService.update(editingGig.id, payload);
      } else {
        await gigsService.create(payload);
      }

      await fetchGigs();

      return true;
    } catch (error) {
      console.error("Error al guardar la tocada:", error);

      return false;
    }
  };

  const deleteGig = async (gigId: string) => {
    setDeleting(true);

    try {
      await gigsService.delete(gigId);

      setGigs((previousGigs) => previousGigs.filter((gig) => gig.id !== gigId));

      return true;
    } catch (error) {
      console.error("Error al eliminar:", error);

      return false;
    } finally {
      setDeleting(false);
    }
  };

  const setAttendance = async (gigId: string, attending: boolean | null) => {
    try {
      await gigsService.setAttendance(gigId, attending);

      setGigs((previousGigs) =>
        previousGigs.map((gig) =>
          gig.id === gigId ? { ...gig, my_attending: attending } : gig,
        ),
      );
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
    }
  };

  const setCollectedAmount = async (gig: Gig, amount: number | null) => {
    try {
      if (gig.is_owner) {
        await gigsService.setOwnerCollectedAmount(gig.id, amount);

        setGigs((previousGigs) =>
          previousGigs.map((currentGig) =>
            currentGig.id === gig.id
              ? { ...currentGig, collected_amount: amount }
              : currentGig,
          ),
        );
      } else {
        await gigsService.setMemberCollectedAmount(gig.id, amount);

        setGigs((previousGigs) =>
          previousGigs.map((currentGig) =>
            currentGig.id === gig.id
              ? { ...currentGig, my_collected: amount }
              : currentGig,
          ),
        );
      }

      return true;
    } catch (error) {
      console.error("Error al guardar cobro:", error);

      return false;
    }
  };

  return {
    gigs,
    loading,
    deleting,
    saveGig,
    deleteGig,
    setAttendance,
    setCollectedAmount,
  };
}
