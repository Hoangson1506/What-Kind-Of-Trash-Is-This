"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number; // Trang hiện tại, có thể được truyền từ ngoài
  totalPages: number; // Tổng số trang
  onPageChange: (page: number) => void; // Callback khi chuyển trang
  itemCount?: number; // Tổng số item (tùy chọn)
  itemsPerPage?: number; // Số item mỗi trang (tùy chọn)
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemCount,
  itemsPerPage,
}: PaginationProps) {
  // Đảm bảo currentPage nằm trong khoảng hợp lệ
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Tính toán phạm vi item đang hiển thị
  const startItem = itemCount && itemsPerPage ? (validCurrentPage - 1) * itemsPerPage + 1 : null;
  const endItem = itemCount && itemsPerPage ? Math.min(validCurrentPage * itemsPerPage, itemCount) : null;

  // Tạo danh sách các số trang để hiển thị
  const getPageNumbers = () => {
    const maxPagesToShow = 5; // Tối đa 5 nút trang
    const pages: (number | string)[] = [];

    let startPage = Math.max(1, validCurrentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Điều chỉnh startPage nếu endPage gần cuối
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Thêm trang đầu và dấu chấm nếu cần
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    // Thêm các trang trong phạm vi
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Thêm trang cuối và dấu chấm lửng nếu cần
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Gọi onPageChange nếu currentPage không hợp lệ
  useEffect(() => {
    if (currentPage !== validCurrentPage) {
      onPageChange(validCurrentPage);
    }
  }, [currentPage, validCurrentPage, onPageChange]);

  return (
    <div className="flex flex-col items-center space-y-2 mt-8">
      <div className="flex items-center justify-center space-x-2">
        {/* Nút Previous */}
        <button
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Danh sách số trang */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) =>
            typeof page === "string" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  page === validCurrentPage
                    ? "bg-green-100 text-green-800 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                aria-current={page === validCurrentPage ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Nút Next */}
        <button
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Hiển thị phạm vi item */}
      {itemCount !== undefined && startItem !== null && endItem !== null && (
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{itemCount}</span> items
        </div>
      )}
    </div>
  );
}