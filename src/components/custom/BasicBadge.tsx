"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BasicBadgeProps {
  children?: React.ReactNode;
  isSelected: boolean;
  isRevealed: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
  onClick?: () => void;
}

const BasicBadge: React.FC<BasicBadgeProps> = ({
  children,
  isSelected,
  isRevealed,
  isCorrect,
  disabled,
  onClick,
}) => {
  const getButtonStateClasses = () => {
    if (isRevealed) {
      if (isSelected && isCorrect) return "is-correct-selected";
      if (isSelected && !isCorrect) return "is-incorrect-selected";
      if (isCorrect) return "is-correct";
      return "is-revealed-inactive";
    }

    if (isSelected) {
      return "is-active";
    }

    return "is-default";
  };

  const isInteractive = !disabled && !isRevealed;

  return (
    <button
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        "simple-badge",
        getButtonStateClasses(),
        !isInteractive && "cursor-not-allowed"
      )}
    >
      <span className="badge-content relative z-[1]">{children}</span>
      <style jsx>{`
        .simple-badge {
          position: relative;
          overflow: hidden;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          text-align: center;
          border: 1px solid;
          transition: background-color 0.24s ease-in-out,
            border-color 0.24s ease-in-out,
            color 0.24s ease-in-out,
            opacity 0.24s ease-in-out;
        }

        @media (min-width: 768px) {
          .simple-badge {
            font-size: 1rem;
          }
        }

        /* Default badge */
        .is-default {
          background-color: hsl(var(--card));
          border-color: hsl(var(--border));
          color: hsl(var(--card-foreground));
        }

        /* Active (non-success/error) */
        .is-active {
          background-color: hsl(var(--primary));
          border-color: color-mix(in srgb, hsl(var(--primary)) 89.54%, white 10.46%);
          color: hsl(var(--primary-foreground));
        }

        /* Correct */
        .is-correct,
        .is-correct-selected {
          background-color: hsl(var(--success));
          border-color: color-mix(in srgb, hsl(var(--success)) 89.54%, white 10.46%);
          color: hsl(var(--background));
        }

        /* Incorrect */
        .is-incorrect-selected {
          background-color: hsl(var(--destructive));
          border-color: color-mix(
            in srgb,
            hsl(var(--destructive)) 89.54%,
            white 10.46%
          );
          color: hsl(var(--destructive-foreground));
        }

        /* Revealed inactive (disabled, non-success/error) */
        .is-revealed-inactive {
          background-color: hsl(var(--secondary));
          border-color: hsl(var(--secondary)); /* Matches background */
          color: hsl(var(--secondary-foreground));
          opacity: 0.5;
        }
      `}</style>
    </button>
  );
};

export default BasicBadge;
