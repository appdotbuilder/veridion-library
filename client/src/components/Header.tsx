import { Book, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="relative">
      {/* Glassmorphism header bar */}
      <div className="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Book className="w-8 h-8 text-white" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              The Veridion Library
            </h1>
          </div>
          
          {/* Subtitle */}
          <div className="text-center mt-2">
            <p className="text-blue-100/80 text-lg font-light">
              A Collection of Stories from Minds Both Digital and Human
            </p>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-60"></div>
    </header>
  );
}