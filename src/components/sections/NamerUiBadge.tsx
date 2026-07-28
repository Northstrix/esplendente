'use client';
import React, { useState } from 'react';

interface NamerUiBadgeProps {
  href?: string;
  isRTL?: boolean;
  isMobile?: boolean;
  poweredByText?: string;
  namerUIName?: string;
}

export default function NamerUiBadge({
  href = 'https://namer-ui.vercel.app/',
  isRTL = false,
  isMobile = false,
  poweredByText = 'Powered by',
  namerUIName = 'Namer UI',
}: NamerUiBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    background: 'hsl(var(--background))',
    border: `1px solid hsl(var(--border))`,
    padding: isMobile ? '8px 16px 16px 16px' : '16px 24px 24px 24px',
    userSelect: 'none',
    maxWidth: 'max-content',
    textAlign: isRTL ? 'right' : 'left',
    transition: 'all 0.25s ease-in-out',
    cursor: 'pointer',
    direction: isRTL ? 'rtl' : 'ltr',
  };

  const hoverStyle: React.CSSProperties = {
    background: '#111',
    border: '1px solid #2a2a2a',
  };

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...(isHovered ? { ...baseStyle, ...hoverStyle } : baseStyle) }}
        className="inline-flex flex-col rounded-[var(--radius)] select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="powered-by-text text-[12px] mb-2"
          style={{
            userSelect: 'none',
            color: isHovered ? '#e1e1e1' : '#a1a1aa',
            transition: 'color 0.25s ease-in-out',
          }}
        >
          {poweredByText}
        </span>

        <div
          className="inline-flex items-center gap-3"
          style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}
        >
          <img
            src="/namer-ui-logo.png"
            alt={namerUIName}
            width={32}
            height={32}
            style={{ objectFit: 'contain', display: 'inline-block' }}
          />

          <span className="flip-wrapper">
            <span>
              <em className="flip-text">
                <span
                  className="font-bold text-base select-none"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {namerUIName}
                </span>
              </em>
            </span>
            <span>
              <em className="flip-text">
                <span
                  className="font-bold text-base select-none"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {namerUIName}
                </span>
              </em>
            </span>
          </span>
        </div>
      </a>

      <style jsx>{`
        .flip-wrapper {
          position: relative;
          display: block;
          perspective: 108px;
        }
        .flip-wrapper span {
          display: block;
        }
        .flip-wrapper span:nth-of-type(2) {
          position: absolute;
          top: 0;
          left: 0;
        }
        .flip-text {
          font-style: normal;
          display: inline-block;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          will-change: transform, opacity;
          transition: transform 0.55s cubic-bezier(0.645, 0.045, 0.355, 1),
            opacity 0.35s linear 0.2s;
        }
        .flip-wrapper span:nth-of-type(1) .flip-text {
          transform-origin: top;
          opacity: 1;
          transform: rotateX(0deg);
        }
        .flip-wrapper span:nth-of-type(2) .flip-text {
          opacity: 0;
          transform: rotateX(-90deg) scaleX(0.9) translate3d(0, 10px, 0);
          transform-origin: bottom;
        }
        a:hover .flip-wrapper span:nth-of-type(1) .flip-text {
          opacity: 0;
          transform: rotateX(90deg) scaleX(0.9) translate3d(0, -10px, 0);
        }
        a:hover .flip-wrapper span:nth-of-type(2) .flip-text {
          opacity: 1;
          transform: rotateX(0deg) scaleX(1) translateZ(0);
          transition: transform 0.75s cubic-bezier(0.645, 0.045, 0.355, 1),
            opacity 0.35s linear 0.3s;
        }
      `}</style>
    </>
  );
}
