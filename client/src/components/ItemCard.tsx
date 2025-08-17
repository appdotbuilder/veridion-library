import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { Item } from '../../../server/src/schema';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
  index: number;
}

export function ItemCard({ item, onViewDetails, index }: ItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-400'
            }`}
          />
        ))}
        <span className="text-sm text-white/70 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card 
      className="glassmorphism hover:bg-white/15 transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-2 group animate-fade-in-up overflow-hidden border-0"
      style={{ 
        animationDelay: `${index * 100}ms`,
        background: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {item.image_url && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-shimmer shimmer-effect bg-white/5 rounded-t-lg" />
            )}
            <img
              src={item.image_url}
              alt={item.title}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <div className="text-white/50 text-6xl">📦</div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category badge */}
        {item.category && (
          <Badge 
            className="absolute top-3 right-3 glassmorphism-dark text-white/90 hover:bg-black/20"
          >
            {item.category}
          </Badge>
        )}
        
        {/* Price badge */}
        {item.price && (
          <Badge 
            className="absolute top-3 left-3 gradient-bg-alt text-white font-semibold shadow-lg"
          >
            ${item.price.toFixed(2)}
          </Badge>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Title and Rating */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors overflow-hidden">
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              {item.title}
            </span>
          </h3>
          {renderStars(item.rating)}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-white/70 text-sm leading-relaxed overflow-hidden">
            <span className="block overflow-hidden" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const
            }}>
              {item.description}
            </span>
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Calendar size={14} />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {item.source_url && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.source_url, '_blank');
                }}
              >
                <ExternalLink size={16} />
              </Button>
            )}
            
            <Button
              onClick={() => onViewDetails(item)}
              className="gradient-bg-cool hover:shadow-lg hover:shadow-blue-500/25 text-white font-medium px-4 py-2 text-sm"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}