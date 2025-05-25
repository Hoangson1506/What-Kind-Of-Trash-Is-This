"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemCount?: number
  itemsPerPage?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemCount,
  itemsPerPage,
}: PaginationProps) {
  // Calculate the range of items being displayed
  const startItem = itemCount && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null
  const endItem = itemCount && itemsPerPage ? Math.min(currentPage * itemsPerPage, itemCount) : null

  return (
    <div className="flex flex-col items-center space-y-2 mt-8">
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-1">
          {/* First page */}
          {currentPage > 2 && (
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
            >
              1
            </button>
          )}

          {/* Ellipsis if needed */}
          {currentPage > 3 && <span className="px-2">...</span>}

          {/* Previous page if not first */}
          {currentPage > 1 && (
            <button
              onClick={() => onPageChange(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
            >
              {currentPage - 1}
            </button>
          )}

          {/* Current page */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md bg-green-100 text-green-800 font-medium"
            disabled
          >
            {currentPage}
          </button>

          {/* Next page if not last */}
          {currentPage < totalPages && (
            <button
              onClick={() => onPageChange(currentPage + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
            >
              {currentPage + 1}
            </button>
          )}

          {/* Ellipsis if needed */}
          {currentPage < totalPages - 2 && <span className="px-2">...</span>}

          {/* Last page */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
            >
              {totalPages}
            </button>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Item range display */}
      {itemCount !== undefined && startItem !== null && endItem !== null && (
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{itemCount}</span> items
        </div>
      )}
    </div>
  )
}
