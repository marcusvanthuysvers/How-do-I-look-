"use client";

import { useState } from "react";
import type { GarmentCategory, GarmentResponse } from "@/lib/types";
import {
  fetchGarmentFromUrl,
  searchGarments,
  uploadGarment,
  listGarments,
} from "@/lib/api";
import GarmentCard from "./GarmentCard";

const CATEGORIES: { value: GarmentCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "upper_body", label: "Tops" },
  { value: "lower_body", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
];

type Tab = "search" | "url" | "upload" | "library";

export default function GarmentSearch() {
  const [tab, setTab] = useState<Tab>("url");
  const [category, setCategory] = useState<GarmentCategory | "">("");
  const [garments, setGarments] = useState<GarmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL fetch state
  const [productUrl, setProductUrl] = useState("");
  const [urlCategory, setUrlCategory] = useState<GarmentCategory>("upper_body");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Upload state
  const [uploadName, setUploadName] = useState("");
  const [uploadBrand, setUploadBrand] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<GarmentCategory>("upper_body");

  const handleUrlFetch = async () => {
    if (!productUrl) return;
    setLoading(true);
    setError(null);
    try {
      const garment = await fetchGarmentFromUrl(productUrl, urlCategory);
      setGarments((prev) => [garment, ...prev]);
      setProductUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    try {
      const results = await searchGarments(searchQuery, category || undefined);
      // Search results are displayed differently - they need to be fetched first
      // For now, show them as a separate list
      setError(
        results.length === 0
          ? "No results found. Try a different search or paste a product URL."
          : null
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const garment = await uploadGarment(
        file,
        uploadName || "Uploaded Garment",
        uploadBrand,
        uploadCategory
      );
      setGarments((prev) => [garment, ...prev]);
      setUploadName("");
      setUploadBrand("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const items = await listGarments(category || undefined);
      setGarments(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load garments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {(
          [
            { key: "url", label: "Paste URL" },
            { key: "search", label: "Search" },
            { key: "upload", label: "Upload" },
            { key: "library", label: "My Items" },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              if (t.key === "library") loadLibrary();
            }}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* URL Fetch Tab */}
      {tab === "url" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Paste a link to any product page and we&apos;ll extract the image.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://www.suitsupply.com/en/sweaters/..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={urlCategory}
              onChange={(e) =>
                setUrlCategory(e.target.value as GarmentCategory)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="upper_body">Top</option>
              <option value="lower_body">Bottom</option>
              <option value="dresses">Dress</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessory</option>
            </select>
            <button
              onClick={handleUrlFetch}
              disabled={loading || !productUrl}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Fetching..." : "Fetch Item"}
            </button>
          </div>
        </div>
      )}

      {/* Search Tab */}
      {tab === "search" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Search for clothing items across brands.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g., Manfield loafers, Tom Ford sunglasses..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  category === c.value
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {tab === "upload" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Upload a garment image directly from your device.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="Item name"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={uploadBrand}
              onChange={(e) => setUploadBrand(e.target.value)}
              placeholder="Brand name"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={uploadCategory}
              onChange={(e) =>
                setUploadCategory(e.target.value as GarmentCategory)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="upper_body">Top</option>
              <option value="lower_body">Bottom</option>
              <option value="dresses">Dress</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessory</option>
            </select>
            <label className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
              {loading ? "Uploading..." : "Choose Image"}
              <input
                type="file"
                onChange={handleUpload}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </div>
      )}

      {/* Library Tab */}
      {tab === "library" && (
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCategory(c.value);
                loadLibrary();
              }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                category === c.value
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Garment Grid */}
      {garments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {garments.map((g) => (
            <GarmentCard key={g.id} garment={g} />
          ))}
        </div>
      )}
    </div>
  );
}
