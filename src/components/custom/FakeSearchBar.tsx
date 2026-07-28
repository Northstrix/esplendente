'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { GlowingEffect } from '@/components/custom/GlowingEffect';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { cn } from '@/lib/utils';

export interface FakeSearchBarProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholderText?: string;
}

const FakeSearchBar = React.forwardRef<HTMLButtonElement, FakeSearchBarProps>(
  (
    {
      className,
      placeholderText = 'Search components...',
      style,
      ...props
    },
    ref
  ) => {
    const isRTL = useIsRTL();

    return (
      <div className="relative rounded-[var(--radius)] border border-[hsl(var(--border))] p-[2px]" style={{ borderRadius: 'var(--radius)' }}>
        <GlowingEffect
          spread={44}
          glow={true}
          disabled={false}
          proximity={100}
          inactiveZone={0.01}
        />
        <button
          ref={ref}
          type="button"
          {...props}
          className={cn(
            'w-full h-10 relative overflow-hidden bg-background text-[hsl(var(--foreground))] rounded-[var(--radius)] px-3 py-2 flex items-center gap-2 shadow-sm transition-all duration-200',
            className
          )}
          style={style}
        >
          {/* Search icon container - RTL mirrored, left-aligned */}
          <div
            className="flex items-center justify-center p-1 rounded-[var(--radius)] bg-[hsl(var(--secondary))]"
            style={{
              transform: isRTL ? 'scaleX(-1)' : 'none'
            }}
          >
            <Search 
              size={14} 
              className="text-[hsl(var(--secondary-foreground))]"
              style={{ 
                transform: isRTL ? 'scaleX(-1)' : 'none'
              }}
            />
          </div>
          
          {/* Placeholder text - LEFT aligned */}
          <span className="text-sm font-medium text-muted-foreground truncate">
            {placeholderText}
          </span>
        </button>
      </div>
    );
  }
);

FakeSearchBar.displayName = 'FakeSearchBar';

export default FakeSearchBar;
