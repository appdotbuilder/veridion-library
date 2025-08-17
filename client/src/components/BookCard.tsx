import { BookOpen, Calendar, User, Tag } from 'lucide-react';
import type { Book } from '../../../server/src/schema';

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  // Generate a gradient based on genre
  const getGenreGradient = (genre: string) => {
    const genreGradients: Record<string, string> = {
      'Science Fiction': 'from-cyan-400/80 to-blue-500/80',
      'Romance': 'from-pink-400/80 to-rose-500/80',
      'Fantasy': 'from-purple-400/80 to-indigo-500/80',
      'Mystery': 'from-gray-400/80 to-slate-500/80',
      'Collaborative Fiction': 'from-emerald-400/80 to-teal-500/80',
      'default': 'from-indigo-400/80 to-purple-500/80'
    };
    return genreGradients[genre] || genreGradients.default;
  };

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
    >
      {/* Card Container with Glassmorphism */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 group-hover:bg-white/15">
        
        {/* Cover Image or Placeholder */}
        <div className="relative h-48 overflow-hidden">
          {book.cover_image_url ? (
            <img 
              src={book.cover_image_url} 
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getGenreGradient(book.genre)} flex items-center justify-center relative overflow-hidden`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full animate-pulse delay-1000"></div>
              </div>
              
              <BookOpen className="w-16 h-16 text-white drop-shadow-lg" />
              
              {/* Genre badge */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full">
                <span className="text-white text-xs font-medium">{book.genre}</span>
              </div>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-white font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              Click to Read
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-blue-200 transition-colors">
            {book.title}
          </h3>

          {/* Authors */}
          <div className="flex items-center space-x-2 text-blue-100/80">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{book.authors}</span>
          </div>

          {/* Genre Tag */}
          <div className="flex items-center space-x-2 text-purple-200/80">
            <Tag className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{book.genre}</span>
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm line-clamp-3 leading-relaxed">
            {book.description}
          </p>

          {/* Created Date */}
          <div className="flex items-center space-x-2 text-white/50">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">
              {book.created_at.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div className={`h-1 bg-gradient-to-r ${getGenreGradient(book.genre)} opacity-60 group-hover:opacity-100 transition-opacity`}></div>
      </div>
    </div>
  );
}