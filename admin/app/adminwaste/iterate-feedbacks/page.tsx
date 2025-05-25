"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/app-context";
import FeedbackCard from "@/components/feedback-card";
import Pagination from "@/components/pagination";
import PageTitle from "@/components/page-title";
import { useRouter, useSearchParams } from "next/navigation";

export default function FeedbackModeration() {
  const {
    user,
    feedbacks,
    currentModel,
    getResponseByStatus,
    approveFeedback,
    rejectFeedback,
    error: contextError,
  } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Khởi tạo currentPage từ URL query hoặc mặc định trang 1
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(page) ? 1 : page;
  });
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());
  const [localError, setLocalError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Lấy phản hồi chưa phê duyệt khi mô hình hoặc user thay đổi
  useEffect(() => {
    if (currentModel && user) {
      getResponseByStatus("unverified").catch((err) => {
        const errorMessage = "Không thể tải phản hồi đang chờ: " + (err as Error).message;
        setLocalError(errorMessage);
        console.error(errorMessage);
      });
    }
  }, [currentModel?.model_name, user, getResponseByStatus]);

  // Cập nhật lỗi từ context
  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  // Cập nhật URL khi currentPage thay đổi
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", currentPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [currentPage, router, searchParams]);

  if (!user || !currentModel) return null;

  // Lọc phản hồi đang chờ cho mô hình hiện tại
  const pendingFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.status === "unverified" &&
      feedback.model_used === currentModel.model_name
  );

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(pendingFeedbacks.length / itemsPerPage));

  // Đảm bảo currentPage hợp lệ
  useEffect(() => {
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    if (validCurrentPage !== currentPage) {
      console.log("Adjusted currentPage from", currentPage, "to", validCurrentPage);
      setCurrentPage(validCurrentPage);
    }
  }, [currentPage, totalPages]);

  // Lấy phản hồi cho trang hiện tại
  const currentFeedbacks = pendingFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Ghi log để debug
  useEffect(() => {
    console.log({
      currentModel: currentModel.model_name,
      feedbacksCount: feedbacks.length,
      pendingFeedbacksCount: pendingFeedbacks.length,
      totalPages,
      currentPage,
      currentFeedbacksCount: currentFeedbacks.length,
    });
  }, [currentModel, feedbacks, pendingFeedbacks, totalPages, currentPage, currentFeedbacks]);

  // Xử lý hành động phê duyệt/từ chối
  const handleFeedbackAction = async (response_id: number, action: "approve" | "reject") => {
    setProcessingItems((prev) => new Set(prev).add(response_id));

    try {
      if (action === "approve") {
        await approveFeedback(response_id);
      } else {
        await rejectFeedback(response_id);
      }

      await getResponseByStatus("unverified");

      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(response_id);
        return newSet;
      });

      // Chuyển về trang trước nếu trang hiện tại rỗng và không phải trang 1
      if (currentFeedbacks.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      const errorMessage = "Không thể xử lý phản hồi: " + (err as Error).message;
      setLocalError(errorMessage);
      console.error(errorMessage);
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
          <span className="text-lg font-bold">{pendingFeedbacks.length}</span>
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
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page: number) => {
                console.log("Pagination onPageChange triggered with page:", page);
                setCurrentPage(page);
              }}
              itemCount={pendingFeedbacks.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}