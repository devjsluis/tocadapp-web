"use client";

import { useState, type FormEvent } from "react";

import type {
  Gig,
  GigFormData,
  SaveGigPayload,
} from "@/features/gigs/types/gig";
import { toDateInput, toTimeInput } from "@/features/gigs/utils/gig.utils";

const emptyForm: GigFormData = {
  title: "",
  place: "",
  date: "",
  time: "",
  hours: "",
  notes: "",
  band_id: "",
};

type UseGigFormParams = {
  onSave: (editingGig: Gig | null, payload: SaveGigPayload) => Promise<boolean>;
};

export function useGigForm({ onSave }: UseGigFormParams) {
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [formData, setFormData] = useState<GigFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingGig(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (gig: Gig) => {
    setEditingGig(gig);
    setFormData({
      title: gig.title,
      place: gig.place,
      date: toDateInput(gig.date),
      time: toTimeInput(String(gig.time)),
      hours: String(gig.hours),
      notes: gig.notes ?? "",
      band_id: gig.band_id ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGig(null);
    setFormData(emptyForm);
  };

  const updateField = <K extends keyof GigFormData>(
    field: K,
    value: GigFormData[K],
  ) => {
    setFormData((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    const payload: SaveGigPayload = {
      ...formData,
      amount: null,
      band_id: formData.band_id || null,
    };

    setSaving(true);

    try {
      const saved = await onSave(editingGig, payload);

      if (saved) {
        closeForm();
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    showForm,
    editingGig,
    formData,
    saving,
    isEditing: editingGig !== null,
    openCreate,
    openEdit,
    closeForm,
    updateField,
    submit,
  };
}
