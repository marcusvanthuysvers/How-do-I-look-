"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GarmentSearch from "@/components/GarmentSearch";
import OutfitBuilder from "@/components/OutfitBuilder";
import { useAppStore } from "@/lib/store";
import { createOutfit } from "@/lib/api";

export default function CatalogPage() {
  const router = useRouter();
  const photoId = useAppStore((s) => s.photoId);
  const getOutfitItems = useAppStore((s) => s.getOutfitItems);
  const setResultLoading = useAppStore((s) => s.setResultLoading);
  const [loading, setLoading] = useState(false);

  // Redirect to upload if no photo
  if (!photoId) {
    if (typeof window !== "undefined") {
      router.push("/upload");
    }
    return null;
  }

  const handleTryOn = async () => {
    const items = getOutfitItems();
    if (items.length === 0) return;

    setLoading(true);
    setResultLoading(true);
    try {
      const res = await createOutfit(photoId, items);
      router.push(`/tryon?job=${res.job_id}`);
    } catch {
      setLoading(false);
      setResultLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.push("/")}
          className="text-lg font-bold text-gray-900"
        >
          How Do I Look?
        </button>
        <div className="flex gap-2 text-sm text-gray-500">
          <span className="px-3 py-1">1. Upload</span>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
            2. Pick Items
          </span>
          <span className="px-3 py-1">3. Try On</span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Garment search - takes 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Find Your Items
            </h2>
            <p className="text-gray-600">
              Paste a product URL from any brand, search by name, or upload an
              image directly.
            </p>
            <GarmentSearch />
          </div>

          {/* Outfit builder sidebar - takes 1/3 width */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OutfitBuilder onTryOn={handleTryOn} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
