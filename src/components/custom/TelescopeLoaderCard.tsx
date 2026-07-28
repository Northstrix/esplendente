"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps, Variants } from "framer-motion";

import { useApp } from "@/context/AppContext";
import { useIsRTL } from "@/hooks/use-is-rtl";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/custom/GlowingEffect";

// ========= TelescopeIcon =========
export interface TelescopeIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TelescopeIconProps extends HTMLMotionProps<"div"> {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
}

const TelescopeIcon = forwardRef<TelescopeIconHandle, TelescopeIconProps>(
  ({ className, size = 48, duration = 1.2, isAnimated = true, ...props }, ref) => {
    const groupControls = useAnimation();
    const tubeControls = useAnimation();
    const lensControls = useAnimation();
    const legsControls = useAnimation();
    const reduced = useReducedMotion();

    useImperativeHandle(ref, () => ({
      startAnimation: () => startAnim(),
      stopAnimation: () => stopAnim(),
    }));

    const startAnim = () => {
      if (reduced) {
        groupControls.start("normal");
        tubeControls.start("normal");
        lensControls.start("normal");
        legsControls.start("normal");
      } else {
        groupControls.start("animate");
        tubeControls.start("animate");
        lensControls.start("animate");
        legsControls.start("animate");
      }
    };

    const stopAnim = () => {
      groupControls.stop();
      tubeControls.stop();
      lensControls.stop();
      legsControls.stop();
    };

    // Auto-start continuous animation
    useEffect(() => {
      if (isAnimated && !reduced) startAnim();
      return () => stopAnim();
    }, [isAnimated, reduced]);

    const iconVariants: Variants = {
      normal: { scale: 1, rotate: 0, y: 0 },
      animate: {
        scale: [1, 1.05, 0.97, 1],
        rotate: [0, -2, 2, 0],
        y: [0, -1, 0.5, 0],
        transition: {
          duration: 0.9 * duration,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
      },
    };

    const tubeVariants: Variants = {
      normal: { x: 0, rotate: 0, opacity: 1 },
      animate: {
        x: [0, 1.5, 0],
        rotate: [0, -3, 0],
        opacity: 1,
        transition: {
          duration: 0.8 * duration,
          ease: "easeInOut",
          delay: 0.1,
          repeat: Infinity,
          repeatType: "mirror",
        },
      },
    };

    const smallBarVariants: Variants = {
      normal: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0.8, 1],
        transition: {
          duration: 0.7 * duration,
          ease: "easeInOut",
          delay: 0.15,
          repeat: Infinity,
          repeatType: "mirror",
        },
      },
    };

    const legsVariants: Variants = {
      normal: { scaleY: 1, y: 0, transformOrigin: "50% 100%" },
      animate: {
        scaleY: [1, 1.04, 1],
        y: [0, -0.6, 0],
        transition: {
          duration: 0.7 * duration,
          ease: "easeOut",
          delay: 0.2,
          repeat: Infinity,
          repeatType: "mirror",
        },
      },
    };

    const lensVariants: Variants = {
      normal: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 1.15, 1],
        opacity: [1, 0.9, 1],
        transition: {
          duration: 0.7 * duration,
          ease: "easeOut",
          delay: 0.25,
          repeat: Infinity,
          repeatType: "mirror",
        },
      },
    };

    return (
      <motion.div className={cn("inline-flex items-center justify-center", className)} {...props}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial="normal"
          animate={groupControls}
          variants={iconVariants}
        >
          <motion.path
            d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"
            initial="normal"
            animate={tubeControls}
            variants={tubeVariants}
          />
          <motion.path
            d="m13.56 11.747 4.332-.924"
            initial="normal"
            animate={tubeControls}
            variants={smallBarVariants}
          />
          <motion.path
            d="m16 21-3.105-6.21"
            initial="normal"
            animate={legsControls}
            variants={legsVariants}
          />
          <motion.path
            d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"
            initial="normal"
            animate={tubeControls}
            variants={tubeVariants}
          />
          <motion.path
            d="m6.158 8.633 1.114 4.456"
            initial="normal"
            animate={legsControls}
            variants={legsVariants}
          />
          <motion.path
            d="m8 21 3.105-6.21"
            initial="normal"
            animate={legsControls}
            variants={legsVariants}
          />
          <motion.circle
            cx="12"
            cy="13"
            r="2"
            initial="normal"
            animate={lensControls}
            variants={lensVariants}
          />
        </motion.svg>
      </motion.div>
    );
  }
);

TelescopeIcon.displayName = "TelescopeIcon";

// ========= TelescopeLoaderCard =========
export const TelescopeLoaderCard = () => {
  const { t } = useApp();
  const isRTL = useIsRTL();
  const iconRef = useRef<TelescopeIconHandle | null>(null);

  useEffect(() => {
    iconRef.current?.startAnimation();
    return () => iconRef.current?.stopAnimation();
  }, []);

  return (
    <div className="w-[196px] h-[196px]">
      {/* Glowing border */}
      <div className="relative rounded-3xl bg-transparent" style={{ borderRadius: "var(--radius)" }}>
        <GlowingEffect
          spread={44}
          glow
          disabled={false}
          proximity={100}
          inactiveZone={0.01}
        />
        <div
          className="relative w-full h-full bg-background text-foreground rounded-2xl border border-border flex flex-col items-center justify-center shadow-2xl overflow-hidden p-6"
          style={{ borderRadius: "var(--radius)" }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div
            className="mb-3 flex-shrink-0"
            style={{ transform: isRTL ? "scaleX(-1)" : "none" }}
          >
            <TelescopeIcon ref={iconRef} size={48} isAnimated />
          </div>

          <div className="text-center leading-tight px-2 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {t("loading_words") || "Loading words..."}
            </p>
            <p className="text-xs text-muted-foreground/80">
              {t("please_wait") || "Please wait"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
