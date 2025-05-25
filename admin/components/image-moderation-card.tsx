"use client";

import { UserContributedData as ImageData } from "@/types";

interface ImageModerationCardProps {
  image: ImageData;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const ImageModerationCard = ({ image, isProcessing, onApprove, onReject }: ImageModerationCardProps) => {
  // Define the base API URL for images
  const API_BASE_URL = "http://localhost:8000/images";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      {/* Hiển thị hình ảnh */}
      <div className="mb-4">
        {image.image_path ? (
          <img
            src={`${API_BASE_URL}/${image.image_path}`} // Updated to use API URL
            alt="Hình ảnh cần kiểm duyệt"
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg"; // Hình ảnh thay thế nếu lỗi
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Không có hình ảnh</span>
          </div>
        )}
      </div>

      {/* Hiển thị thông tin cơ bản */}
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">ID:</span> {image.data_id}
        </p>
        <p className="text-sm">
          <span className="font-medium">Trạng thái:</span>{" "}
          {image.status === "unverified"
            ? "Chưa xác minh"
            : image.status === "verified"
            ? "Đã xác minh"
            : "Bị từ chối"}
        </p>
        <p className="text-sm">
          <span className="font-medium">Ngày thêm:</span>{" "}
          {new Date(image.added_at).toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          })}
        </p>
      </div>

      {/* Nút hành động */}
      <div className="mt-4 flex space-x-3">
        <button
          onClick={onApprove}
          disabled={isProcessing}
          className={`px-4 py-2 rounded-lg ${
            isProcessing
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          } text-white font-medium`}
        >
          {isProcessing ? "Đang xử lý..." : "Phê duyệt"}
        </button>
        <button
          onClick={onReject}
          disabled={isProcessing}
          className={`px-4 py-2 rounded-lg ${
            isProcessing
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          } text-white font-medium`}
        >
          {isProcessing ? "Đang xử lý..." : "Từ chối"}
        </button>
      </div>
    </div>
  );
};

export default ImageModerationCard;