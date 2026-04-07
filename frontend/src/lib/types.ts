export interface PhotoUploadResponse {
  photo_id: string;
  status: string;
}

export interface PhotoStatus {
  photo_id: string;
  status: string;
  resized_url: string | null;
}

export type GarmentCategory =
  | "upper_body"
  | "lower_body"
  | "dresses"
  | "shoes"
  | "accessories";

export interface GarmentResponse {
  id: string;
  name: string;
  brand: string;
  category: GarmentCategory;
  source: string;
  original_url: string;
  processed_url: string | null;
  metadata: Record<string, string>;
  created_at: string;
}

export interface GarmentSearchResult {
  title: string;
  brand: string;
  image_url: string;
  product_url: string;
  price: string;
}

export interface TryOnResponse {
  job_id: string;
  status: string;
}

export interface TryOnStatus {
  job_id: string;
  status: "queued" | "processing" | "complete" | "failed";
  result_url: string | null;
  error: string | null;
}

export interface OutfitItem {
  garment_id: string;
  category: GarmentCategory;
}

export interface OutfitResponse {
  job_id: string;
  status: string;
}

export interface OutfitStatus {
  job_id: string;
  status: "queued" | "processing" | "complete" | "failed";
  result_url: string | null;
  intermediate_urls: string[];
  error: string | null;
}
