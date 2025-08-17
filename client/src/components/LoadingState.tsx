import { Card } from '@/components/ui/card';

export function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card 
          key={index}
          className="glassmorphism border-white/20 overflow-hidden animate-pulse"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Image Skeleton */}
          <div className="h-48 bg-gradient-to-br from-white/5 to-white/10 animate-shimmer shimmer-effect" />
          
          <div className="p-6 space-y-4">
            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-6 bg-white/10 rounded animate-shimmer shimmer-effect" />
              <div className="h-4 bg-white/5 rounded w-3/4 animate-shimmer shimmer-effect" />
            </div>
            
            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded animate-shimmer shimmer-effect" />
              <div className="h-3 bg-white/5 rounded w-5/6 animate-shimmer shimmer-effect" />
              <div className="h-3 bg-white/5 rounded w-2/3 animate-shimmer shimmer-effect" />
            </div>
            
            {/* Footer Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="h-4 bg-white/5 rounded w-20 animate-shimmer shimmer-effect" />
              <div className="h-8 bg-white/10 rounded w-24 animate-shimmer shimmer-effect" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" 
             style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
    </div>
  );
}