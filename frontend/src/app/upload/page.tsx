"use client";

import { useRouter } from "next/navigation";
import PhotoCapture from "@/components/PhotoCapture";

export default function UploadPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="text-lg font-bold text-gray-900"
        >
          How Do I Look?
        </button>
        <div className="flex gap-2 text-sm text-gray-500">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
            1. Upload
          </span>
          <span className="px-3 py-1">2. Pick Items</span>
          <span className="px-3 py-1">3. Try On</span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <PhotoCapture onComplete={() => router.push("/catalog")} />
      </div>
    </main>
  );
}
