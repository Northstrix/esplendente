'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Timer,
} from 'lucide-react';
import type { Level, Word } from '@/lib/types';
import { shuffle } from '@/lib/utils';
import PositionAwareButton from '../custom/PositionAwareButton';
import RefinedChronicleButton from '../custom/RefinedChronicleButton';
import { useApp } from '@/context/AppContext';
import BasicBadge from '../custom/BasicBadge';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface QuizModeProps {
  level: Level;
  mode: 'it-en' | 'en-it';
  onRestart: () => void;
  onQuit: () => void;
  canPlayAudioForWord?: (filename: string) => boolean;
  supportsPositionAware?: boolean;
}

type QuizPhase = 'initial' | 'retry';

export default function QuizMode({
  level,
  mode,
  onRestart,
  onQuit,
  canPlayAudioForWord,
  supportsPositionAware = false,
}: QuizModeProps) {
  const {
    playSound,
    allLevels,
    t,
    direction,
    endLevel,
    setLevelToScrollTo,
    loadAudioForLevel,
  } = useApp();
  const isRTL = useIsRTL();
  const router = useRouter();

  const [wordSet, setWordSet] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>('initial');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Word[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [hasPlayedForCurrent, setHasPlayedForCurrent] =
    useState(false);
  const [animationDirection, setAnimationDirection] =
    useState<'forward' | 'backward'>('forward');
  const [showLevelCompleteModal, setShowLevelCompleteModal] =
    useState(false);

  // Slide variants
  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => {
      const offset = isRTL
        ? dir === 'forward'
          ? 100
          : -100
        : dir === 'forward'
        ? -100
        : 100;
      return { x: `${offset}%`, opacity: 0 };
    },
    center: { x: 0, opacity: 1 },
    exit: (dir: 'forward' | 'backward') => {
      const offset = isRTL
        ? dir === 'forward'
          ? -100
          : 100
        : dir === 'forward'
        ? 100
        : -100;
      return { x: `${offset}%`, opacity: 0 };
    },
  };

  const setupLevel = useCallback(
    (words: Word[], currentPhase: QuizPhase) => {
      setWordSet(shuffle(words));
      setCurrentIndex(0);
      setPhase(currentPhase);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setHasPlayedForCurrent(false);
      setShowLevelCompleteModal(false);

      if (currentPhase === 'initial') {
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setMistakes([]);
        setMistakeCount(0);
        setStartTime(Date.now());
      }
    },
    []
  );

  // Initialize level state
  useEffect(() => {
    if (level.words.length > 0) {
      setupLevel(level.words as Word[], 'initial');
    }
  }, [level, setupLevel]);

  // Preload all audio for this level
  useEffect(() => {
    if (!level?.id) return;
    loadAudioForLevel(level.id).catch(console.error);
  }, [level?.id, loadAudioForLevel]);

  const currentWord = useMemo(
    () => wordSet[currentIndex] || null,
    [wordSet, currentIndex]
  );

  const { question, correctAnswer, audioLookupKey, hasAudioForSpanish } =
    useMemo(() => {
      if (!currentWord) {
        return {
          question: '',
          correctAnswer: '',
          audioLookupKey: '',
          hasAudioForSpanish: false,
        };
      }

      const audioKey = currentWord.filename;
      const audioAvailable = canPlayAudioForWord
        ? canPlayAudioForWord(audioKey)
        : Boolean(audioKey);

      if (mode === 'it-en') {
        return {
          question: currentWord.word,
          correctAnswer: currentWord.translations[0],
          audioLookupKey: audioKey,
          hasAudioForSpanish: audioAvailable,
        };
      }

      return {
        question: currentWord.translations[0],
        correctAnswer: currentWord.word,
        audioLookupKey: audioKey,
        hasAudioForSpanish: audioAvailable,
      };
    }, [currentWord, mode, canPlayAudioForWord]);

  // Generate options whenever the word changes
  useEffect(() => {
    if (!currentWord) return;

    const correctOption =
      mode === 'it-en'
        ? currentWord.translations[0]
        : currentWord.word;

    const allPossibleWords = allLevels.flatMap(
      (l) => l.words as Word[]
    );

    const allWrongOptions = allPossibleWords
      .map((w) =>
        mode === 'it-en' ? w.translations[0] : w.word
      )
      .filter((text) => text !== correctOption);

    const uniqueWrongOptions = Array.from(
      new Set(allWrongOptions)
    );

    const wrongOptions = shuffle(uniqueWrongOptions).slice(
      0,
      Math.min(5, Math.floor(Math.random() * 2) + 4)
    );

    setOptions(shuffle([correctOption, ...wrongOptions]));
    // reset autoplay guard for this word
    setHasPlayedForCurrent(false);
  }, [currentWord, mode, allLevels]);

  // Autoplay current word once per card (including first one)
  useEffect(() => {
    if (
      !currentWord ||
      !hasAudioForSpanish ||
      !audioLookupKey
    )
      return;
    if (hasPlayedForCurrent) return;

    setHasPlayedForCurrent(true);

    const id = setTimeout(() => {
      playSound(audioLookupKey);
    }, 0);

    return () => clearTimeout(id);
  }, [
    currentWord,
    hasAudioForSpanish,
    audioLookupKey,
    hasPlayedForCurrent,
    playSound,
  ]);

  const handleAnswerSelect = (answer: string) => {
    if (isRevealed) return;
    setSelectedAnswer((prev) =>
      prev === answer ? null : answer
    );
  };

  const handlePlayAudio = () => {
    if (currentWord && hasAudioForSpanish && audioLookupKey) {
      playSound(audioLookupKey);
    }
  };

  const getNextButtonText = () => {
    if (isRevealed) {
      const isLastWord =
        currentIndex === wordSet.length - 1;
      const noMoreMistakesToRetry =
        phase === 'retry' || mistakes.length === 0;
      return isLastWord && noMoreMistakesToRetry
        ? t('finish')
        : t('next');
    }
    return t('check');
  };

  const handleNextClick = () => {
    if (!selectedAnswer) return;

    if (!isRevealed) {
      const isCorrect = selectedAnswer === correctAnswer;
      playSound(isCorrect ? 'success' : 'error');

      if (isCorrect) {
        if (phase === 'initial') {
          setScore((s) => s + 1);
        }
        setStreak((s) => {
          const newS = s + 1;
          if (newS > maxStreak) setMaxStreak(newS);
          return newS;
        });
      } else {
        setStreak(0);
        if (phase === 'initial') {
          setMistakeCount((mc) => mc + 1);
        }
        if (currentWord) {
          setMistakes((m) => [
            ...m,
            { ...(currentWord as any), isMistake: true },
          ]);
        }
      }

      setIsRevealed(true);
    } else {
      setAnimationDirection('forward');
      const nextIndex = currentIndex + 1;

      if (nextIndex < wordSet.length) {
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setIsRevealed(false);
        setHasPlayedForCurrent(false);
      } else {
        if (phase === 'initial' && mistakes.length > 0) {
          setupLevel(mistakes, 'retry');
          setMistakes([]);
        } else {
          setEndTime(Date.now());
          setTimeout(() => {
            setShowLevelCompleteModal(true);
            playSound('completed');
          }, 500);
        }
      }
    }
  };

  const handlePreviousClick = () => {
    if (currentIndex === 0 || isRevealed) return;
    setAnimationDirection('backward');
    setCurrentIndex((i) => Math.max(i - 1, 0));
    setSelectedAnswer(null);
    setIsRevealed(false);
    setHasPlayedForCurrent(false);
  };

  const LevelCompleteModal = () => {
    const isRTL = useIsRTL();

    const stats = [
      {
        icon: (
          <CheckCircle className="w-6 h-6 text-[hsl(var(--success))]" />
        ),
        label: t('correct'),
        value: `${score}/${level.words.length}`,
      },
      {
        icon: (
          <AlertCircle className="w-6 h-6 text-destructive" />
        ),
        label: t('errors'),
        value: mistakeCount,
      },
      {
        icon: (
          <TrendingUp className="w-6 h-6 text-primary" />
        ),
        label: t('bestStreak'),
        value: maxStreak,
      },
      {
        icon: (
          <Timer className="w-6 h-6 text-muted-foreground" />
        ),
        label: t('time'),
        value: `${Math.floor(
          (endTime - startTime) / 60000
        )}:${Math.floor(
          ((endTime - startTime) % 60000) / 1000
        )
          .toString()
          .padStart(2, '0')}`,
      },
    ];

    const handleBackToLevels = () => {
      if (level?.id) setLevelToScrollTo(level.id);
      setShowLevelCompleteModal(false);
      endLevel(level);
      router.push('/');
    };

    const containerVariants = {
      visible: { transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 140,
          damping: 16,
        },
      },
    };


    return (
      <>
        {/* Dimmed overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm pointer-events-none"
        />

        {/* Scrollable full-screen container */}
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[101] overflow-y-auto flex items-center justify-center text-foreground"
          onClick={handleBackToLevels}
        >
          <div
            className="relative w-full max-w-md mx-auto px-[10px] my-6 flex flex-col items-center text-center space-y-6 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Header */}
            <motion.div
              className="flex flex-col items-center w-full space-y-3"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.1 }}
            >
              <div className="p-4 rounded-xl bg-[var(--slightly-lightened-background)] border border-border backdrop-blur-sm flex items-center justify-center">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[hsl(var(--success))]" strokeWidth={1.8} />
              </div>

              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {t('levelComplete')}
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base max-w-sm leading-relaxed">
                {t('levelCompleteDescription')}
              </p>
            </motion.div>


            {/* Stats Cards */}
            <motion.div
              className="w-full space-y-2 sm:space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group flex items-center p-3 sm:p-4 rounded-xl w-full bg-gradient-to-r from-card/80 via-card/50 to-card/80 border border-border/60 backdrop-blur-sm hover:from-card hover:to-card/90 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
                >
                  <div className={`shrink-0 p-2 rounded-lg ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    {stat.icon}
                  </div>
                  <div className={`flex flex-col min-w-0 flex-1 items-start`}>
                    <span className="text-lg sm:text-xl font-bold leading-none tracking-tight text-foreground">
                      {stat.value}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-muted-foreground/80 group-hover:text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full"
            >
              {supportsPositionAware ? (
                <PositionAwareButton onClick={handleBackToLevels} buttonWidth="100%">
                  {t('backToLevels')}
                </PositionAwareButton>
              ) : (
                <RefinedChronicleButton 
                  onClick={handleBackToLevels} 
                  width="100%" 
                >
                  {t('backToLevels')}
                </RefinedChronicleButton>
              )}
            </motion.div>
          </div>
        </div>
      </>
    );
  };

  if (showLevelCompleteModal) {
    return <LevelCompleteModal />;
  }

  if (!currentWord) return null;

  const progressText =
    phase === 'initial'
      ? t('progress', {
          current: currentIndex + 1,
          total: wordSet.length,
        })
      : t('retryingMistakes');

  const isCorrectChoice =
    selectedAnswer === correctAnswer;

  return (
    <>
      {/* 1. FULL VIEWPORT CONTAINER (like LevelSelector outer div) */}
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden bg-background text-foreground"
      >
        {/* 2. NESTED SCROLL CONTAINER (scrollbar appears at viewport edge) */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none relative">
          {/* 3. CENTERED CONTENT (limited width, scrolls within viewport) */}
          <div className="flex flex-col min-h-screen w-full max-w-xl mx-auto">
            {/* HEADER - scrolls with content */}
        <header className="h-[96px] w-full flex items-center justify-between px-6 flex-shrink-0 z-30">
          <button
            onClick={handlePreviousClick}
            disabled={currentIndex === 0 || isRevealed}
            className="p-3 rounded-full hover:bg-secondary/80 transition-all disabled:opacity-10"
          >
            {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>
          <button
            onClick={onQuit}
            className="p-3 rounded-full text-muted-foreground transition-all hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

            {/* MAIN BODY */}
            <main className="relative w-full h-full flex flex-col overflow-hidden" dir={direction}>

              <LayoutGroup>
                <motion.div layout className="text-center mb-6">
                  <span className="text-xs font-bold tracking-widest text-muted-foreground/60 uppercase">{progressText}</span>
                  <div className="flex justify-center gap-4 mt-2">
                    <span className="text-[10px] font-bold bg-secondary/30 px-2 py-1 rounded border border-border/40">
                      {t('score', { score })}
                    </span>
                    <span className="text-[10px] font-bold bg-secondary/30 px-2 py-1 rounded border border-border/40">
                      {t('streak', { streak })}
                    </span>
                  </div>
                </motion.div>

                <AnimatePresence mode="wait" custom={animationDirection}>
                  <motion.div
                    key={currentIndex}
                    custom={animationDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex-grow flex flex-col items-center gap-6"
                  >
                    {/* Word + Audio */}
                    <motion.div layout className="text-center flex flex-col items-center gap-3">
                      <p className="text-muted-foreground text-sm">
                        {mode === 'it-en' ? t('translateTheWord') : t('whatIsTheSpanishFor')}
                      </p>
                      <div className={cn('flex items-center justify-center gap-4', isRTL && 'flex-row-reverse')}>
                        {hasAudioForSpanish && audioLookupKey && isRTL && (
                          <button
                            onClick={handlePlayAudio}
                            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Volume2 className="w-5 h-5" style={{ transform: 'rotate(180deg)' }} />
                          </button>
                        )}
                        <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight">{question}</h2>
                        {hasAudioForSpanish && audioLookupKey && !isRTL && (
                          <button
                            onClick={handlePlayAudio}
                            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </motion.div>

                    {/* Options */}
                    <motion.div layout className="flex flex-wrap justify-center gap-3">
                      {options.map((option) => (
                        <BasicBadge
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          isSelected={selectedAnswer === option}
                          disabled={isRevealed}
                          isCorrect={isRevealed && option === correctAnswer}
                          isRevealed={isRevealed}
                        >
                          {option}
                        </BasicBadge>
                      ))}
                    </motion.div>

                    {/* Reveal Card - FULL ORIGINAL LOGIC PRESERVED */}
                    <AnimatePresence>
                      {isRevealed && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.3, ease: 'linear' }}
                          className={'overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm flex flex-col gap-4 p-6 w-full bg-[var(--card-background)] border-border'
                          }
                        >
                          <div className="flex items-center gap-3">
                            {isCorrectChoice ? (
                              <CheckCircle2 className="w-6 h-6 text-[hsl(var(--success))]" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-[hsl(var(--destructive))]" />
                            )}
                            <span
                              className={`text-sm font-bold uppercase tracking-wider ${
                                isCorrectChoice ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'
                              }`}
                            >
                              {isCorrectChoice ? t('correct') : t('incorrect')}
                            </span>
                          </div>
                          <div className={`flex flex-col gap-3 ${isRTL ? 'text-right' : 'text-left'}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                            <h3 className="font-bold text-2xl leading-tight tracking-tight">{currentWord.word}</h3>
                            <p className="text-sm">
                              <span className="font-semibold text-muted-foreground">
                                {t(currentWord.translations.length > 1 ? 'translations' : 'translation')}:{' '}
                              </span>
                              <span className="font-semibold text-foreground">{currentWord.translations.join(', ')}</span>
                            </p>
                            {currentWord.definition && (
                              <p className="text-sm" style={{ lineHeight: 1.625 }}>
                                <span className="font-semibold text-muted-foreground">{t('definition')}:{' '}</span>
                                <span className="text-foreground/80 leading-relaxed">{currentWord.definition}</span>
                              </p>
                            )}
                            {currentWord.info && (
                              <p className="text-sm border-t border-border/50 pt-3">
                                <span className="font-semibold text-muted-foreground">{t('info')}:{' '}</span>
                                <span className="text-xs italic text-muted-foreground/70">{currentWord.info}</span>
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-auto mb-16 pt-6">
                  {supportsPositionAware ? (
                    <PositionAwareButton 
                      onClick={handleNextClick} 
                      disabled={!selectedAnswer} 
                      buttonWidth="100%"
                    >
                      {getNextButtonText()}
                    </PositionAwareButton>
                  ) : (
                    <RefinedChronicleButton 
                      onClick={handleNextClick} 
                      disabled={!selectedAnswer}
                      width="100%" 
                      buttonHeight="2.5rem" 
                      fontSize="1rem" 
                      fontWeight={500}
                    >
                      {getNextButtonText()}
                    </RefinedChronicleButton>
                  )}
                </div>
              </LayoutGroup>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
