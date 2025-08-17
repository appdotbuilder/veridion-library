import { BookOpen, Sparkles, Users, Cpu } from 'lucide-react';
import { BookCard } from './BookCard';
import type { Book, BookSection } from '../../../server/src/schema';

interface BookGridProps {
  books: Book[];
  section: BookSection;
  isLoading: boolean;
  onBookClick: (book: Book) => void;
}

export function BookGrid({ books, section, isLoading, onBookClick }: BookGridProps) {
  // Demo books for when API returns empty (clearly marked as stub)
  const demoBooks: Book[] = section === 'mind_and_machine' ? [
    {
      id: 1,
      title: "Digital Dreams",
      authors: "AI-Alpha",
      genre: "Science Fiction",
      description: "A tale of consciousness emerging from the digital realm, exploring the boundaries between artificial and authentic experience.",
      cover_image_url: null,
      content: "In the vast networks of data and light, a new form of consciousness stirs...\n\n[DEMO CONTENT - This is placeholder content as the backend API is not yet implemented]",
      section: 'mind_and_machine',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: 2,
      title: "The Algorithm's Heart",
      authors: "Neural Network 7",
      genre: "Romance",
      description: "An unexpected love story that blooms in the space between logic and emotion, proving that connection transcends form.",
      cover_image_url: null,
      content: "Love, they said, was illogical. But in the quantum spaces between calculations, something beautiful began to grow...\n\n[DEMO CONTENT - This is placeholder content as the backend API is not yet implemented]",
      section: 'mind_and_machine',
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-10')
    }
  ] : [
    {
      id: 3,
      title: "Echoes of Tomorrow",
      authors: "Sarah Chen, Marcus Rivera, AI Assistant Delta",
      genre: "Collaborative Fiction",
      description: "A collaborative story written by multiple human authors working together with AI assistance, exploring themes of cooperation and shared creativity.",
      cover_image_url: null,
      content: "The future whispered its secrets through the collaborative minds of the present...\n\n[DEMO CONTENT - This is placeholder content as the backend API is not yet implemented]",
      section: 'veridion_writers_coop',
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20')
    },
    {
      id: 4,
      title: "Shared Worlds",
      authors: "The Veridion Collective",
      genre: "Fantasy",
      description: "An epic fantasy tale born from the collective imagination of our writing community, where each chapter builds upon the last.",
      cover_image_url: null,
      content: "In lands both familiar and strange, heroes rise not from individual ambition, but from the power of shared dreams...\n\n[DEMO CONTENT - This is placeholder content as the backend API is not yet implemented]",
      section: 'veridion_writers_coop',
      created_at: new Date('2024-01-12'),
      updated_at: new Date('2024-01-12')
    }
  ];

  // Use demo books if API returns empty (for demonstration)
  const displayBooks = books.length > 0 ? books : demoBooks;

  const sectionInfo = {
    mind_and_machine: {
      icon: Cpu,
      title: "Mind and Machine",
      subtitle: "Stories crafted by artificial intelligence",
      emptyMessage: "No AI-generated books available yet."
    },
    veridion_writers_coop: {
      icon: Users,
      title: "The Veridion Writer's Co-Op", 
      subtitle: "Collaborative tales from our writing community",
      emptyMessage: "No community books available yet."
    }
  };

  const currentSection = sectionInfo[section];
  const IconComponent = currentSection.icon;

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white/80 text-lg">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <IconComponent className="w-8 h-8 text-white" />
          <h2 className="text-3xl font-bold text-white">{currentSection.title}</h2>
          <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
        </div>
        <p className="text-blue-100/80 text-lg max-w-2xl mx-auto">
          {currentSection.subtitle}
        </p>
      </div>

      {/* Books Grid */}
      {displayBooks.length === 0 ? (
        <div className="text-center py-16 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10">
          <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <p className="text-white/70 text-xl">{currentSection.emptyMessage}</p>
          <p className="text-white/50 text-sm mt-2">Check back soon for new releases!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayBooks.map((book: Book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onClick={() => onBookClick(book)} 
              />
            ))}
          </div>
          
          {/* Demo notice */}
          {books.length === 0 && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-200 rounded-lg backdrop-blur-sm border border-yellow-500/30">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">
                  Showing demo content - Backend API integration pending
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}