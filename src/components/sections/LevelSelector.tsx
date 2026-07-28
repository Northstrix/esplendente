'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import type { Level } from '@/lib/types';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import CustomRadioGroup from '@/components/custom/CustomRadioGroup';
import RandomWordCard from '@/components/custom/RandomWordCard';
import { Loader2 } from 'lucide-react';
import { useBrowserSupportDecision } from '@/hooks/useBrowserSupportDecision';
import StudyModeList from '../game/StudyModeList';
import LevelRangeSelector from '@/components/custom/LevelRangeSelector';
import StudyMode from '../game/StudyMode';
import QuizMode from '../game/QuizMode';
import QuitDialog from '../game/QuitDialog';
import { useIsRTL } from '@/hooks/use-is-rtl';
import Hero from '../sections/Hero';
import LanguageIsle from '../custom/LanguageIsle';
import Acknowledgements from '../sections/Acknowledgements';
import Footer from '../sections/Footer';
import LevelCardWrapper from '@/components/custom/LevelCardWrapper';
import FakeSearchBar from '@/components/custom/FakeSearchBar';
import { WordSearchModal } from '@/components/custom/WordSearchModal';
import { cn } from "@/lib/utils";

// ===== StudyAccordionContent =====
function StudyAccordionContent({ level }: { level: Level }) {
  const { loadAudioForLevel, t } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadAudioForLevel(level.id, (progress) => {
      if (progress === 100 && isMounted) setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [level, loadAudioForLevel]);

  return (
    <div>
      <p className="text-muted-foreground mb-6">{level.description}</p>
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="animate-spin text-[hsl(var(--accent))]" />
        </div>
      ) : (
        <StudyModeList level={level} />
      )}
    </div>
  );
}

// ===== LevelLoader =====
function LevelLoader({
  level,
  onLoaded,
}: {
  level: Level;
  onLoaded: () => void;
}) {
  const { loadAudioForLevel, t } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    loadAudioForLevel(level.id, (p) => {
      if (isMounted) setProgress(p);
    }).then(() => {
      if (isMounted) onLoaded();
    });
    return () => {
      isMounted = false;
    };
  }, [level, onLoaded, loadAudioForLevel]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <h2 className="font-headline text-2xl font-bold">{t('preparingLevel')}</h2>
      <p className="text-muted-foreground">{t('loadingAudio', { progress })}</p>
    </div>
  );
}

// ===== CONFIG =====
const GAME_MODE_OPTIONS = [
  { value: 'it-en' },
  { value: 'study' },
  { value: 'en-it' },
];

