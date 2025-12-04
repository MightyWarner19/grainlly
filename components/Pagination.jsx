import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  hasNextPage,
  hasPrevPage
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      // Show first page, last page, current page, and pages around current
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentPage === i
                ? 'bg-lime-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={i} className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-white border border-gray-200 rounded-lg">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}-{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasPrevPage
                 ? 'bg-white text-lime-600 hover:bg-lime-100 border border-lime-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaArrowLeft />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        {/* Mobile Page Info */}
        <div className="sm:hidden px-3 py-1.5 text-sm font-medium text-gray-700">
          {currentPage} / {totalPages}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasNextPage
              ? 'bg-white text-lime-600 hover:bg-lime-100 border border-lime-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
