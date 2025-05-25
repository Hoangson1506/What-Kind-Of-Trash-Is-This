"use client";

import React, { useEffect, useRef, memo } from "react";
import { UserContributedData as ImageData } from "@/types";

interface ImageModerationCardProps {
  image: ImageData;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const ImageModerationCard = memo(
  ({ image, isProcessing, onApprove, onReject }: ImageModerationCardProps) => {
    const API_BASE_URL = "http://localhost:8000/images";
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Hàm định dạng ngày từ added_at
    const formatDate = (addedAt: string | null | undefined) => {
      if (!addedAt) return "Không xác định";
      try {
        const date = new Date(addedAt);
        if (isNaN(date.getTime())) return "Không xác định";
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Asia/Ho_Chi_Minh",
        });
      } catch {
        return "Không xác định";
      }
    };

    // Hàm định dạng labels
    const formatLabels = (labels: Array<{ trashType: string; bbox: number[] }> | null) => {
      if (labels === null || !Array.isArray(labels) || labels.length === 0) return "Nhãn: Không có nhãn";
      return labels
        .map((label) => {
          const { trashType, bbox } = label;
          if (!trashType || !Array.isArray(bbox)) return null;
          const [x, y, width, height] = bbox.length >= 4 ? bbox : [0, 0, 0, 0];
          return `${trashType} (x: ${x}, y: ${y}, w: ${width}, h: ${height})`;
        })
        .filter(Boolean)
        .join(", ") || "Nhãn: Không có nhãn";
    };

    // Ánh xạ màu sắc theo trashType (dựa trên hình ảnh bạn cung cấp)
    const getColorForTrashType = (trashType: string) => {
      const colorMap: { [key: string]: string } = {
        Plastic: "blue",    // Xanh dương
        Food: "green",      // Xanh lá
        Paper: "yellow",    // Vàng
        Other: "red",       // Đỏ
        Metal: "gray",      // Xám
      };
      return colorMap[trashType] || "black"; // Mặc định là đen nếu không tìm thấy
    };

    // Hàm vẽ bounding boxes với chuẩn hóa và dịch sang phải
    const drawBoundingBoxes = () => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !image.labels || image.labels.length > 10) return; // Giới hạn 10 bounding box

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Đặt kích thước canvas bằng kích thước hiển thị của ảnh
      const displayedWidth = img.clientWidth;
      const displayedHeight = img.clientHeight;
      canvas.width = displayedWidth;
      canvas.height = displayedHeight;

      // Tính toán tỉ lệ chuẩn hóa dựa trên kích thước hiển thị
      const scaleX = displayedWidth / img.naturalWidth;
      const scaleY = displayedHeight / img.naturalHeight;
      const baseScale = Math.min(scaleX, scaleY);
      const scale = baseScale * 2; // Scale lớn hơn 20% so với ảnh gốc

      // Tính offset ngang (dịch sang phải 1/8 chiều rộng)
      const offsetX = displayedWidth / 16;
      const offsetY = displayedHeight/ 8
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Vẽ tối đa 10 bounding box
      image.labels.slice(0, 10).forEach((label) => {
        const { trashType, bbox } = label;
        let [x, y, width, height] = bbox;

        // Chuẩn hóa và áp dụng scale lớn hơn, dịch sang phải
        x = (x * scale) +offsetX;
        y = (y * scale) - offsetY;
        width = width * scale;
        height = height * scale;

        // Đảm bảo bounding box không vượt ra ngoài canvas
        x = Math.min(Math.max(x, 0), displayedWidth - width);
        y = Math.min(Math.max(y, 0), displayedHeight - height);

        // Lấy màu sắc theo trashType
        const color = getColorForTrashType(trashType);

        // Vẽ bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Thêm tên class (trashType) phía trên bounding box
        if (trashType) {
          ctx.font = "14px Arial";
          ctx.fillStyle = color;
          ctx.textBaseline = "bottom";

          // Tính toán vị trí nhãn, dịch theo offsetX
          const textX = x;
          const textY = y - 5; // Đặt nhãn phía trên bounding box 5px

          // Đảm bảo nhãn không bị vẽ ra ngoài canvas
          const safeTextY = Math.max(14, textY);

          // Vẽ nền cho nhãn để dễ đọc
          const textWidth = ctx.measureText(trashType).width;
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Nền trắng mờ
          ctx.fillRect(textX - 2, safeTextY - 14, textWidth + 4, 16);

          // Vẽ tên class
          ctx.fillStyle = color;
          ctx.fillText(trashType, textX, safeTextY);
        }
      });
    };

    useEffect(() => {
      const img = imgRef.current;
      if (!img) return;

      const resizeObserver = new ResizeObserver(() => {
        drawBoundingBoxes();
      });

      if (img.complete) {
        drawBoundingBoxes();
      } else {
        img.addEventListener("load", drawBoundingBoxes);
      }

      // Theo dõi thay đổi kích thước của ảnh
      resizeObserver.observe(img);

      return () => {
        img.removeEventListener("load", drawBoundingBoxes);
        resizeObserver.unobserve(img);
      };
    }, [image]);

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4" style={{ transition: "none" }}>
        <div className="mb-4 relative">
          {image.image_path ? (
            <>
              <img
                ref={imgRef}
                id={`image-${image.data_id}`}
                src={`${API_BASE_URL}/${image.image_path}`}
                alt="Hình ảnh cần kiểm duyệt"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-image.jpg";
                }}
              />
              <canvas
                ref={canvasRef}
                id={`canvas-${image.data_id}`}
                className="absolute top-0 left-0 w-full h-48 rounded-lg pointer-events-none"
              />
            </>
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Không có hình ảnh</span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-medium">ID:</span> {image.data_id}</p>
          <p><span className="font-medium">Trạng thái:</span> {image.status === "unverified" ? "Chưa xác minh" : image.status === "verified" ? "Đã xác minh" : "Bị từ chối"}</p>
          <p><span className="font-medium">Ngày thêm:</span> {formatDate(image.added_at)}</p>
        </div>

        <div className="mt-4 flex space-x-3">
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg ${isProcessing ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"} text-white font-medium`}
          >
            {isProcessing ? "Đang xử lý..." : "Phê duyệt"}
          </button>
          <button
            onClick={onReject}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg ${isProcessing ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"} text-white font-medium`}
          >
            {isProcessing ? "Đang xử lý..." : "Từ chối"}
          </button>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.image.data_id === nextProps.image.data_id &&
    prevProps.isProcessing === nextProps.isProcessing
);

export default ImageModerationCard;