import type {
  GarmentCategory,
  GarmentResponse,
  GarmentSearchResult,
  OutfitItem,
  OutfitResponse,
  OutfitStatus,
  PhotoUploadResponse,
  TryOnResponse,
  TryOnStatus,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Photo upload
export async function uploadPhoto(file: File): Promise<PhotoUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return fetchApi<PhotoUploadResponse>("/api/upload", {
    method: "POST",
    body: formData,
  });
}

// Garment operations
export async function fetchGarmentFromUrl(
  url: string,
  category: GarmentCategory,
  name?: string,
  brand?: string
): Promise<GarmentResponse> {
  return fetchApi<GarmentResponse>("/api/garments/fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, category, name: name || "", brand: brand || "" }),
  });
}

export async function searchGarments(
  query: string,
  category?: string
): Promise<GarmentSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  if (category) params.set("category", category);
  return fetchApi<GarmentSearchResult[]>(`/api/garments/search?${params}`);
}

export async function uploadGarment(
  file: File,
  name: string,
  brand: string,
  category: GarmentCategory
): Promise<GarmentResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("brand", brand);
  formData.append("category", category);
  return fetchApi<GarmentResponse>("/api/garments/upload", {
    method: "POST",
    body: formData,
  });
}

export async function listGarments(
  category?: string
): Promise<GarmentResponse[]> {
  const params = category ? `?category=${category}` : "";
  return fetchApi<GarmentResponse[]>(`/api/garments${params}`);
}

// Try-on
export async function createTryOn(
  photoId: string,
  garmentId: string
): Promise<TryOnResponse> {
  return fetchApi<TryOnResponse>("/api/tryon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photo_id: photoId, garment_id: garmentId }),
  });
}

export async function getTryOnStatus(jobId: string): Promise<TryOnStatus> {
  return fetchApi<TryOnStatus>(`/api/tryon/${jobId}`);
}

// Outfit
export async function createOutfit(
  photoId: string,
  garments: OutfitItem[]
): Promise<OutfitResponse> {
  return fetchApi<OutfitResponse>("/api/outfit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photo_id: photoId, garments }),
  });
}

export async function getOutfitStatus(jobId: string): Promise<OutfitStatus> {
  return fetchApi<OutfitStatus>(`/api/outfit/${jobId}`);
}

// File URL helper
export function getFileUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
