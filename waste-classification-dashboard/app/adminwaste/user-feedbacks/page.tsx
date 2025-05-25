"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/app-context";
import ApprovedFeedbackCard from "@/components/approved-feedback-card";
import Pagination from "@/components/pagination";
import PageTitle from "@/components/page-title";
import { useRouter, useSearchParams } from "next/navigation";

export default function UserFeedbacks() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    verifiedFeedbacks,
    currentModel,
    getResponseByStatus,
    error: contextError,
  } = useAppContext();

  // Khởi tạo currentPage từ URL query hoặc mặc định trang 1
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(page) ? 1 : page;
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const itemsPerPage = 12;

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Lấy phản hồi đã phê duyệt khi model hoặc user thay đổi
  useEffect(() => {
    if (currentModel && user) {
      getResponseByStatus("verified")
        .then(() => console.log("Fetched verified feedbacks successfully"))
        .catch((err) => {
          const errorMessage = "Không thể tải phản hồi đã phê duyệt: " + (err as Error).message;
          setLocalError(errorMessage);
          console.error(errorMessage);
        });
    }
  }, [currentModel?.model_name, user, getResponseByStatus]);

  // Cập nhật URL khi currentPage thay đổi
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", currentPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [currentPage, router, searchParams]);

  // Nếu không có user hoặc currentModel, trả về null
  if (!user || !currentModel) {
    console.log("Missing user or currentModel:", { user, currentModel });
    return null;
  }

  // Lọc phản hồi đã phê duyệt cho mô hình hiện tại
  const approvedFeedbacks = verifiedFeedbacks.filter(
    (feedback) =>
      feedback.status === "verified" &&
      feedback.model_used === currentModel.model_name
  );

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(approvedFeedbacks.length / itemsPerPage));

  // Đảm bảo currentPage hợp lệ
  useEffect(() => {
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    if (validCurrentPage !== currentPage) {
      console.log("Adjusted currentPage from", currentPage, "to", validCurrentPage);
      setCurrentPage(validCurrentPage);
    }
  }, [currentPage, totalPages]);

  // Lấy phản hồi cho trang hiện tại
  const currentFeedbacks = approvedFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Ghi log để debug
  useEffect(() => {
    console.log({
      currentModel: currentModel.model_name,
      verifiedFeedbacksCount: verifiedFeedbacks.length,
      approvedFeedbacksCount: approvedFeedbacks.length,
      totalPages,
      currentPage,
      currentFeedbacksCount: currentFeedbacks.length,
    });
  }, [currentModel, verifiedFeedbacks, approvedFeedbacks, totalPages, currentPage, currentFeedbacks]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Phản hồi đã phê duyệt" />
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center">
          <span className="font-medium mr-2">Phản hồi đã phê duyệt:</span>
          <span className="text-lg font-bold">{approvedFeedbacks.length}</span>
        </div>
      </div>

      {(localError || contextError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
          {localError || contextError}
        </div>
      )}

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          Hiển thị phản hồi đã phê duyệt cho mô hình:{" "}
          <span className="font-semibold">{currentModel.model_name}</span>
        </p>
      </div>

      {approvedFeedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">Không có phản hồi đã phê duyệt</h3>
          <p className="text-gray-500 mt-2">
            Phê duyệt phản hồi từ trang Duyệt phản hồi cho {currentModel.model_name}
          </p>
        </div>
      ) : currentFeedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">Không có phản hồi trên trang này</h3>
          <p className="text-gray-500 mt-2">Chuyển sang trang khác để xem thêm phản hồi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFeedbacks.map((feedback) => (
              <ApprovedFeedbackCard key={feedback.response_id} feedback={feedback} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page: number) => {
                console.log("Pagination onPageChange triggered with page:", page);
                setCurrentPage(page);
              }}
              itemCount={approvedFeedbacks.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}