import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({ message, onRetry, showRetry = true }: ErrorStateProps) {
  return (
    <Card className="glassmorphism border-red-500/20 p-8 text-center animate-scale-in">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 rounded-full bg-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">Something went wrong</h3>
          <p className="text-white/70 max-w-md">{message}</p>
        </div>
        
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            className="gradient-bg hover:shadow-lg hover:shadow-purple-500/25 text-white font-medium flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}

export function EmptyState() {
  return (
    <Card className="glassmorphism border-white/20 p-12 text-center animate-scale-in">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-8xl animate-float">📦</div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white">No Items Found</h3>
          <p className="text-white/70 max-w-md">
            We couldn't find any items matching your criteria. 
            Try adjusting your filters or check back later.
          </p>
        </div>
        
        <div className="text-white/50 text-sm">
          💡 The backend currently uses stub data. In a real implementation, 
          items would be fetched from external sources and stored in the database.
        </div>
      </div>
    </Card>
  );
}