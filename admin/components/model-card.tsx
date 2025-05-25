"use client";

import type { Model } from "@/types";

interface ModelCardProps {
  model: Model;
  isActive: boolean;
  onSwitch: () => void;
}

export default function ModelCard({ model, isActive, onSwitch }: ModelCardProps) {
  // Định dạng độ chính xác (nếu có)
  const accuracy = model.accuracy !== null ? `${(model.accuracy * 100).toFixed(2)}%` : "N/A";

  return (
    <div className={`p-6 rounded-lg border ${isActive ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{model.model_name.split('_version')[0]}</h3>
          <p className="text-sm text-gray-500 mt-1">Version: {model.model_name.match(/version_(\d+)/)?.[1] || (model.model_name === "best" ? "N/A" : "N/A")}</p>
          <p className="text-sm text-gray-500">Format: {model.model_format}</p>
        </div>
        {isActive && (
          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-200 rounded-full">Active</span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Satisfied Users:</span>
          <span className="text-sm font-medium">{model.number_of_responses || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Image Predictions:</span>
          <span className="text-sm font-medium">{model.image_inference_count || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Webcam Predictions:</span>
          <span className="text-sm font-medium">{model.live_inference_count || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Accuracy:</span>
          <span className="text-sm font-medium">{accuracy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">File Size (MB):</span>
          <span className="text-sm font-medium">10.367</span> {/* Giá trị mẫu, cần lấy từ modelFileSizes nếu có */}
        </div>
      </div>

      <button
        onClick={onSwitch}
        disabled={isActive}
        className={`mt-6 w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          isActive ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {isActive ? "Current Model" : "Switch Model"}
      </button>
    </div>
  );
}