import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, ExternalLink, Calendar, Hash, Globe } from 'lucide-react';
import { useState } from 'react';
import type { Item } from '../../../server/src/schema';

interface ItemDetailsModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailsModal({ item, isOpen, onClose }: ItemDetailsModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              className={`${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold text-white">
          {rating.toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism border-white/20 text-white max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-white pr-8">
              {item.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  {item.image_url && !imageError ? (
                    <>
                      {!imageLoaded && (
                        <div className="absolute inset-0 animate-shimmer shimmer-effect bg-white/5 rounded-lg" />
                      )}
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <div className="text-white/50 text-8xl">📦</div>
                    </div>
                  )}
                </div>

                {/* Price and Rating Card */}
                <div className="glassmorphism-dark p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Price</span>
                    {item.price ? (
                      <span className="text-2xl font-bold gradient-text">
                        ${item.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-white/50">Not available</span>
                    )}
                  </div>
                  
                  {item.rating && (
                    <>
                      <Separator className="bg-white/10" />
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Rating</span>
                        {renderStars(item.rating)}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Category */}
                {item.category && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                      Category
                    </h4>
                    <Badge className="gradient-bg text-white font-medium px-3 py-1">
                      {item.category}
                    </Badge>
                  </div>
                )}

                {/* Description */}
                {item.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                      Description
                    </h4>
                    <p className="text-white/90 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Details
                  </h4>
                  
                  <div className="glassmorphism-dark p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Hash size={16} className="text-white/60" />
                      <div>
                        <span className="text-white/60 text-sm">Item ID:</span>
                        <span className="text-white ml-2 font-mono">{item.id}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-white/60" />
                      <div>
                        <span className="text-white/60 text-sm">External ID:</span>
                        <span className="text-white ml-2 font-mono">{item.external_id}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-white/60" />
                      <div>
                        <span className="text-white/60 text-sm">Added:</span>
                        <span className="text-white ml-2">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {item.updated_at !== item.created_at && (
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-white/60" />
                        <div>
                          <span className="text-white/60 text-sm">Updated:</span>
                          <span className="text-white ml-2">
                            {new Date(item.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {item.source_url && (
                    <Button
                      onClick={() => window.open(item.source_url, '_blank')}
                      className="gradient-bg-alt hover:shadow-lg hover:shadow-pink-500/25 text-white font-medium flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      View Source
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}