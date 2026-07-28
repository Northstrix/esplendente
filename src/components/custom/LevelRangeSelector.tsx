'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlowingEffect } from '@/components/custom/GlowingEffect';

interface LevelRangeSelectorProps {
  levelRanges: { value: string; label: string }[];
  activeTab: string;
  setActiveTab: (value: string) => void;
  onNavigate: (target: string) => void;
}

export default function LevelRangeSelector({
  levelRanges,
  activeTab,
  setActiveTab,
  onNavigate,
}: LevelRangeSelectorProps) {
  const { direction, t } = useApp();
  const isRTL = useIsRTL();
  const isMobile = useIsMobile();

  const currentIndex = levelRanges.findIndex((r) => r.value === activeTab);

  const triggerChange = (newValue: string) => {
    setActiveTab(newValue);
    onNavigate?.('level-selector');
  };

  const goNext = () => {
    const next = (currentIndex + 1) % levelRanges.length;
    triggerChange(levelRanges[next].value);
  };

  const goPrev = () => {
    const prev = (currentIndex - 1 + levelRanges.length) % levelRanges.length;
    triggerChange(levelRanges[prev].value);
  };

  return (
    <div className="flex justify-center w-full">
      <div
        className={cn(
          'relative inline-flex items-center gap-3 mt-8 select-none w-auto rounded-[var(--radius)]',
          isRTL && 'flex-row-reverse',
          isMobile ? 'gap-2 mt-6' : 'gap-3 mt-8'
        )}
        dir={direction}
        style={{ borderRadius: 'var(--radius)' }}
      >
        {/* Glowing border container */}
        <div
          className="relative rounded-[var(--radius)] border border-[hsl(var(--border))] p-[2px]"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <GlowingEffect
            spread={44}
            glow={true}
            disabled={false}
            proximity={100}
            inactiveZone={0.01}
          />

          {/* Main content container */}
          <div
            className={cn(
              'relative inline-flex items-center gap-3 select-none w-auto bg-background text-[hsl(var(--foreground))] shadow-sm rounded-[var(--radius)]',
              isRTL && 'flex-row-reverse',
              isMobile ? 'p-2 gap-2 flex-col' : 'p-2 gap-3'
            )}
            style={{ borderRadius: 'var(--radius)' }}
          >
            {/* Desktop: same horizontal layout */}
            {!isMobile && (
              <>
                <button
                  onClick={isRTL ? goNext : goPrev}
                  aria-label={isRTL ? 'Next range' : 'Previous range'}
                  className="rounded-[var(--radius)] transition-all duration-200 ease-in-out bg-transparent hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] p-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="inline-flex items-center w-auto gap-3">
                  <span className="font-semibold whitespace-nowrap text-sm md:text-base">
                    {t('levels')}
                  </span>

                  <ul className="inline-flex flex-wrap items-center justify-center w-auto gap-2">
                    {levelRanges.map((r) => (
                      <li
                        key={r.value}
                        onClick={() => triggerChange(r.value)}
                        className={cn(
                          'cursor-pointer rounded-[var(--radius)] font-medium whitespace-nowrap transition-colors ease-in-out px-3 py-1.5 text-sm duration-300',
                          activeTab === r.value
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]'
                        )}
                      >
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={isRTL ? goPrev : goNext}
                  aria-label={isRTL ? 'Previous range' : 'Next range'}
                  className="rounded-[var(--radius)] transition-all duration-200 ease-in-out bg-transparent hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] p-2"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Mobile layout completely separate */}
            {isMobile && (
              <div className="flex flex-col w-full items-center gap-2">
                {/* Label */}
                <span className="font-semibold text-xs text-center">
                  {t('levels')}
                </span>

                {/* Level buttons flanked by next/prev */}
                <div className="flex w-full items-stretch justify-center gap-2">
                  {/* Prev button (left side) */}
                  {isRTL ? (
                    <button
                      onClick={isRTL ? goPrev : goNext}
                      aria-label={isRTL ? 'Previous range' : 'Next range'}
                      className="rounded-[var(--radius)] flex items-center justify-center w-9 h-auto bg-transparent hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 ease-in-out"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={isRTL ? goNext : goPrev}
                      aria-label={isRTL ? 'Next range' : 'Previous range'}
                      className="rounded-[var(--radius)] flex items-center justify-center w-9 h-auto bg-transparent hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 ease-in-out"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {/* Grid of range selectors */}
                  <ul className="grid grid-cols-3 gap-1 w-full">
                    {levelRanges.map((r) => (
                      <li
                        key={r.value}
                        onClick={() => triggerChange(r.value)}
                        className={cn(
                          'cursor-pointer rounded-[var(--radius)] font-medium whitespace-nowrap text-center transition-colors ease-in-out px-2 py-1 text-xs duration-200',
                          activeTab === r.value
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]'
                        )}
                      >
                        {r.label}
                      </li>
                    ))}
                  </ul>

                  {/* Next button (right side) */}
                  {isRTL ? (
                    <button
                      onClick={isRTL ? goNext : goPrev}
                      aria-label={isRTL ? 'Next range' : 'Previous range'}
                      className="rounded-[var(--radius)] flex items-center justify-center w-9 h-auto bg-transparent hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 ease-in-out"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={isRTL ? goPrev : goNext}
                      aria-label={isRTL ? 'Previous range' : 'Next range'}
                      className="rounded-[var(--radius)] flex items-center justify-center w-9 h-auto bg-transparent hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 ease-in-out"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
