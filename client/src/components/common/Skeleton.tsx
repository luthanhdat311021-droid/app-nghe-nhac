import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="glass-card p-3.5 rounded-2xl animate-pulse space-y-3">
    <div className="w-full aspect-square rounded-xl bg-white/5" />
    <div className="h-4 bg-white/10 rounded w-3/4" />
    <div className="h-3 bg-white/5 rounded w-1/2" />
  </div>
);

export const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/5 animate-pulse">
    <div className="w-8 h-4 bg-white/10 rounded" />
    <div className="w-11 h-11 rounded-xl bg-white/10" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-white/10 rounded w-1/3" />
      <div className="h-3 bg-white/5 rounded w-1/4" />
    </div>
    <div className="w-12 h-3 bg-white/10 rounded" />
  </div>
);
