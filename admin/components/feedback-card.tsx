"use client";

import type { UserResponseData as Feedback } from "@/types";
import { Check, X, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

interface FeedbackCardProps {
  feedback: Feedback;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

// Định nghĩa base URL cho API hình ảnh
const API_BASE_URL = "http://localhost:8000/images";

export default function FeedbackCard({ feedback, isProcessing, onApprove, onReject }: FeedbackCardProps) {
  const isSatisfied = feedback.is_right; // is_right là boolean, true = hài lòng, false = không hài lòng

  // Hàm helper để thêm base URL vào image_path
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) {
      console.warn(`Empty or null image_path for feedback ID ${feedback.response_id}`);
      return null;
    }
    if (imagePath.startsWith(API_BASE_URL)) return imagePath;
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // Tạo image URL
  const imageUrl = getImageUrl(feedback.image_path);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {isSatisfied ? (
            <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
          ) : (
            <ThumbsDown className="w-5 h-5 text-red-500 mr-2" />
          )}
          <span className={`text-sm font-medium ${isSatisfied ? "text-green-700" : "text-red-700"}`}>
            {isSatisfied ? "Hài lòng" : "Không hài lòng"}
          </span>
        </div>
        <span className="text-xs text-gray-500">ID: {feedback.response_id}</span>
      </div>

      {/* Hiển thị ảnh từ feedback.image_path */}
      <div className="mb-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Feedback image for ID ${feedback.response_id}`}
            className="w-full h-48 object-cover rounded-md border border-gray-100"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg"; // Đường dẫn ảnh mặc định nếu lỗi
              e.currentTarget.alt = "Không thể tải ảnh";
            }}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
            <p className="text-gray-500 text-sm">Không có ảnh cho phản hồi này</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-700">{feedback.comment || "Không có bình luận"}</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onApprove}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Phê duyệt
            </>
          )}
        </button>

        <button
          onClick={onReject}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <X className="w-4 h-4 mr-2" />
              Từ chối
            </>
          )}
        </button>
      </div>
    </div>
  );
}