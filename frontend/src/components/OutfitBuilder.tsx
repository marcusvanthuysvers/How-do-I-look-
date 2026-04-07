"use client";

import Image from "next/image";
import { getFileUrl } from "@/lib/api";
import type { GarmentCategory } from "@/lib/types";
import { useAppStore } from "@/lib/store";

const SLOTS: { category: GarmentCategory; label: string; icon: string }[] = [
  { category: "accessories", label: "Accessories", icon: "👓" },
  { category: "upper_body", label: "Top", icon: "👔" },
  { category: "dresses", label: "Dress", icon: "👗" },
  { category: "lower_body", label: "Bottom", icon: "👖" },
  { category: "shoes", label: "Shoes", icon: "👟" },
];

export default function OutfitBuilder({
  onTryOn,
  loading,
}: {
  onTryOn: () => void;
  loading: boolean;
}) {
  const outfitSlots = useAppStore((s) => s.outfitSlots);
  const removeFromOutfit = useAppStore((s) => s.removeFromOutfit);
  const clearOutfit = useAppStore((s) => s.clearOutfit);

  const filledSlots = Object.values(outfitSlots).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Your Outfit</h3>
        {filledSlots > 0 && (
          <button
            onClick={clearOutfit}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2">
        {SLOTS.map(({ category, label, icon }) => {
          const slot = outfitSlots[category];
          return (
            <div
              key={category}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                slot ? "bg-indigo-50" : "bg-gray-50"
              }`}
            >
              <span className="text-lg w-8 text-center">{icon}</span>
              {slot ? (
                <>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                    <Image
                      src={
                        slot.garment.processed_url
                          ? getFileUrl(slot.garment.processed_url)
                          : "/placeholder.png"
                      }
                      alt={slot.garment.name}
                      fill
                      className="object-contain p-0.5"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {slot.garment.name}
                    </p>
                    {slot.garment.brand && (
                      <p className="text-xs text-gray-500 truncate">
                        {slot.garment.brand}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromOutfit(category)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-400 flex-1">{label}</p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onTryOn}
        disabled={filledSlots === 0 || loading}
        className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          `Try On Outfit (${filledSlots} item${filledSlots !== 1 ? "s" : ""})`
        )}
      </button>
    </div>
  );
}
