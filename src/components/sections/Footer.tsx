'use client';
import React from 'react';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useApp } from '@/context/AppContext';
import { Home, Gamepad2, BookOpen } from 'lucide-react';
import { useResponsiveCardSize } from '@/hooks/useResponsiveCardSize';
import { useIsMobileFooter3rdColumn } from '@/hooks/use-mobile-footer-3rd-column';
import HolographicCard from '../custom/HolographicCard';
import NamerUiBadge from './NamerUiBadge';
import { cn } from '@/lib/utils';

interface FooterProps {
  onCardClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onNavigate: (target: string) => void;
}

export default function AppFooter({ onCardClick, onNavigate }: FooterProps) {
  const isRTL = useIsRTL();
  const { t, lang } = useApp();
  const isHebrew = lang === 'he';
  const padding = isHebrew ? '0.6675rem 1.5875rem' : '0.6125rem 1.5rem';
  const { width: responsiveWidth, height: responsiveHeight } = useResponsiveCardSize(310, 480);
  const isMobileFooter3rdColumn = useIsMobileFooter3rdColumn();

  const navItems = [
    { id: 'hero', label: t('home-label'), icon: <Home size={17} /> },
    { id: 'level-selector', label: t('levels'), icon: <Gamepad2 size={17} /> },
    { id: 'acknowledgements-section', label: t('acknowledgements'), icon: <BookOpen size={17} /> },
  ];

  // Hardcoded author names
  const authorName = isHebrew ? 'מקסים בורטניקוב' : 'Maxim Bortnikov';

  const renderNavLink = (id: string, label: string, icon: React.ReactNode) => (
    <li key={id} className="text-[1rem] py-1">
      <button
        onClick={() => onNavigate(id)}
        className="w-full hover:no-underline"
        style={{ textAlign: 'center' }}
      >
        <span
          className={`text-[hsl(var(--foreground)/0.9)] hover:text-[hsl(var(--primary))] hover:underline transition-colors inline-flex items-center gap-1.5 justify-center cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ direction: 'ltr', lineHeight: 1.75 }}
        >
          {icon}
          <span>{label}</span>
        </span>
      </button>
    </li>
  );

  return (
    <section
      className="flex flex-col items-center justify-center py-0 lg:pb-20 relative bg-[var(--slightly-lightened-background)] border-t border-[hsl(var(--border))]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 -z-10" />
      
      {/* Footer inner matching hero width & padding */}
      <div className="w-full overflow-hidden max-w-[1296px] mx-auto px-6 md:px-10 flex flex-col items-center lg:grid lg:grid-cols-3 lg:items-stretch gap-8 lg:gap-12 xl:gap-16">
        {/* Column 1: Logo + Badge + Desktop Made By */}
        <div className="flex flex-col lg:pt-20 items-center lg:items-start text-center lg:text-left space-y-6 w-full lg:max-w-md mx-auto lg:mx-0">
          <div className="w-full lg:w-auto flex justify-center lg:justify-start">
            <a href="/" className="block hover:no-underline focus:no-underline">
              <div
                className="app-logo-container flex items-center space-x-[10px] md:space-x-[12px] rtl:space-x-reverse rounded-lg transition-all duration-200 cursor-pointer mt-12 lg:mt-0"
                style={{ display: 'inline-flex', lineHeight: 1.2, contain: 'paint' }}
              >
                <img
                  src="/logo.webp"
                  alt={t('logoAlt')}
                  width={36}
                  height={36}
                  className="object-contain select-none flex-shrink-0"
                />
                <span className="app-name-flip inline-block">
                  <span>
                    <em className="flip-text">
                      <span
                        className="font-headline text-lg md:text-xl font-bold select-none whitespace-nowrap"
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {t('appName')}
                      </span>
                    </em>
                  </span>
                  <span>
                    <em className="flip-text">
                      <span
                        className="font-headline text-lg md:text-xl font-bold select-none whitespace-nowrap"
                        style={{ color: 'hsl(var(--primary))' }}
                      >
                        {t('appName')}
                      </span>
                    </em>
                  </span>
                </span>
              </div>
            </a>
          </div>
          <p
            className={cn(
              "text-sm sm:text-sm md:text-sm lg:text-sm text-muted-foreground max-w-md mb-8 lg:mb-12 mx-auto lg:mx-0 leading-relaxed lg:w-auto flex justify-center lg:justify-start",
              isRTL ? "lg:text-right" : "lg:text-left"
            )}
          >
            {t('appDescription')}
          </p>
          <div className="flex justify-center lg:justify-start">
            <NamerUiBadge
              href="https://namer-ui.vercel.app/"
              isRTL={isRTL}
              poweredByText={t('poweredBy')}
              namerUIName={isHebrew ? 'נמר UI' : 'Namer UI'}
            />
          </div>
          {/* Desktop Made By */}
          <p
            className="hidden lg:block text-[1rem] text-left max-w-xs mx-auto lg:mx-0"
            style={{ lineHeight: 1.75 }}
          >
            <span className="text-[hsl(var(--muted-foreground))]">{t('madeBy')}</span>
            <a
              href="https://maxim-bortnikov.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--foreground)/0.9)] hover:text-[hsl(var(--primary))] hover:underline transition-colors"
            >
              {authorName}
            </a>
          </p>
          <p
            className="text-[1rem] text-left max-w-xs mx-0 flex gap-1"
            style={{ lineHeight: 1.25 }}
          >
            <a
              href="https://github.com/Northstrix/esplendente"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--foreground)/0.9)] hover:text-[hsl(var(--primary))] hover:underline transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://sourceforge.net/p/esplendente/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--foreground)/0.9)] hover:text-[hsl(var(--primary))] hover:underline transition-colors"
            >
              SourceForge
            </a>
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div className="flex flex-col lg:pt-20 items-center lg:items-center w-full lg:w-auto text-center mx-auto lg:mx-0">
          <h3 className="font-headline text-base lg:text-lg font-semibold text-[hsl(var(--foreground))] tracking-wide mb-6 lg:mb-8">
            {t('footerNav')}
          </h3>
          <ul className="flex flex-col items-center gap-2 w-full lg:w-72">
            {navItems.map(({ id, label, icon }) => renderNavLink(id, label, icon))}
          </ul>
        </div>

        {/* Column 3: Card + Mobile Made By */}
        {isMobileFooter3rdColumn ? (
          <div className="flex flex-col items-center justify-center w-full px-4 mx-auto text-center">
            {/* Holographic Card */}
            <div className="my-8 w-full flex justify-center">
              <div
                className="cursor-pointer flex justify-center"
                onClick={onCardClick}
                role="button"
                tabIndex={0}
                aria-label={t('clickCardHint')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCardClick({ currentTarget: e.currentTarget } as any);
                  }
                }}
              >
                <HolographicCard
                  id="footer-card"
                  imageSrc={"footer-image.webp"}
                  electricColor="#3C83F6"
                  textOverlayPadding={padding}
                  isRTL={isRTL}
                  width={responsiveWidth}
                  height={responsiveHeight}
                  onClick={onCardClick}
                  enableDrag={false}
                />
              </div>
            </div>

            {/* Card description */}
            <div className="w-full mb-4 px-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed text-center max-w-xs mx-auto">
                {t('clickCardHint')}
              </p>
            </div>

            {/* Made By */}
            <p
              className="text-[1rem] text-center text-[hsl(var(--muted-foreground))] mb-20 max-w-xs mx-auto"
              style={{ lineHeight: 1.75 }}
            >
              {t('madeBy')}{' '}
              <a
                href="https://maxim-bortnikov.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--foreground)/0.9)] hover:text-[hsl(var(--primary))] hover:underline transition-colors"
              >
                {authorName}
              </a>
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:pt-20 items-center lg:items-end w-full lg:w-auto mx-auto lg:mx-0">
            {/* Card wrapped in my-[30px] ONLY for desktop */}
            <div className="my-6 lg:my-[30px] w-full lg:w-[320px] transform lg:-translate-y-5 flex justify-center lg:justify-end">
              <div
                className="cursor-pointer w-full max-w-[320px]"
                onClick={onCardClick}
                role="button"
                tabIndex={0}
                aria-label={t('clickCardHint')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCardClick({ currentTarget: e.currentTarget } as any);
                  }
                }}
              >
                <HolographicCard
                  id="footer-card"
                  imageSrc={"footer-image.webp"}
                  electricColor="#3C83F6"
                  textOverlayPadding={padding}
                  isRTL={isRTL}
                  width={responsiveWidth}
                  height={responsiveHeight}
                  onClick={onCardClick}
                  enableDrag={false}
                />
              </div>
            </div>

            {/* Card description styled like hero description */}
            <div className="w-full lg:w-[320px] px-4 mb-4 lg:mb-6 transform lg:-translate-y-5">
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed text-center max-w-xs mx-auto">
                {t('clickCardHint')}
              </p>
            </div>

            {/* Mobile Made By */}
            <p
              className="block lg:hidden text-[1rem] text-center text-[hsl(var(--muted-foreground))] mb-16 max-w-xs mx-auto"
              style={{ lineHeight: 1.75 }}
            >
              {t('madeBy')}
              <a
                href="https://maxim-bortnikov.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--foreground)/0.9)] hover:text-[hsl(var(--primary))] hover:underline transition-colors"
              >
                {authorName}
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Flip styles for logo only */}
      <style jsx>{`
        .app-logo-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          perspective: 108px;
          contain: paint;
        }
        .app-name-flip {
          position: relative;
          display: inline-block;
          perspective: 108px;
        }
        .app-name-flip span {
          display: block;
        }
        .app-name-flip span:nth-of-type(2) {
          position: absolute;
          top: 0;
          left: 0;
        }
        .flip-text {
          font-style: normal;
          display: inline-block;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          will-change: transform, opacity;
          transition: transform 0.55s cubic-bezier(0.645, 0.045, 0.355, 1),
            opacity 0.35s linear 0.2s;
        }
        .app-name-flip span:nth-of-type(1) .flip-text {
          transform-origin: top;
          opacity: 1;
          transform: rotateX(0deg);
        }
        .app-name-flip span:nth-of-type(2) .flip-text {
          opacity: 0;
          transform: rotateX(-90deg) scaleX(0.9) translate3d(0, 10px, 0);
          transform-origin: bottom;
        }
        .app-logo-container:hover .app-name-flip span:nth-of-type(1) .flip-text {
          opacity: 0;
          transform: rotateX(90deg) scaleX(0.9) translate3d(0, -10px, 0);
        }
        .app-logo-container:hover .app-name-flip span:nth-of-type(2) .flip-text {
          opacity: 1;
          transform: rotateX(0deg) scaleX(1) translateZ(0);
          transition: transform 0.75s cubic-bezier(0.645, 0.045, 0.355, 1),
            opacity 0.35s linear 0.3s;
        }
      `}</style>
    </section>
  );
}
