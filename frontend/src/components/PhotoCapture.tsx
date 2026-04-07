"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { useUpload } from "@/hooks/useUpload";

type Mode = "choose" | "webcam" | "upload";

export default function PhotoCapture({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [mode, setMode] = useState<Mode>("choose");
  const webcamRef = useRef<Webcam>(null);
  const { upload, uploading, error } = useUpload();

  const handleFile = useCallback(
    async (file: File) => {
      try {
        await upload(file);
        onComplete();
      } catch {
        // error is set in useUpload
      }
    },
    [upload, onComplete]
  );

  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) handleFile(files[0]);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const capturePhoto = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Convert base64 to File
    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    handleFile(file);
  }, [handleFile]);

  if (mode === "choose") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Upload Your Photo
        </h2>
        <p className="text-center text-gray-600">
          For best results, use a full-body photo with good lighting, facing the
          camera directly.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode("webcam")}
            className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <svg
              className="w-12 h-12 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium text-gray-900">Take a Photo</span>
            <span className="text-sm text-gray-500">Use your webcam</span>
          </button>

          <button
            onClick={() => setMode("upload")}
            className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <svg
              className="w-12 h-12 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium text-gray-900">Upload Image</span>
            <span className="text-sm text-gray-500">From your device</span>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "webcam") {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode("choose")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            &larr; Back
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Take Your Photo
          </h2>
          <div className="w-12" />
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-black">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            videoConstraints={{ facingMode: "user", width: 768, height: 1024 }}
            className="w-full"
          />
          {/* Pose guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 200 400"
              className="h-[80%] opacity-20"
              fill="none"
              stroke="white"
              strokeWidth="1"
            >
              {/* Head */}
              <ellipse cx="100" cy="45" rx="25" ry="30" />
              {/* Body */}
              <line x1="100" y1="75" x2="100" y2="220" />
              {/* Arms */}
              <line x1="100" y1="100" x2="55" y2="190" />
              <line x1="100" y1="100" x2="145" y2="190" />
              {/* Legs */}
              <line x1="100" y1="220" x2="70" y2="370" />
              <line x1="100" y1="220" x2="130" y2="370" />
            </svg>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <p className="font-medium mb-1">Tips for best results:</p>
          <ul className="list-disc list-inside space-y-1 text-amber-700">
            <li>Stand back so your full body is visible</li>
            <li>Face the camera directly</li>
            <li>Keep arms slightly away from your body</li>
            <li>Ensure even, good lighting</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={capturePhoto}
            disabled={uploading}
            className="flex-1 py-3 px-6 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Processing..." : "Capture Photo"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    );
  }

  // Upload mode
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMode("choose")}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          &larr; Back
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Upload Image</h2>
        <div className="w-12" />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {uploading ? (
          <p className="text-indigo-600 font-medium">Processing your photo...</p>
        ) : isDragActive ? (
          <p className="text-indigo-600 font-medium">Drop your photo here</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">
              Drag & drop your photo here
            </p>
            <p className="text-gray-500 text-sm mt-1">
              or click to browse (JPEG, PNG, max 10MB)
            </p>
          </>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <p className="font-medium mb-1">For best results:</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>Use a full-body photo (head to toe)</li>
          <li>Stand facing the camera</li>
          <li>Wear fitted clothing for accurate body shape</li>
          <li>Use a plain background if possible</li>
        </ul>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
