"use client";
import React, { useEffect, useRef } from "react";

interface PositionAwareButtonProps {
  children?: React.ReactNode;
  buttonWidth?: string;
  borderRadius?: string;
  buttonColor?: string; // main fill
  filamentColor?: string; // center glow
  glossColor?: string; // glossy highlight
  fontSize?: string;
  fontWeight?: string | number;
  foregroundColor?: string; // text/icon color
  hoverForegroundColor?: string;
  fontFamily?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
}

const PositionAwareButton: React.FC<PositionAwareButtonProps> = ({
  children,
  buttonWidth = "fit-content",
  borderRadius = "var(--radius)",
  buttonColor = "hsl(var(--foreground))",
  filamentColor = "hsl(var(--primary))",
  glossColor = "hsla(var(--background), 0.2)",
  fontSize,
  fontWeight = 500,
  foregroundColor = "hsl(var(--background))",
  hoverForegroundColor = "hsl(var(--foreground))",
  fontFamily,
  onClick,
  className,
  disabled,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || disabled) return;

    const updatePosition = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      button.style.setProperty("--x", `${relativeX}px`);
      button.style.setProperty("--y", `${relativeY}px`);
    };

    button.addEventListener("mousemove", updatePosition);
    button.addEventListener("mouseenter", updatePosition);
    button.addEventListener("mouseleave", updatePosition);

    return () => {
      button.removeEventListener("mousemove", updatePosition);
      button.removeEventListener("mouseenter", updatePosition);
      button.removeEventListener("mouseleave", updatePosition);
    };
  }, [disabled]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={className}
      disabled={disabled}
      style={
        {
          width: buttonWidth,
          borderRadius,
          "--button-color": buttonColor,
          "--filament-color": filamentColor,
          "--gloss-color": glossColor,
          fontSize,
          fontWeight,
          fontFamily: fontFamily || undefined,
          "--text-color": foregroundColor,
          "--hover-text-color": hoverForegroundColor,
        } as React.CSSProperties
      }
    >
      <span className="button-content">{children}</span>
      <style jsx>{`
        @property --r {
          syntax: "<length-percentage>";
          initial-value: 0px;
          inherits: false;
        }

        button {
          position: relative;
          place-self: center;
          border: none; /* Removed border entirely */
          padding: 0.5em 1.5em;
          box-shadow: inset 1px 3px 1px var(--gloss-color);
          background: radial-gradient(
              circle at var(--x, 0%) var(--y, 0%),
              var(--filament-color) calc(var(--r) - 1px),
              var(--button-color) var(--r)
            )
            border-box;
          transition: --r 0.35s;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5em;
          overflow: hidden;
        }

        button:hover:not(:disabled) {
          --r: 100%;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .button-content {
          color: var(--text-color);
          display: inline-block;
          transition: color 0.3s ease-out;
        }

        button:hover:not(:disabled) .button-content {
          color: var(--hover-text-color);
        }
      `}</style>
    </button>
  );
};

export default PositionAwareButton;