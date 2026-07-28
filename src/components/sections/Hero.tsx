'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import HolographicCard from '../custom/HolographicCard';
import { LearningMiniCard } from '@/components/custom/learning-mini-card';
import { WordSlider } from '@/components/custom/word-slider';
import { useApp } from '@/context/AppContext';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useShowMiniCards } from '@/hooks/use-show-mini-cards';
import { useResponsiveCardSize } from '@/hooks/useResponsiveCardSize';
import PositionAwareButton from '@/components/custom/PositionAwareButton';
import RefinedChronicleButton from '@/components/custom/RefinedChronicleButton';
import { BookOpen, Dices, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

function parseWordFlipper(text: string): string[] {
  return text.split('|').map(word => word.trim()).filter(Boolean);
}

interface HeroProps {
  defaultCardText?: string;
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  supportsPositionAware?: boolean;
}

export default function Hero({ 
  defaultCardText = "イタリア", 
  onCardClick,
  supportsPositionAware = false
}: HeroProps) {
  const { t, lang } = useApp();
  const isRTL = useIsRTL();
  const isHebrew = lang === 'he';
  const isGsw = lang === 'ar';
  const fontSizeClass = cn(
    "font-headline font-bold leading-10 mb-1 md:mb-4 lg:mb-6 tracking-tighter text-foreground",
    isGsw 
      ? "text-3xl md:text-[41px] lg:text-[60px]"
      : "text-3xl md:text-[44px] lg:text-[64px]"
  );
  const showMiniCards = useShowMiniCards(); // true when window.innerWidth >= 1600px
  
  const padding = isHebrew ? "0.6675rem 1.5875rem" : "0.6125rem 1.5rem";
  
  // Kept original height (480) and increased width to match the 128/160 aspect ratio (480 * (128/160) = 384)
  const { width: responsiveWidth, height: responsiveHeight } = useResponsiveCardSize(384, 480);
  
  const [isRandomWordOpen, setIsRandomWordOpen] = useState(false);

  const scrollToLevels = useCallback(() => {
    document.getElementById('level-selector')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const handleHolographicClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onCardClick?.(e);
  }, [onCardClick]);

  const cardTopText = isHebrew ? "איטליה" : defaultCardText;

  // Parse words from single translation key "wordFlipperWords": "word1|word2|word3"
  const words = parseWordFlipper(t('wordFlipperWords'));

  const buttonText = <span>{t('primary-cta-text')}</span>;
  const ButtonComponent = supportsPositionAware ? PositionAwareButton : RefinedChronicleButton;
  
  const buttonProps = supportsPositionAware 
    ? { 
        children: buttonText, 
        onClick: scrollToLevels, 
        buttonWidth: "fit-content" 
      }
    : { 
        children: buttonText, 
        onClick: scrollToLevels, 
        width: "fit-content",
        buttonHeight: '2.5rem',
        fontSize: '1rem',
        fontWeight: 500 
      };

  // Layout & Mini Cards - directly use showMiniCards hook
  const containerMaxWidth = showMiniCards ? 'max-w-[1536px]' : 'max-w-[1296px]';
  const containerPadding = showMiniCards ? 'px-6 md:px-[164px]' : 'px-6 md:px-11';

  return (
    <section className="flex flex-col items-center justify-center lg:min-h-[min(calc(100vh-72px),1080px)] py-12 lg:py-24 gap-8 lg:gap-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-background -z-10" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[800px] h-[800px] bg-primary/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent/10 blur-[180px] rounded-full" />
        <div className="absolute inset-0 chronicle-dots opacity-20" />
      </div>

      <div className={`w-full overflow-hidden ${containerMaxWidth} mx-auto ${containerPadding} flex flex-col items-center lg:grid lg:grid-cols-2 lg:items-center gap-8 lg:gap-16 relative z-10`}>
        
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={
            "flex flex-col items-center text-center lg:items-start justify-center order-1 w-full lg:max-w-md"
          }
        >
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Zap size={12} className="text-primary/80" /> 
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
              {t('spacedRepetitionBadge')}
            </span>
          </div>

          <h1
            className={cn(
              fontSizeClass,
              isRTL ? "text-right lg:text-right" : "text-center lg:text-left"
            )}
          >
            {t('heroMainText')}
            <br />
            <span className="inline-block mt-4">
              <WordSlider words={words} className="text-[0.85em]" />
            </span>
          </h1>
          
          <p
            style={{ 
              lineHeight: '1.4625rem' 
            }}
            className={cn(
              "text-[12.675px] sm:text-[14px] md:text-[15.375px] lg:text-[17px] text-muted-foreground max-w-md mb-8 lg:mb-12 mx-auto lg:mx-0 leading-relaxed font-medium",
              isRTL ? "lg:text-right" : "lg:text-left"
            )}
          >
            {t('appDescription')}
          </p>
          
          <div className="w-fit">
            <ButtonComponent {...buttonProps} />
          </div>
        </motion.div>

        {/* Visual Experience with Main Card */}
        <div className="flex justify-center my-[30px] items-center order-2 lg:justify-end lg:items-center w-full relative min-h-[500px]">
          
          {/* Main Holographic Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="z-20 relative"
          >
            <HolographicCard
              imageSrc={"card-image.webp"}
              electricColor="#3C83F6"
              textOverlayPadding={padding}
              isRTL={isRTL}
              width={responsiveWidth}
              height={responsiveHeight}
              onClick={handleHolographicClick}
              enableDrag={false}
              borderRadius={32}
              enableTilt={true}
              hologramOpacity={0.6}
            />
          </motion.div>

          {/* Mini Cards - Show when hook returns true (≥1600px) */}
          {showMiniCards && (
            <>
              {isRTL ? (
                // RTL layout
                <>
                  <div className="absolute top-10 -left-[104px] z-20 hidden sm:block">
                    <LearningMiniCard
                      icon={<BookOpen size={18} />}
                      label={t('vocabularyLabel')}
                      content={t('wordsCount')}
                      color="accent"
                      delay={0.3}
                    />
                  </div>
                  <div className="absolute top-[64%] right-16 z-20 hidden lg:block">
                    <LearningMiniCard
                      icon={<Dices size={18} />}
                      label={t('tiersLabel')}
                      content={t('levelsCount')}
                      color="primary"
                      delay={0.5}
                      onClick={() => setIsRandomWordOpen(true)}
                    />
                  </div>
                </>
              ) : (
                // LTR layout
                <>
                  <div className="absolute bottom-10 left-6 lg:left-14 z-20 hidden sm:block">
                    <LearningMiniCard
                      icon={<BookOpen size={18} />}
                      label={t('vocabularyLabel')}
                      content={t('wordsCount')}
                      color="accent"
                      delay={0.3}
                    />
                  </div>
                  <div className="absolute top-[56%] -right-16 lg:-right-36 z-20 hidden lg:block">
                    <LearningMiniCard
                      icon={<Dices size={18} />}
                      label={t('tiersLabel')}
                      content={t('levelsCount')}
                      color="primary"
                      delay={0.5}
                      onClick={() => setIsRandomWordOpen(true)}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}