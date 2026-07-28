
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordSliderProps {
  words: string[];
  duration?: number;
  className?: string;
}

export function WordSlider({
  words,
  duration = 3000,
  className,
}: WordSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <motion.div 
      layout
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 1
      }}
      className={cn(
        "relative lg:mt-1 md:mt-0 mt-[-8px] mb-3 md:mb-0 inline-flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 px-4 py-4",
        "bg-gradient-to-b from-[#141414ec] to-[#0a0a0af5] backdrop-blur-xl shadow-2xl",
        className
      )}
    >
      {/* Top lamp effect - Exact match to RandomWordCard */}
      <div 
        className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-[70%] h-[1px] z-50"
        style={{
          background: "linear-gradient(90deg, transparent, #ffffff, transparent)",
          boxShadow: "0 1px 4px 0px #ffffff, 0 2px 10px 2px rgba(255, 255, 255, 0.3)"
        }}
      />
      
      {/* Chronicle Dots Background - Exact match to RandomWordCard */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "1.3rem 1.3rem",
          backgroundPosition: "50% 50%"
        }}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={currentIndex}
          initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
          animate={{
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
          }}
          exit={{ y: -20, opacity: 0, filter: "blur(10px)" }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 25,
          }}
          className="relative z-10 block whitespace-nowrap font-headline font-bold text-primary tracking-tight"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
