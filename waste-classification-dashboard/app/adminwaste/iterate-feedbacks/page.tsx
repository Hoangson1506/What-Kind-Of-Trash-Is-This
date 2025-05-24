"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/app-context";
import FeedbackCard from "@/components/feedback-card";
import Pagination from "@/components/pagination";
import PageTitle from "@/components/page-title";
import { useRouter } from "next/navigation";

export default function FeedbackModeration() {
  const {
    user,
    feedbacks,
    currentModel,
    getResponseByStatus,
    approveFeedback,
    rejectFeedback,
    deleteDisapprovedResponse,
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

  // Lấy phản hồi khi mô hình thay đổi
  useEffect(() => {
    setCurrentPage(1);
    if (currentModel && user) {
      getResponseByStatus("unverified").catch((err) =>
        setLocalError("Không thể tải phản hồi đang chờ: " + (err as Error).message)
      );
    }
  }, [currentModel?.model_name, user, getResponseByStatus]);

  // Hiển thị lỗi từ context
  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  if (!user || !currentModel) return null;

  // Log để kiểm tra dữ liệu
  console.log("Current Model:", currentModel);
  console.log("All Feedbacks:", feedbacks);

  // Lọc phản hồi đang chờ cho mô hình hiện tại
  const pendingFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.status === "unverified" &&
      feedback.model_used === currentModel.model_name
  );
  console.log("Pending Feedbacks for current model:", pendingFeedbacks);

  // Tính toán số lượng phản hồi đang chờ cho mô hình hiện tại
  const pendingFeedbacksCount = pendingFeedbacks.length;
  console.log("Pending Feedbacks Count (filtered):", pendingFeedbacksCount);

  // Tính toán phân trang
  const totalPages = Math.ceil(pendingFeedbacks.length / itemsPerPage);

  // Đảm bảo trang hiện tại hợp lệ
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  useEffect(() => {
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
  }, [validCurrentPage, currentPage]);

  const currentFeedbacks = pendingFeedbacks.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  // Xử lý hành động phê duyệt/từ chối
  const handleFeedbackAction = async (response_id: number, action: "approve" | "reject") => {
    setProcessingItems((prev) => new Set(prev).add(response_id));

    try {
      if (action === "approve") {
        await approveFeedback(response_id);
      } else {
        await rejectFeedback(response_id);
        await deleteDisapprovedResponse(response_id);
      }

      await getResponseByStatus("unverified");

      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(response_id);
        return newSet;
      });

      if (currentFeedbacks.length === 1 && validCurrentPage > 1 && totalPages > 1) {
        setCurrentPage(validCurrentPage - 1);
      }
    } catch (err) {
      setLocalError("Không thể xử lý phản hồi: " + (err as Error).message);
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(response_id);
        return newSet;
      });
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Duyệt phản hồi" />
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center">
          <span className="font-medium mr-2">Phản hồi đang chờ:</span>
          <span className="text-lg font-bold">{pendingFeedbacksCount}</span>
        </div>
      </div>

      {(localError || contextError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
          {localError || contextError}
        </div>
      )}

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          Hiển thị phản hồi đang chờ cho mô hình:{" "}
          <span className="font-semibold">{currentModel.model_name}</span>
        </p>
      </div>

      {pendingFeedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">Không có phản hồi đang chờ</h3>
          <p className="text-gray-500 mt-2">
            Tất cả phản hồi cho {currentModel.model_name} đã được duyệt
          </p>
        </div>
      ) : currentFeedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">Không có phản hồi trên trang này</h3>
          <p className="text-gray-500 mt-2">Chuyển sang trang khác để tiếp tục duyệt</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.response_id}
                feedback={feedback}
                isProcessing={processingItems.has(feedback.response_id)}
                onApprove={() => handleFeedbackAction(feedback.response_id, "approve")}
                onReject={() => handleFeedbackAction(feedback.response_id, "reject")}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={validCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemCount={pendingFeedbacks.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}