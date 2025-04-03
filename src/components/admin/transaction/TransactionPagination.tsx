
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

const TransactionPagination: React.FC<TransactionPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPreviousPage,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const visiblePageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max visible, show all pages
      for (let i = 1; i <= totalPages; i++) {
        visiblePageNumbers.push(i);
      }
    } else {
      // Always include first page
      visiblePageNumbers.push(1);
      
      // Calculate the start and end of the window around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(currentPage + 1, totalPages - 1);
      
      // Adjust the window if needed
      if (currentPage <= 2) {
        end = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(totalPages - 3, 2);
      }
      
      // Add ellipsis if needed after first page
      if (start > 2) {
        visiblePageNumbers.push(-1); // -1 represents ellipsis
      }
      
      // Add the window pages
      for (let i = start; i <= end; i++) {
        visiblePageNumbers.push(i);
      }
      
      // Add ellipsis if needed before last page
      if (end < totalPages - 1) {
        visiblePageNumbers.push(-2); // -2 represents ellipsis
      }
      
      // Always include last page
      visiblePageNumbers.push(totalPages);
    }
    
    return visiblePageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={onPreviousPage} 
            className={currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}
          />
        </PaginationItem>

        {pageNumbers.map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === -1 || pageNumber === -2 ? (
              <span className="flex h-9 w-9 items-center justify-center">...</span>
            ) : (
              <PaginationLink
                isActive={currentPage === pageNumber}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext 
            onClick={onNextPage}
            className={currentPage >= totalPages ? "opacity-50 pointer-events-none" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TransactionPagination;
