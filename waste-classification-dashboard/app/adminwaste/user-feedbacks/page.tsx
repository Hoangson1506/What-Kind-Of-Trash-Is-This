"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/app-context";
import ApprovedFeedbackCard from "@/components/approved-feedback-card";
import Pagination from "@/components/pagination";
import PageTitle from "@/components/page-title";
import { useRouter } from "next/navigation";

export default function UserFeedbacks() {
  const router = useRouter();
  const {
    user,
    verifiedFeedbacks,
    currentModel,
    getResponseByStatus,
    error: contextError,
  } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);
  const itemsPerPage = 12;

  // Redirect to homepage if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Fetch verified feedbacks when model or user changes
  useEffect(() => {
    if (currentModel && user) {
      setCurrentPage(1); // Reset to page 1 on model change
      getResponseByStatus("verified")
        .then(() => console.log("Fetched verified feedbacks successfully"))
        .catch((err) => {
          const errorMessage = "Không thể tải phản hồi đã phê duyệt: " + (err as Error).message;
          setLocalError(errorMessage);
          console.error(errorMessage);
        });
    }
  }, [currentModel?.model_name, user, getResponseByStatus]);

  // Return null if user or currentModel is not available
  if (!user || !currentModel) {
    console.log("Missing user or currentModel:", { user, currentModel });
    return null;
  }

  // Filter verified feedbacks for the current model
  const approvedFeedbacks = verifiedFeedbacks.filter(
    (feedback) =>
      feedback.status === "verified" &&
      feedback.model_used === currentModel.model_name
  );

  // Log for debugging
  console.log("Current Model:", currentModel);
  console.log("All Verified Feedbacks:", verifiedFeedbacks);
  console.log("Approved Feedbacks for current model:", approvedFeedbacks);
  console.log("Approved Feedbacks Count:", approvedFeedbacks.length);
  console.log("Current Page:", currentPage);

  // Calculate pagination
  const totalPages = Math.ceil(approvedFeedbacks.length / itemsPerPage);
  console.log("Total Pages:", totalPages);

  // Ensure currentPage is valid when approvedFeedbacks or totalPages changes
  useEffect(() => {
    if (approvedFeedbacks.length === 0) {
      setCurrentPage(1);
      console.log("Reset currentPage to 1 due to no feedbacks");
      return;
    }
    const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
      console.log("Adjusted currentPage to:", validCurrentPage);
    }
  }, [approvedFeedbacks.length, totalPages, currentPage]);

  const currentFeedbacks = approvedFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  console.log("Current Feedbacks on page:", currentFeedbacks);

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