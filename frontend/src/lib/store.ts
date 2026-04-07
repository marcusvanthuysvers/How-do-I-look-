import { create } from "zustand";
import type { GarmentCategory, GarmentResponse } from "./types";

interface OutfitSlot {
  garment: GarmentResponse;
  category: GarmentCategory;
}

interface AppState {
  // Photo
  photoId: string | null;
  photoUrl: string | null;
  setPhoto: (id: string, url: string) => void;
  clearPhoto: () => void;

  // Outfit
  outfitSlots: Record<GarmentCategory, OutfitSlot | null>;
  addToOutfit: (garment: GarmentResponse, category: GarmentCategory) => void;
  removeFromOutfit: (category: GarmentCategory) => void;
  clearOutfit: () => void;
  getOutfitItems: () => { garment_id: string; category: GarmentCategory }[];

  // Try-on result
  resultUrl: string | null;
  resultLoading: boolean;
  setResult: (url: string | null) => void;
  setResultLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  photoId: null,
  photoUrl: null,
  setPhoto: (id, url) => set({ photoId: id, photoUrl: url }),
  clearPhoto: () => set({ photoId: null, photoUrl: null }),

  outfitSlots: {
    upper_body: null,
    lower_body: null,
    dresses: null,
    shoes: null,
    accessories: null,
  },
  addToOutfit: (garment, category) =>
    set((state) => ({
      outfitSlots: {
        ...state.outfitSlots,
        [category]: { garment, category },
      },
    })),
  removeFromOutfit: (category) =>
    set((state) => ({
      outfitSlots: {
        ...state.outfitSlots,
        [category]: null,
      },
    })),
  clearOutfit: () =>
    set({
      outfitSlots: {
        upper_body: null,
        lower_body: null,
        dresses: null,
        shoes: null,
        accessories: null,
      },
    }),
  getOutfitItems: () => {
    const slots = get().outfitSlots;
    return Object.values(slots)
      .filter((slot): slot is OutfitSlot => slot !== null)
      .map((slot) => ({
        garment_id: slot.garment.id,
        category: slot.category,
      }));
  },

  resultUrl: null,
  resultLoading: false,
  setResult: (url) => set({ resultUrl: url, resultLoading: false }),
  setResultLoading: (loading) => set({ resultLoading: loading }),
}));
