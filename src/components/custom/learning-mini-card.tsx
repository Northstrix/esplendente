"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface LearningMiniCardProps {
  icon: React.ReactNode;
  label: string;
  content: string;
  className?: string;
  delay?: number;
  color?: "primary" | "accent";
  onClick?: () => void;
}

export function LearningMiniCard({
  icon,
  label,
  content,
  className,
  delay = 0,
  color = "primary",
  onClick,
}: LearningMiniCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Magnetic motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) * 0.25);
    mouseY.set((e.clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -15, 0],
        rotate: [0, 2, -2, 0],
      }}
      style={{
        x: springX,
        y: springY,
        // ORIGINAL semi-transparent glass background preserved
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.375) 100%)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.05)",
      }}
      transition={{
        y: {
          delay,
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        rotate: {
          delay,
          duration: 6,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
      }}
      className={cn(
        // Match WordSlider radius
        "group relative p-4 rounded-2xl z-30 min-w-[164px] cursor-pointer overflow-hidden select-none",
        // keep bottom sheen, but radius aligned with card
        "before:absolute before:left-0 before:right-0 before:bottom-0 before:bg-gradient-to-t before:from-white/10 before:to-transparent before:rounded-2xl before:pointer-events-none",
        "hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]",
        className
      )}
    >
      {/* Top lamp effect - match WordSlider */}
      <div
        className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-[70%] h-[1px] z-50"
        style={{
          background:
            "linear-gradient(90deg, transparent, #ffffff, transparent)",
          boxShadow:
            "0 1px 4px 0px #ffffff, 0 2px 10px 2px rgba(255, 255, 255, 0.3)",
        }}
      />

      {/* Chronicle Dots Background - match WordSlider, but keep subtle opacity */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "1.3rem 1.3rem",
          backgroundPosition: "50% 50%",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-[100px] flex items-center justify-center transition-all duration-300 shadow-lg",
            color === "primary"
              ? "bg-primary/20 text-primary group-hover:bg-primary/40 group-hover:shadow-primary/20"
              : "bg-accent/20 text-accent group-hover:bg-accent/40 group-hover:shadow-accent/20"
          )}
        >
          {icon}
        </div>
        <div>
          <span className="block text-[8px] text-white/50 font-bold uppercase tracking-[0.2em] mb-0.5">
            {label}
          </span>
          <span className="text-[13px] font-bold text-white tracking-tight group-hover:text-primary transition-colors">
            {content}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
