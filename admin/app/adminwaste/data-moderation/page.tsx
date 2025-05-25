"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppContext } from "@/context/app-context";
import ImageCard from "@/components/image-moderation-card";
import Pagination from "@/components/pagination";
import PageTitle from "@/components/page-title";
import { useRouter, useSearchParams } from "next/navigation";

// Hàm debounce tùy chỉnh
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
};

// Memoize toàn bộ component để giảm render không cần thiết
const DataModeration = () => {
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
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const page = parseInt(searchParams?.get("page") || "1", 10);
    return isNaN(page) ? 1 : page;
  });
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState(true); // Theo dõi lần tải đầu tiên
  const itemsPerPage = 5;

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Cập nhật lỗi từ context
  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    } else {
      setLocalError(null);
    }
  }, [contextError]);

  // Cập nhật URL khi trang thay đổi
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", currentPage.toString());
    const pushWithTimeout = setTimeout(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    }, 100);
    return () => clearTimeout(pushWithTimeout);
  }, [currentPage, router, searchParams]);

  if (!user || !currentModel) return null;

  // Lọc hình ảnh chưa xác minh theo mô hình hiện tại
  const pendingImages = useMemo(() => {
    return imageData.filter(
      (image) => image.status === "unverified" 
    );
  }, [imageData, currentModel]);

  const totalPages = Math.max(1, Math.ceil(pendingImages.length / itemsPerPage));

  // Đảm bảo trang hiện tại hợp lệ
  useEffect(() => {
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
  }, [currentPage, totalPages]);

  // Tính toán hình ảnh cho trang hiện tại
  const currentImages = useMemo(() => {
    return pendingImages.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [pendingImages, currentPage, itemsPerPage]);

  // Debounce hàm fetchData
  const debouncedFetchData = useCallback(
    debounce(async () => {
      setIsLoading(true);
      setLocalError(null);
      try {
        await getDataByStatus("unverified");
      } catch (err) {
        const errorMessage = "Không thể tải dữ liệu hình ảnh đang chờ: " + (err as Error).message;
        setLocalError(errorMessage);
        console.error(errorMessage);
      } finally {
        setIsLoading(false);
        setInitialLoad(false); // Đánh dấu lần tải đầu tiên hoàn tất
      }
    }, 500),
    [getDataByStatus]
  );

  // Chỉ gọi API lần đầu tiên hoặc khi người dùng yêu cầu
  useEffect(() => {
    if (initialLoad && currentModel && user) {
      debouncedFetchData();
    }
  }, [initialLoad, currentModel, user, debouncedFetchData]);

  // Xử lý hành động phê duyệt/từ chối
  const handleImageAction = useCallback(
    async (data_id: number, action: "approve" | "reject") => {
      setProcessingItems((prev) => new Set(prev).add(data_id));

      try {
        if (action === "approve") {
          await approveImage(data_id);
        } else {
          await rejectImage(data_id);
          await deleteDisapprovedImage(data_id);
        }

        debouncedFetchData();

        setProcessingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data_id);
          return newSet;
        });

        if (currentImages.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        const errorMessage = "Không thể xử lý dữ liệu hình ảnh: " + (err as Error).message;
        setLocalError(errorMessage);
        console.error(errorMessage);
        setProcessingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data_id);
          return newSet;
        });
      }
    },
    [
      approveImage,
      rejectImage,
      deleteDisapprovedImage,
      debouncedFetchData,
      currentImages.length,
      currentPage,
    ]
  );

  return (
    <div className="container mx-auto" style={{ transition: "none" }}>
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Duyệt dữ liệu hình ảnh" />
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center">
          <span className="font-medium mr-2">Hình ảnh đang chờ:</span>
          <span className="text-lg font-bold">{pendingImages.length}</span>
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

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">Đang tải dữ liệu...</h3>
        </div>
      ) : pendingImages.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ transition: "none" }}>
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
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page: number) => {
                setCurrentPage(page);
              }}
              itemCount={pendingImages.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataModeration; // Xuất component đã memoized