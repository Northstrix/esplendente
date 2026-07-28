"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, BookOpen, Info, Dices } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { GlowingEffect } from "./GlowingEffect";
import { cn } from "@/lib/utils";
import { useIsRTL } from "@/hooks/use-is-rtl";

interface RandomWordCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RandomWordCard({ isOpen, onClose }: RandomWordCardProps) {
  const { allLevels, t, playSound, loadAudioForLevel } = useApp();
  const isRTL = useIsRTL();
  
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    if (isOpen && allLevels.length > 0) {
      setAudioReady(false);
      const allWordsWithLevels = allLevels.flatMap((lvl) =>
        (lvl.words || []).map((w) => ({ ...w, levelId: lvl.id }))
      );
      const singleWords = allWordsWithLevels.filter((w) => !w.word.trim().includes(" "));
      const pool = singleWords.length > 0 ? singleWords : allWordsWithLevels;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setSelectedWord(picked);
      
      if (picked.levelId) {
        loadAudioForLevel(picked.levelId).then(() => setAudioReady(true));
      }
    }
  }, [isOpen, allLevels, loadAudioForLevel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>{`
            /* Top lamp effect */
            .lamp-effect-top {
              position: absolute;
              top: -1px;
              left: 50%;
              transform: translateX(-50%);
              width: 70%;
              height: 1px;
              background: linear-gradient(90deg, transparent, #ffffff, transparent);
              box-shadow: 0 1px 4px 0px #ffffff, 0 2px 10px 2px rgba(255, 255, 255, 0.3);
              z-index: 50;
            }
            /* Content separator lamp effect */
            .lamp-effect {
              position: relative;
              width: 100%;
              height: 2px;
              overflow: hidden;
              margin: 2rem 0;
            }
            .lamp-effect::before {
              content: "";
              position: absolute;
              left: 50%;
              top: 0;
              transform: translateX(-50%);
              width: 60%;
              height: 100%;
              background: linear-gradient(90deg, transparent, #5a5a5a, transparent);
              opacity: 0.4;
              transition: opacity 0.4s ease, width 0.4s ease;
              box-shadow: 0 1px 4px hsl(var(--primary) / 0.3);
            }
            .glass-container:hover .lamp-effect::before {
              opacity: 0.8;
              width: 80%;
            }
            /* Subtle animated vertical glow separator */
            .vertical-glow-separator {
              position: absolute;
              left: -1px;
              top: 65%;
              width: 1px;
              height: 70px;
              background: linear-gradient(transparent, hsl(var(--primary)), transparent);
              opacity: 0;
              transition: top 600ms ease, opacity 600ms ease;
              z-index: 20;
            }
            .glass-container:hover .vertical-glow-separator {
              top: 25%;
              opacity: 0.6;
            }
            /* Chronicle dots pattern */
            .chronicle-dots {
              background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
              background-size: clamp(1rem, 2.5vw, 1.3rem) clamp(1rem, 2.5vw, 1.3rem);
              background-position: 50% 50%;
              opacity: 0.65;
            }
            .glass-container {
              background: linear-gradient(180deg, rgba(20, 20, 20, 0.92) 0%, rgba(10, 10, 10, 0.96) 100%);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            /* VISIBLE SCROLLBAR - Always show when needed */
            .viewport-scroll::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .viewport-scroll::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 3px;
            }
            .viewport-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 3px;
              border: 1px solid rgba(0, 0, 0, 0.3);
            }
            .viewport-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
            /* RTL scrollbar positioning */
            ${isRTL ? `
              .viewport-scroll::-webkit-scrollbar {
                right: auto !important;
                left: 4px !important;
              }
            ` : ''}
          `}</style>

          {/* 1. FULL VIEWPORT OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md"
            dir={isRTL ? 'rtl' : 'ltr'}
          />

          {/* 2. FULL VIEWPORT SCROLL CONTAINER - VISIBLE SCROLLBAR */}
          <div 
            className="fixed inset-0 z-[200] viewport-scroll overflow-y-auto overflow-x-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* 3. FLEX CENTERED CARD - Natural height with 36px top/bottom margins handled by padding */}
            <div className="flex items-center justify-center min-h-screen w-full pt-[36px] lg:pt-0 pb-[36px] lg:pb-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-[360px] lg:max-w-[420px]"
              >
                {/* Outer Glow Border */}
                <div className="relative rounded-3xl border border-white/10 p-2 lg:p-3 bg-black/30">
                  <GlowingEffect spread={50} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                  
                  {/* Inner Card */}
                  <div className="glass-container relative flex flex-col overflow-hidden rounded-2xl border border-white/5 p-4 lg:p-6 xl:p-8 shadow-2xl">
                    {/* TOP Lamp effect */}
                    <div className="lamp-effect-top" />
                    {/* Vertical glow separator */}
                    <div className="vertical-glow-separator" />
                    {/* Chronicle dots background */}
                    <div className="absolute inset-0 chronicle-dots pointer-events-none" />
                    
                    {/* Foreground Content */}
                    <div className="relative z-10 flex flex-col gap-4 lg:gap-6">
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 lg:gap-2 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-md bg-white/5 border border-white/10 text-[8px] lg:text-[9px] xl:text-[10px]">
                          <Dices className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-primary" />
                          <span className="font-bold uppercase tracking-[0.15em] text-white/70">
                            {t("random_word") || "Word Discovery"}
                          </span>
                        </div>
                        <button
                          onClick={onClose}
                          className="p-1 lg:p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                      </div>

                      {/* Word + Audio Button */}
                      {selectedWord && (
                        <div className="flex flex-col gap-4 lg:gap-6">
                          <div className="text-center py-3 lg:py-4 space-y-4 lg:space-y-5">
                            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tighter break-words leading-tight">
                              {selectedWord.word}
                            </h2>
                            <button
                              onClick={() => playSound(selectedWord.filename)}
                              className={cn(
                                "mx-auto flex items-center gap-1.5 lg:gap-2 px-4 py-1.5 lg:px-5 lg:py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 text-xs lg:text-[10px]",
                                !audioReady && "opacity-50 cursor-wait"
                              )}
                            >
                              {isRTL ? (
                                <Volume2
                                  className={cn("w-3 h-3 lg:w-4 lg:h-4 text-primary", !audioReady && "animate-pulse")}
                                  style={{ transform: "rotateY(180deg)" }}
                                />
                              ) : (
                                <Volume2 className={cn("w-3 h-3 lg:w-4 lg:h-4 text-primary", !audioReady && "animate-pulse")} />
                              )}
                              <span className="font-bold uppercase tracking-widest">
                                {t("listen") || "Listen"}
                              </span>
                            </button>
                          </div>

                          {/* Lamp effect between audio and translation */}
                          <div className="lamp-effect" />

                          {/* Translation */}
                          <div className="space-y-1 lg:space-y-1.5">
                            <div className="flex items-center gap-1.5 lg:gap-2 text-white/40">
                              <BookOpen className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                              <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest">
                                {t(selectedWord.translations.length > 1 ? "translations" : "translation")}
                              </span>
                            </div>
                            <p className="text-base lg:text-lg xl:text-xl font-semibold text-white/90 leading-tight">
                              {selectedWord.translations.join(", ")}
                            </p>
                          </div>

                          {/* Definition */}
                          {selectedWord.definition && (
                            <div className="space-y-1 lg:space-y-1.5">
                              <div className="flex items-center gap-1.5 lg:gap-2 text-white/40">
                                <Info className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest">
                                  {t("definition")}
                                </span>
                              </div>
                              <p className="text-xs lg:text-[13px] xl:text-sm text-white/50 italic leading-relaxed">
                                {selectedWord.definition}
                              </p>
                            </div>
                          )}

                          {/* Info Note */}
                          {selectedWord.info && (
                            <div className="mt-2 p-3 lg:p-4 rounded-xl bg-primary/5 border border-primary/10">
                              <p className="text-[10px] lg:text-[11px] xl:text-[12px] text-primary/70 leading-relaxed">
                                <strong className={`text-primary ${isRTL ? 'ml-1' : 'mr-1'}`}>{t("note")}:</strong>
                                {selectedWord.info}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
