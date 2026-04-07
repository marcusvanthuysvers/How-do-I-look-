"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TryOnResult from "@/components/TryOnResult";
import { useOutfitPoll } from "@/hooks/useTryOn";
import { useAppStore } from "@/lib/store";
import { getFileUrl } from "@/lib/api";

function TryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const photoUrl = useAppStore((s) => s.photoUrl);

  const { status } = useOutfitPoll(jobId);

  if (!photoUrl) {
    if (typeof window !== "undefined") {
      router.push("/upload");
    }
    return null;
  }

  const isLoading = !status || status.status === "queued" || status.status === "processing";
  const resultUrl = status?.result_url || null;
  const error = status?.status === "failed" ? status.error : null;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-lg font-bold text-gray-900"
        >
          How Do I Look?
        </button>
        <div className="flex gap-2 text-sm text-gray-500">
          <span className="px-3 py-1">1. Upload</span>
          <span className="px-3 py-1">2. Pick Items</span>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
            3. Try On
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Look</h2>
          <p className="text-gray-500 mt-1">
            {isLoading
              ? "Our AI is generating your virtual try-on..."
              : resultUrl
              ? "Slide to compare your original photo with the try-on result"
              : "Something went wrong"}
          </p>
        </div>

        <TryOnResult
          originalUrl={getFileUrl(photoUrl)}
          resultUrl={resultUrl}
          loading={isLoading}
          error={error}
        />

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/catalog")}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Edit Outfit
          </button>
          <button
            onClick={() => {
              useAppStore.getState().clearPhoto();
              useAppStore.getState().clearOutfit();
              useAppStore.getState().setResult(null);
              router.push("/upload");
            }}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <TryOnContent />
    </Suspense>
  );
}
