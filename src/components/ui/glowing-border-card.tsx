'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/custom/GlowingEffect';

// ===== Base Glowing Border Card =====
const GlowingBorderCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { glowDisabled?: boolean }
>(({ className, children, glowDisabled = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-xl border border-white/10 bg-[hsl(var(--card))]/90 shadow-lg overflow-hidden transition-transform duration-200 backdrop-blur-sm hover:scale-[1.01]',
        className
      )}
      {...props}
    >
      {/* Outer glow border */}
      <GlowingEffect
        spread={50}
        glow
        disabled={glowDisabled}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={1}
      />

      {/* Inner content */}
      <div className="relative z-10 rounded-[inherit] overflow-hidden">
        {children}
      </div>
    </div>
  );
});
GlowingBorderCard.displayName = 'GlowingBorderCard';

// ===== Matching structural parts =====
const GlowingCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
GlowingCardHeader.displayName = 'GlowingCardHeader';

const GlowingCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-lg font-headline font-semibold leading-tight tracking-tight',
      className
    )}
    {...props}
  />
));
GlowingCardTitle.displayName = 'GlowingCardTitle';

const GlowingCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
GlowingCardDescription.displayName = 'GlowingCardDescription';

const GlowingCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-2', className)} {...props} />
));
GlowingCardContent.displayName = 'GlowingCardContent';

const GlowingCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-center p-4 pt-0', className)}
    {...props}
  />
));
GlowingCardFooter.displayName = 'GlowingCardFooter';

export {
  GlowingBorderCard,
  GlowingCardHeader,
  GlowingCardTitle,
  GlowingCardDescription,
  GlowingCardContent,
  GlowingCardFooter,
};