// ===== MAIN COMPONENT =====
export default function LevelSelector() {
  const {
    t,
    startLevel,
    gameMode,
    setGameMode,
    direction,
    activeTab,
    setActiveTab,
    levelRanges,
    levelsByRange,
    levelToScrollTo,
    setLevelToScrollTo,
    allLevels,
    view,
    level,
    endLevel,
  } = useApp();

  const isRTL = useIsRTL();
  const levelRefs = useRef<Record<number, React.RefObject<HTMLDivElement>>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { supportsPositionAware } = useBrowserSupportDecision();

  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [key, setKey] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [showRandomWordCard, setShowRandomWordCard] = useState(false);
  const [showWordSearch, setShowWordSearch] = useState(false);

  // ===== Effects =====
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const restartLevel = useCallback(() => {
    setIsAudioLoaded(false);
    setKey((prev) => prev + 1);
  }, []);

  const handleAudioLoaded = useCallback(() => setIsAudioLoaded(true), []);
  const handleQuit = () => setShowQuitDialog(true);
  const handleConfirmQuit = () => {
    setShowQuitDialog(false);
    if (level) endLevel(level);
  };

  const handleHeroCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowRandomWordCard(true);
  }, []);

  const handleFooterCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowRandomWordCard(true);
  }, []);

  const handleFooterNavigate = useCallback((target: string) => {
    const element = document.getElementById(target);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    allLevels.forEach((l) => {
      if (!levelRefs.current[l.id]) {
        levelRefs.current[l.id] = React.createRef<HTMLDivElement>();
      }
    });
  }, [allLevels]);

  useEffect(() => {
    if (
      view === 'landing' &&
      levelToScrollTo &&
      levelRefs.current[levelToScrollTo]?.current
    ) {
      const targetRef = levelRefs.current[levelToScrollTo];
      const range = levelRanges.find((r) => {
        const [start, end] = r.value.split('-').map(Number);
        return levelToScrollTo >= start && levelToScrollTo <= end;
      });
      if (range && range.value !== activeTab) setActiveTab(range.value);
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (targetRef.current) {
          const rect = targetRef.current.getBoundingClientRect();
          window.scrollTo({
            top: window.scrollY + rect.top,
            behavior: 'smooth',
          });
        }
        setLevelToScrollTo(null);
      }, 500);
    }
  }, [view, levelToScrollTo, levelRanges, activeTab, setActiveTab, setLevelToScrollTo]);

  useEffect(() => {
    if (level) {
      setIsAudioLoaded(false);
      setKey((prev) => prev + 1);
    }
  }, [level, gameMode]);

  const currentLevels = levelsByRange[activeTab] || [];

  // ===== LANDING VIEW =====
  if (view === 'landing') {
    return (
      <>
        <RandomWordCard
          isOpen={showRandomWordCard}
          onClose={() => setShowRandomWordCard(false)}
        />
        <WordSearchModal
          show={showWordSearch}
          onClose={() => setShowWordSearch(false)}
        />
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden bg-background text-foreground no-scrollbar"
        >
          <div
            ref={scrollContainerRef}
            className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none relative"
          >
            <div id="hero" className="flex flex-col min-h-screen w-full">
              <div
                id="language-isle"
                className="sticky top-0 z-[60] w-full bg-transparent pt-4 pb-4 pointer-events-none"
              >
                <div
                  className="mx-auto flex justify-end pointer-events-auto"
                  style={{
                    paddingRight: isRTL ? undefined : '16px',
                    paddingLeft: isRTL ? '16px' : undefined,
                  }}
                >
                  <LanguageIsle supportsPositionAware={supportsPositionAware} />
                </div>
              </div>

              {/* === HERO === */}
              <div className="lg:-translate-y-[36px]">
                <Hero
                  onCardClick={handleHeroCardClick}
                  supportsPositionAware={supportsPositionAware}
                />
              </div>

              {/* === LEVEL SELECTOR === */}
              <section
                id="level-selector"
                className="w-full py-6 md:py-8 transition"
              >
                <div className="max-w-[1304px] mx-auto px-6 md:px-10 w-full">
                  <div className="text-center mb-12">
                    <h2 className="font-headline text-4xl md:text-5xl font-bold">
                      {t('chooseYourChallenge')}
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                      {t('levelSelectorDescription')}
                    </p>
                  </div>

                  {/* Mode Selection */}
                  <div className="max-w-[1296px]">
                    <div className="max-w-3xl mx-auto mb-4">
                      <CustomRadioGroup
                        value={gameMode}
                        onChange={(v) => setGameMode(v as any)}
                        options={GAME_MODE_OPTIONS}
                        direction={direction}
                      />
                    </div>
                  </div>

                  <div className="max-w-[1296px] p-2 mb-[-8px]">
                      {/* Fake search bar below mode selector */}
                      <FakeSearchBar
                        placeholderText={t('search_words')}
                        onClick={() => setShowWordSearch(true)}
                        // Make sure it stretches full width
                        style={{ width: '100%' }}
                      />
                  </div>

                  {gameMode === 'study' ? (
                    <div className="max-w-[1296px]">
                      <Accordion type="single" collapsible className="w-full">
                        {currentLevels.map((lvl) => (
                          <AccordionItem key={lvl.id} value={`level-${lvl.id}`}>
                            <AccordionTrigger className="text-xl font-headline hover:no-underline">
                              {t('level')} {lvl.id}: {lvl.title}
                            </AccordionTrigger>
                            <AccordionContent>
                              {lvl.words.length > 0 ? (
                                <StudyAccordionContent level={lvl} />
                              ) : (
                                <p className="text-muted-foreground p-4 text-center">
                                  {lvl.description}
                                </p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ) : (
                    <div className="max-w-[1304px]">
                      <LevelCardWrapper
                        currentLevels={currentLevels}
                        startLevel={startLevel}
                        t={t}
                        isRTL={isRTL}
                        supportsPositionAware={supportsPositionAware}
                        levelRefs={levelRefs}
                      />
                    </div>
                  )}
                  <div className="max-w-[1296px]">
                    <div className="mt-12 w-full">
                      <LevelRangeSelector
                        levelRanges={levelRanges}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onNavigate={handleFooterNavigate}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <Acknowledgements />
              <Footer
                onCardClick={handleFooterCardClick}
                onNavigate={handleFooterNavigate}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ===== IN-GAME VIEW =====
  if (!level) return null;

  const Content = () => {
    if (!isAudioLoaded) {
      return (
        <div className="flex-grow flex items-center justify-center w-full min-h-screen">
          <LevelLoader level={level} onLoaded={handleAudioLoaded} />
        </div>
      );
    }
    if (gameMode === 'study') return <StudyMode level={level} />;
    return (
      <QuizMode
        key={key}
        level={level}
        mode={gameMode}
        onRestart={restartLevel}
        onQuit={handleQuit}
        supportsPositionAware={supportsPositionAware}
      />
    );
  };

  return (
    <>
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Content />
      </div>
      <QuitDialog
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        onConfirm={handleConfirmQuit}
        supportsPositionAware={supportsPositionAware}
      />
    </>
  );
}
