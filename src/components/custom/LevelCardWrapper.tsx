'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import PositionAwareButton from '@/components/custom/PositionAwareButton';
import RefinedChronicleButton from '@/components/custom/RefinedChronicleButton';
import { useIsRTL } from '@/hooks/use-is-rtl';
import type { Level } from '@/lib/types';
import { GlowingEffect } from '@/components/custom/GlowingEffect'; // adjust path if needed

interface LevelCardProps {
  levelItem: Level;
  startLevel: (level: Level) => void;
  t: (key: string, opts?: any) => string;
  isRTL?: boolean;
  supportsPositionAware: boolean;
}

interface LevelGridItemProps {
  children: React.ReactNode;
}

const LevelGridItem = ({ children }: LevelGridItemProps) => {
  return (
    <li className="list-none h-full">
      <div
        className="relative h-full px-2"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {/* Single visible border + glow */}
        <div
          className="relative h-full rounded-[var(--radius)] border border-[hsl(var(--border))]"
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
            className="relative h-full rounded-[var(--radius)] overflow-hidden"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {children}
          </div>
        </div>
      </div>
    </li>
  );
};

function LevelCard({
  levelItem,
  startLevel,
  t,
  isRTL,
  supportsPositionAware,
}: LevelCardProps) {
  const buttonText = levelItem.words.length > 0 ? t('start') : t('comingSoon');
  const isDisabled = levelItem.words.length === 0;
  const onClickHandler = () => startLevel(levelItem);

  const ButtonComponent = supportsPositionAware
    ? PositionAwareButton
    : RefinedChronicleButton;

  const buttonProps = supportsPositionAware
    ? { children: buttonText, onClick: onClickHandler, buttonWidth: '100%' }
    : {
        children: buttonText,
        onClick: onClickHandler,
        width: '100%',
        buttonHeight: '2.5rem',
        fontSize: '1rem',
        fontWeight: 500,
      };

  return (
    <LevelGridItem>
      <Card
        className="flex h-full flex-col shadow-sm bg-background"
        style={{
          borderRadius: 'var(--radius)',
          border: 'none',
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle
            className="font-headline text-lg leading-tight text-[hsl(var(--foreground))]"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t('level')} {levelItem.id}: {levelItem.title}
          </CardTitle>
          <CardDescription className="text-[hsl(var(--muted-foreground))]">
            {levelItem.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow pt-0">
          <div className="flex flex-wrap gap-1.5 mt-2">
            {levelItem.words.map((w, idx) => (
              <span
                key={`${levelItem.id}-${idx}`}
                className="text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-2 py-0.5 rounded-md border border-[hsl(var(--border)/0.5)] max-w-full truncate whitespace-nowrap block"
                title={w.word}
              >
                {w.word}
              </span>
            ))}
            {levelItem.words.length === 0 && (
              <span className="text-sm text-muted-foreground italic">
                {t('comingSoon')}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-auto pt-4">
          <ButtonComponent {...buttonProps} disabled={isDisabled} />
        </CardFooter>
      </Card>
    </LevelGridItem>
  );
}

interface LevelCardWrapperProps {
  currentLevels: Level[];
  startLevel: (level: Level) => void;
  t: (key: string, opts?: any) => string;
  isRTL?: boolean;
  supportsPositionAware: boolean;
  levelRefs: React.MutableRefObject<
    Record<number, React.RefObject<HTMLDivElement>>
  >;
}

export default function LevelCardWrapper({
  currentLevels,
  startLevel,
  t,
  isRTL: isRTLProp,
  supportsPositionAware,
  levelRefs,
}: LevelCardWrapperProps) {
  const isRTL = useIsRTL() ?? isRTLProp;

  return (
    <ul
      className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr items-stretch"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {currentLevels.map((lvl) => (
        <div key={lvl.id} ref={levelRefs.current[lvl.id]} className="h-full pt-4">
          <LevelCard
            levelItem={lvl}
            startLevel={startLevel}
            t={t}
            isRTL={isRTL}
            supportsPositionAware={supportsPositionAware}
          />
        </div>
      ))}
    </ul>
  );
}
