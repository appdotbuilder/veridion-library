import { useState, useEffect } from 'react';
import { X, BookOpen, User, Tag, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Book } from '../../../server/src/schema';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

export function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Split content into pages (roughly 500 characters per page for readability)
  const pages = book.content.split('\n\n').reduce((acc: string[], paragraph: string) => {
    if (paragraph.trim() === '') return acc;
    
    const lastPage = acc[acc.length - 1] || '';
    if (lastPage.length + paragraph.length < 500) {
      acc[acc.length - 1] = lastPage + (lastPage ? '\n\n' : '') + paragraph;
    } else {
      acc.push(paragraph);
    }
    return acc;
  }, ['']);

  const totalPages = Math.max(pages.length, 1);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
        nextPage();
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        prevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, onClose]);

  const nextPage = () => {
    if (currentPage < totalPages - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Reader Container */}
      <div className="w-full max-w-4xl h-full max-h-[90vh] backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold text-white">{book.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{book.authors}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span>{book.genre}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{book.created_at.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Page Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {pages.length > 0 ? (
                <div className="prose prose-invert prose-lg max-w-none">
                  <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {pages[currentPage]}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">No content available</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/20 bg-black/20">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0 || isAnimating}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                {/* Page Indicator */}
                <div className="flex items-center space-x-4">
                  <span className="text-white/70 text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  
                  {/* Page dots */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                      const pageIndex = totalPages <= 5 
                        ? index 
                        : Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + index;
                      
                      return (
                        <button
                          key={pageIndex}
                          onClick={() => setCurrentPage(pageIndex)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            pageIndex === currentPage
                              ? 'bg-white scale-125'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1 || isAnimating}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 text-center text-xs text-white/50">
                Use arrow keys to navigate • Press Esc to close
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}