import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import type { Book, BookSection } from '../../server/src/schema';
import { BookGrid } from '@/components/BookGrid';
import { BookReader } from '@/components/BookReader';
import { Header } from '@/components/Header';
import { SectionTabs } from '@/components/SectionTabs';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedSection, setSelectedSection] = useState<BookSection>('mind_and_machine');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Load books by section
  const loadBooksBySection = useCallback(async (section: BookSection) => {
    setIsLoading(true);
    try {
      const result = await trpc.getBooksBySection.query({ section });
      setBooks(result);
    } catch (error) {
      console.error('Failed to load books:', error);
      // For demo purposes, show placeholder books when API returns empty
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load books when section changes
  useEffect(() => {
    loadBooksBySection(selectedSection);
  }, [selectedSection, loadBooksBySection]);

  const handleSectionChange = (section: BookSection) => {
    setSelectedSection(section);
    setSelectedBook(null);
    setIsReaderOpen(false);
  };

  const handleBookClick = async (book: Book) => {
    try {
      // Fetch full book content
      const fullBook = await trpc.getBookById.query({ id: book.id });
      if (fullBook) {
        setSelectedBook(fullBook);
        setIsReaderOpen(true);
      }
    } catch (error) {
      console.error('Failed to load book content:', error);
      // For demo, just show the book data we have
      setSelectedBook(book);
      setIsReaderOpen(true);
    }
  };

  const handleCloseReader = () => {
    setIsReaderOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <SectionTabs 
            selectedSection={selectedSection} 
            onSectionChange={handleSectionChange} 
          />
          
          <div className="mt-8">
            <BookGrid 
              books={books}
              section={selectedSection}
              isLoading={isLoading}
              onBookClick={handleBookClick}
            />
          </div>
        </main>
      </div>

      {/* Book Reader Modal */}
      {isReaderOpen && selectedBook && (
        <BookReader 
          book={selectedBook} 
          onClose={handleCloseReader} 
        />
      )}
    </div>
  );
}

export default App;