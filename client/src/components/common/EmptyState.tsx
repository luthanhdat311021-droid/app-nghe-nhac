import React from 'react';
import { Disc, Music2 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-4 glass-panel rounded-3xl border border-white/5 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-glow">
        <Music2 className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-6 py-2.5 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
