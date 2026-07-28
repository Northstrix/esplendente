'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Level, Word } from '@/lib/types';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/custom/GlowingEffect';
import { TelescopeLoaderCard } from '@/components/custom/TelescopeLoaderCard';

interface WordSearchModalProps {
  show: boolean;
  onClose: () => void;
}

interface FlattenedWord {
  id: string;
  levelId: number;
  levelTitle: string;
  word: Word;
}

function ModalOverlayInner({
  children,
  onClose,
  isRTL,
}: {
  children: React.ReactNode;
  onClose: () => void;
  isRTL: boolean;
}) {
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{
        background: 'rgba(21, 20, 25, 0.7)',
        backdropFilter: 'blur(5px) saturate(94%)',
      }}
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

const BorderContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="relative rounded-[var(--radius)] border border-[hsl(var(--border))] p-[2px]"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <GlowingEffect
        spread={44}
        glow={true}
        disabled={false}
        proximity={100}
        inactiveZone={0.01}
      />
      <div
        className="relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-[var(--radius)]"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {children}
      </div>
    </div>
  );
};

export const WordSearchModal: React.FC<WordSearchModalProps> = ({ show, onClose }) => {
  const { allLevels, lang, t } = useApp();
  const isRTL = useIsRTL();
  
  const [query, setQuery] = useState('');
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [wordsReady, setWordsReady] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [flattenedWords, setFlattenedWords] = useState<FlattenedWord[]>([]);

  const buildFlattenedWords = useCallback(() => {
    const result: FlattenedWord[] = [];
    (allLevels as Level[]).forEach((level) => {
      (level.words || []).forEach((w: Word, idx: number) => {
        result.push({
          id: `${level.id}-${idx}`,
          levelId: level.id,
          levelTitle: level.title,
          word: w,
        });
      });
    });
    return result;
  }, [allLevels]);

  useEffect(() => {
    if (!show) {
      setIsLoadingWords(false);
      setWordsReady(false);
      setFlattenedWords([]);
      return;
    }
    
    setQuery('');
    searchInputRef.current?.focus();
    setIsLoadingWords(true);
    setWordsReady(false);
    setFlattenedWords([]);

    const timeoutId = setTimeout(() => {
      const data = buildFlattenedWords();
      setFlattenedWords(data);
      setWordsReady(true);
      setIsLoadingWords(false);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [show, buildFlattenedWords]);

  useEffect(() => {
    if (!show) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [show, onClose]);

  const filteredWords = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return flattenedWords;
    
    return flattenedWords.filter(({ word }) => {
      const base = (word.word || '').toLowerCase();
      const translations = (word.translations || []).map((tr) => tr.toLowerCase());
      
      if (base.includes(q)) return true;
      if (translations.some((tr) => tr.includes(q))) return true;
      return false;
    });
  }, [flattenedWords, query]);

  const searchIconClass = isRTL ? 'right-3' : 'left-3';
  const closeIconClass = isRTL ? 'left-3' : 'right-3';
  const inputPaddingClass = isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10';

  return (
    <AnimatePresence>
      {show && (
        <ModalOverlayInner onClose={onClose} isRTL={isRTL}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl m-4"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ zIndex: 1001, transform: isRTL ? 'scaleX(-1)' : undefined }}
          >
            <BorderContainer>
              <div className="p-4 flex flex-col h-[80vh] overflow-y-auto">
                {/* Search row */}
                <div className="relative mb-4">
                  <div className="relative rounded-lg border border-[hsl(var(--border))] p-[2px]">
                    <GlowingEffect
                      spread={44}
                      glow={true}
                      disabled={false}
                      proximity={100}
                      inactiveZone={0.01}
                    />
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={cn(
                        'w-full h-12 bg-background border-0 outline-none rounded-lg px-12 focus-visible:outline-none focus-visible:ring-0',
                        inputPaddingClass
                      )}
                      placeholder=""
                    />
                  </div>
                  <Search
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10',
                      searchIconClass
                    )}
                    size={20}
                  />
                  <button
                    onClick={onClose}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10',
                      closeIconClass
                    )}
                    aria-label="Close search"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Results */}
                {isLoadingWords && !wordsReady ? (
                  <div className="flex items-center justify-center py-8">
                    <TelescopeLoaderCard />
                  </div>
                ) : filteredWords.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {t('noResults') ?? 'No results found.'}
                  </div>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {filteredWords.map(({ id, word, levelId, levelTitle }, idx) => (
                      <motion.li
                        key={id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="list-none"
                      >
                        <BorderContainer>
                          <div className="p-4">
                            <div className="mb-2">
                              <div className="font-headline text-2xl align-right"><span dir="ltr">{word.word}</span></div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              {word.translations?.join(', ')}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {t('level')} {levelId}: {levelTitle}
                            </div>
                            {word.definition && (
                              <p className="text-muted-foreground text-sm">{word.definition}</p>
                            )}
                            {word.info && (
                              <p className="text-xs text-muted-foreground/70 italic mt-2">
                                {word.info}
                              </p>
                            )}
                          </div>
                        </BorderContainer>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </BorderContainer>
          </motion.div>
        </ModalOverlayInner>
      )}
    </AnimatePresence>
  );
};
