"use client";

import Image from "next/image";
import { getFileUrl } from "@/lib/api";
import type { GarmentCategory, GarmentResponse } from "@/lib/types";
import { useAppStore } from "@/lib/store";

const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  upper_body: "Top",
  lower_body: "Bottom",
  dresses: "Dress",
  shoes: "Shoes",
  accessories: "Accessory",
};

export default function GarmentCard({
  garment,
}: {
  garment: GarmentResponse;
}) {
  const addToOutfit = useAppStore((s) => s.addToOutfit);
  const outfitSlots = useAppStore((s) => s.outfitSlots);
  const isInOutfit = outfitSlots[garment.category]?.garment.id === garment.id;

  const imageUrl = garment.processed_url
    ? getFileUrl(garment.processed_url)
    : "/placeholder.png";

  return (
    <div
      className={`group relative bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
        isInOutfit ? "border-indigo-500 shadow-md" : "border-gray-100"
      }`}
    >
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={imageUrl}
          alt={garment.name}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <span className="absolute top-2 left-2 text-xs font-medium bg-gray-900/70 text-white px-2 py-0.5 rounded-full">
          {CATEGORY_LABELS[garment.category]}
        </span>
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {garment.name}
        </p>
        {garment.brand && (
          <p className="text-xs text-gray-500 truncate">{garment.brand}</p>
        )}

        <button
          onClick={() => addToOutfit(garment, garment.category)}
          className={`mt-2 w-full py-1.5 px-3 text-sm font-medium rounded-lg transition-colors ${
            isInOutfit
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
          }`}
        >
          {isInOutfit ? "Added" : "Add to Outfit"}
        </button>
      </div>
    </div>
  );
}
