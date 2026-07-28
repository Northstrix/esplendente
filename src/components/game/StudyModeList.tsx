'use client';

import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { Word } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { GlowingEffect } from '@/components/custom/GlowingEffect';

interface StudyModeListProps {
  level: { words: Word[] };
}

interface StudyGridItemProps {
  children: React.ReactNode;
}

const StudyGridItem = ({ children }: StudyGridItemProps) => {
  return (
    <li className="list-none h-full w-full">
      <div
        className="relative h-full w-full p-2"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {/* Single visible border + glow */}
        <div
          className="relative h-full w-full rounded-[var(--radius)] border border-[hsl(var(--border))]"
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
            className="relative h-full w-full rounded-[var(--radius)] overflow-hidden"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {children}
          </div>
        </div>
      </div>
    </li>
  );
};

export default function StudyModeList({ level }: StudyModeListProps) {
  const { playSound } = useApp();
  const isRTL = useIsRTL();

  const playWordSound = (word: Word) => {
    playSound(word.filename);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full auto-rows-auto items-stretch">
      {level.words.map((word, index) => (
        <motion.div
          key={word.word}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="w-full flex"
        >
          <StudyGridItem>
            <Card
              className="flex flex-col flex-1 w-full shadow-sm bg-background h-full"
              style={{
                borderRadius: 'var(--radius)',
                border: 'none',
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-headline text-2xl" dir="ltr">
                    {word.word}
                  </CardTitle>
                  <button
                    onClick={() => playWordSound(word)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                    aria-label={`Pronounce ${word.word}`}
                  >
                    {isRTL ? (
                      <Volume2 className="w-5 h-5" style={{ transform: 'rotate(180deg)' }} />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <CardDescription>
                  {word.translations.join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {word.definition && (
                  <p className="text-muted-foreground">{word.definition}</p>
                )}
                {word.info && (
                  <p className="text-sm text-muted-foreground/70 italic mt-2">
                    {word.info}
                  </p>
                )}
              </CardContent>
            </Card>
          </StudyGridItem>
        </motion.div>
      ))}
    </div>
  );
}
