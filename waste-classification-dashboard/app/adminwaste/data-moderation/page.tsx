"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/app-context";
import ImageCard from "@/components/image-moderation-card";
import Pagination from "@/components/pagination";
import PageTitle from "@/components/page-title";
import { useRouter } from "next/navigation";

export default function DataModeration() {
  const {
    user,
    imageData,
    currentModel,
    getDataByStatus,
    approveImage,
    rejectImage,
    deleteDisapprovedImage,
    error: contextError,
  } = useAppContext();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());
  const [localError, setLocalError] = useState<string | null>(null);

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Lấy dữ liệu hình ảnh khi mô hình thay đổi
  useEffect(() => {
    setCurrentPage(1);
    if (currentModel && user) {
      getDataByStatus("unverified").catch((err) =>
        setLocalError("Không thể tải dữ liệu hình ảnh đang chờ: " + (err as Error).message)
      );
    }
  }, [currentModel?.model_name, user, getDataByStatus]);

  // Hiển thị lỗi từ context
  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  if (!user || !currentModel) return null;

  // Log để kiểm tra dữ liệu
  console.log("Current Model:", currentModel);
  console.log("All Image Data:", imageData);

  // Lọc dữ liệu hình ảnh đang chờ cho mô hình hiện tại
  const pendingImages = imageData.filter(
    (image) => image.status === "unverified"
  );
  console.log("Pending Images for current model:", pendingImages);

  // Tính toán số lượng hình ảnh chưa xác minh cho mô hình hiện tại
  const unverifiedSamplesCount = pendingImages.length;
  console.log("Unverified Samples Count (filtered):", unverifiedSamplesCount);

  // Tính toán phân trang
  const totalPages = Math.ceil(pendingImages.length / itemsPerPage);

  // Đảm bảo trang hiện tại hợp lệ
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  useEffect(() => {
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
  }, [validCurrentPage, currentPage]);

  const currentImages = pendingImages.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  // Xử lý hành động phê duyệt/từ chối
  const handleImageAction = async (data_id: number, action: "approve" | "reject") => {
    setProcessingItems((prev) => new Set(prev).add(data_id));

    try {
      if (action === "approve") {
        await approveImage(data_id);
      } else {
        await rejectImage(data_id);
        await deleteDisapprovedImage(data_id);
      }

      await getDataByStatus("unverified");

      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data_id);
        return newSet;
      });

      if (currentImages.length === 1 && validCurrentPage > 1 && totalPages > 1) {
        setCurrentPage(validCurrentPage - 1);
      }
    } catch (err) {
      setLocalError("Không thể xử lý dữ liệu hình ảnh: " + (err as Error).message);
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data_id);
        return newSet;
      });
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Duyệt dữ liệu hình ảnh" />
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center">
          <span className="font-medium mr-2">Hình ảnh đang chờ:</span>
          <span className="text-lg font-bold">{unverifiedSamplesCount}</span>
        </div>
      </div>

      {(localError || contextError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
          {localError || contextError}
        </div>
      )}

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          Hiển thị hình ảnh đang chờ cho mô hình:{" "}
          <span className="font-semibold">{currentModel.model_name}</span>
        </p>
      </div>

      {pendingImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">Không có hình ảnh đang chờ</h3>
          <p className="text-gray-500 mt-2">
            Tất cả hình ảnh cho {currentModel.model_name} đã được duyệt
          </p>
        </div>
      ) : currentImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">Không có hình ảnh trên trang này</h3>
          <p className="text-gray-500 mt-2">Chuyển sang trang khác để tiếp tục duyệt</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentImages.map((image) => (
              <ImageCard
                key={image.data_id}
                image={image}
                isProcessing={processingItems.has(image.data_id)}
                onApprove={() => handleImageAction(image.data_id, "approve")}
                onReject={() => handleImageAction(image.data_id, "reject")}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={validCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemCount={pendingImages.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}