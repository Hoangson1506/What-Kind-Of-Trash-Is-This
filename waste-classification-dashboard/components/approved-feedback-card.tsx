import React from "react";
import type { UserResponseData as Feedback } from "@/types";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ApprovedFeedbackCardProps {
  feedback: Feedback;
}

export default function ApprovedFeedbackCard({ feedback }: ApprovedFeedbackCardProps) {
  const isSatisfied = feedback.is_right !== undefined ? feedback.is_right : false;
  const comment = feedback.comment || "Không có bình luận";
  const addedAt = feedback.added_at ? new Date(feedback.added_at) : new Date();
  const formattedDate = addedAt.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Xử lý image_path
  const imageUrl = feedback.image_path
    ? feedback.image_path.startsWith("http://localhost:8000/images/")
      ? feedback.image_path
      : `http://localhost:8000/images/${feedback.image_path.replace(/^\//, "")}`
    : null;

  return (
    <div
      className={`p-4 rounded-lg border ${isSatisfied ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
    >
      {/* Hiển thị ảnh */}
      <div className="mb-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Feedback image for ID ${feedback.response_id}`}
            className="w-full h-48 object-cover rounded-md border border-gray-100"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg"; // Đường dẫn đến ảnh placeholder
              e.currentTarget.alt = "Không thể tải ảnh";
            }}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
            <p className="text-gray-500 text-sm">Không có ảnh cho phản hồi này</p>
          </div>
        )}
      </div>

      <div className="flex items-center mb-3">
        {isSatisfied ? (
          <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
        ) : (
          <ThumbsDown className="w-5 h-5 text-red-500 mr-2" />
        )}
        <span className={`text-sm font-medium ${isSatisfied ? "text-green-700" : "text-red-700"}`}>
          {isSatisfied ? "Người dùng hài lòng" : "Người dùng không hài lòng"}
        </span>
      </div>

      <div className="mb-2">
        <p className="text-sm text-gray-600">
          Bình luận: <span className="font-medium">{comment}</span>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">ID: {feedback.response_id || "Không có ID"}</p>
        <p className="text-xs text-gray-500">Ngày gửi: {formattedDate}</p>
      </div>
    </div>
  );
}