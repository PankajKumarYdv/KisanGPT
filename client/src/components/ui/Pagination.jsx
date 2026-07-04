import React from 'react';
import Button from './Button.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6 bg-card border border-border rounded-2xl shadow-sm mt-6 text-foreground">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="text-xs rounded-xl"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="text-xs rounded-xl"
        >
          Next
        </Button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-semibold">
            Page <span className="font-bold text-foreground">{currentPage}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-card border border-border overflow-hidden" aria-label="Pagination">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isCurrent = pageNumber === currentPage;
              
              // Only render standard subset of pages if pagination is extremely large
              if (totalPages > 6) {
                if (
                  pageNumber !== 1 &&
                  pageNumber !== totalPages &&
                  Math.abs(pageNumber - currentPage) > 1
                ) {
                  // Render ellipses
                  if (pageNumber === 2 && currentPage > 3) {
                    return (
                      <span key="ell1" className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  if (pageNumber === totalPages - 1 && currentPage < totalPages - 2) {
                    return (
                      <span key="ell2" className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-bold transition-all ${
                    isCurrent
                      ? 'z-10 bg-primary text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
