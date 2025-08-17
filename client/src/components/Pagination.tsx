import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasMore
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className="glassmorphism border-white/20 p-6 mt-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results info */}
        <div className="text-white/70 text-sm">
          Showing {startItem}-{endItem} of {totalItems} items
          {hasMore && (
            <span className="ml-2 text-blue-400">
              (More available)
            </span>
          )}
        </div>

        {/* Page controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {visiblePages.map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? 'default' : 'ghost'}
                size="sm"
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`min-w-[40px] ${
                  page === currentPage
                    ? 'gradient-bg-cool text-white shadow-lg shadow-blue-500/25'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${page === '...' ? 'cursor-default hover:bg-transparent' : ''}`}
              >
                {page}
              </Button>
            ))}
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasMore}
            className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}