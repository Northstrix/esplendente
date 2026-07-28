'use client';
import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/custom/GlowingEffect';

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isRTL: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onClose,
  inputRef,
  isRTL,
}) => {
  const searchIconClass = isRTL ? 'right-3' : 'left-3';
  const closeIconClass = isRTL ? 'left-3' : 'right-3';
  const inputPaddingClass = isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10';

  return (
    <div className="relative mb-4">
      <div className="relative rounded-lg border border-[hsl(var(--border))] p-[2px]">
        <GlowingEffect
          spread={44}
          glow={true}
          disabled={false}
          proximity={100}
          inactiveZone={0.01}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            'w-full h-12 bg-background border-0 outline-none rounded-lg px-12 focus-visible:outline-none focus-visible:ring-0',
            inputPaddingClass
          )}
          placeholder=""
        />
      </div>

      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10',
          searchIconClass
        )}
        size={20}
      />

      <button
        onClick={onClose}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10',
          closeIconClass
        )}
        aria-label="Close search"
      >
        <X size={20} />
      </button>
    </div>
  );
};
