'use client';

import React, { useState, useRef, useEffect, useCallback, memo, CSSProperties } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Locale } from '@/lib/translations';
import PositionAwareButton from '@/components/custom/PositionAwareButton';
import RefinedChronicleButton from '@/components/custom/RefinedChronicleButton';
import { useIsRTL } from '@/hooks/use-is-rtl';

const orderedLocales: Locale[] = ['en', 'he', 'ar', 'de'];

function USFlag({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1235" height="650" viewBox="0 0 7410 3900" className={className}>
    <rect width="7410" height="3900" fill="#b22234"/>
    <path d="M0,450H7410m0,600H0m0,600H7410m0,600H0m0,600H7410m0,600H0" stroke="#fff" strokeWidth="300"/>
    <rect width="2964" height="2100" fill="#00205B"/>
    <g fill="#fff">
    <g id="s18">
    <g id="s9">
    <g id="s5">
    <g id="s4">
    <path id="s" d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"/>
    <use xlinkHref="#s" y="420"/>
    <use xlinkHref="#s" y="840"/>
    <use xlinkHref="#s" y="1260"/>
    </g>
    <use xlinkHref="#s" y="1680"/>
    </g>
    <use xlinkHref="#s4" x="247" y="210"/>
    </g>
    <use xlinkHref="#s9" x="494"/>
    </g>
    <use xlinkHref="#s18" x="988"/>
    <use xlinkHref="#s9" x="1976"/>
    <use xlinkHref="#s5" x="2470"/>
    </g>
    </svg>
  );
}

function ILFlag({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1100" 
      height="800" 
      viewBox="0 0 1100 800"
      className={className}
    >
      <path d="M 0,0 H 1100 V 800 H 0 Z" fill="#fff"/>
      <path d="M 0,75 H 1100 V 200 H 0 Z" fill="#0038b8"/>
      <path d="M 0,600 H 1100 V 725 H 0 Z" fill="#0038b8"/>
      <path 
        d="M 423.81566,472.85253 H 676.18435 L 550.00001,254.29492 Z m 126.18435,72.85255 126.1843,-218.55765 H 423.81566 Z" 
        fill="none" 
        stroke="#0038b8" 
        strokeWidth="27.5"
      />
    </svg>
  );
}

function UAEFlag({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 12 6" className={className}>
      <rect width="12" height="6" fill="#00843d" id="green"/>
      <rect width="12" height="4" y="2" fill="#fff"/>
      <rect width="12" height="2" y="4"/>
      <rect width="3" height="6" fill="#c8102e" id="red"/>
    </svg>
  );
}

function DEFlag({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 5 3" className={className}>
      <desc>Flag of Germany</desc>
      <rect id="black_stripe" width="5" height="1" y="0" x="0" fill="#000"/>
      <rect id="red_stripe" width="5" height="1" y="1" x="0" fill="#D00"/>
      <rect id="gold_stripe" width="5" height="1" y="2" x="0" fill="#FFCE00"/>
    </svg>
  );
}
// ----------------------------

const languageLabels: Record<Locale, string> = {
  en: 'English',
  he: 'עברית',
  ar: 'العربية',
  de: 'Deutsch',
};

const labels: Record<string, Record<Locale, string>> = {
  apply: { en: 'Apply', de: 'Anwenden', ar: 'تطبيق', he: 'החל' },
  close: { en: 'Close', de: 'Schließen', ar: 'إغلاق', he: 'סגור' },
  appLanguage: { en: 'App Language', de: 'App-Sprache', ar: 'لغة التطبيق', he: 'שפת האפליקציה' },
};

const flags: Record<Locale, React.ComponentType<{ className?: string }>> = {
  en: USFlag,
  he: ILFlag,
  ar: UAEFlag,
  de: DEFlag,
};

interface LanguageIsleProps {
  supportsPositionAware?: boolean;
}

export default function LanguageIsle({ 
  supportsPositionAware = false 
}: LanguageIsleProps) {
  const { lang, direction, t, setLang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [tempLang, setTempLang] = useState<Locale>(lang);
  const [isHovered, setIsHovered] = useState(false);
  const [stayHovered, setStayHovered] = useState(false);

  const isRTL = useIsRTL();
  const CurrentFlag = flags[lang];

  useEffect(() => {
    if (isOpen) setTempLang(lang);
  }, [isOpen, lang]);

  const handleApply = () => { if (tempLang !== lang) setLang(tempLang); };
  const handleClose = () => { setIsOpen(false); setStayHovered(true); };

  return (
    <div key={direction} className="relative">
      {/* TRIGGER ISLE */}
<motion.div
        layout
        onClick={() => !isOpen && setIsOpen(true)}
        onMouseEnter={() => { setIsHovered(true); setStayHovered(false); }}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group relative cursor-pointer flex items-center justify-center overflow-hidden',
          'px-[16px] py-3 h-10 rounded-full',
          lang === 'en' && 'w-[186px] hover:w-[156px]',
          lang === 'he' && 'w-[176px] hover:w-[156px]', 
          lang === 'ar' && 'w-[164px] hover:w-[156px]',
          lang === 'de' && 'w-[168px] hover:w-[156px]',
          'transition-all duration-300 ease-out border',
          isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        )}
        style={{
          backgroundColor: lang === 'de' ? 'hsl(var(--primary))' : lang === 'ar' ? '#523cfc' : 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))',
          ...(isHovered && {
            backgroundImage: isRTL
              ? 'repeating-conic-gradient(from 0deg at 50% 50%, #b832ff 0%, #b832ff 25%, #00f0ff 50%, #39ff14 75%, #b832ff 100%)'
              : 'repeating-conic-gradient(from 0deg at 50% 50%, #b832ff 0%, #39ff14 25%, #00f0ff 50%, #b832ff 75%, #b832ff 100%)',
            backgroundColor: 'transparent',
            backgroundBlendMode: 'overlay',
            borderColor: '#4d4d4d'
          })
        }}
        transition={{ 
          layout: { duration: 0.3, ease: 'easeOut' },
          width: { duration: 0.3, ease: 'easeOut' },
          backgroundColor: { duration: 0.3, ease: 'easeOut' },
          borderColor: { duration: 0.3, ease: 'easeOut' }
        }}
        data-lang={lang}
      >
        <div className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold text-white whitespace-nowrap">
          <AnimatePresence mode="wait">
            {isHovered ? (
              <motion.div
                key="flags"
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -10 : 10 }}
                className="flex gap-[10px]"
              >
                {orderedLocales.map((l) => {
                  const Flag = flags[l];
                  return <Flag key={l} className="h-[13px] w-auto rounded-[1px]" />;
                })}
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <span style={{ color: "hsl(var(--foreground))" }}>{t('appLanguage')}</span>
                <CurrentFlag className="h-[13px] w-auto rounded-[1px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* VAULT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="vault-panel"
            initial={{ scaleX: 0.3, scaleY: 0.1, opacity: 0, top: 0 }}
            animate={{ scaleX: 1, scaleY: 1, opacity: 1, top: -4 }}
            exit={{ scaleX: 0.3, scaleY: 0.1, opacity: 0, top: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
            style={{ 
              insetInlineEnd: -4,
              transformOrigin: 'top end' 
            }}
            className={cn(
              'absolute w-[320px] rounded-2xl overflow-hidden z-50 shadow-2xl',
              'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] p-3 flex flex-col gap-6'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest px-4 h-10 flex items-center opacity-60">
                {labels.appLanguage[tempLang]}
              </span>
                <RefinedChronicleButton
                  onClick={handleClose}
                  width="auto"
                  backgroundColor="hsl(var(--background))"
                  textColor="hsl(var(--foreground))"
                  fontSize="0.75rem"
                  fontWeight={700}
                  borderRadius="20px"
                >
                  {labels.close[tempLang]}
                </RefinedChronicleButton>
            </div>

            <div className="flex flex-col gap-1">
              {orderedLocales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => setTempLang(locale)}
                  className={cn(
                    'w-full h-10 flex items-center justify-center text-center transition-all duration-200 text-base font-bold',
                    tempLang === locale
                      ? 'bg-[hsl(var(--primary))] text-white shadow-lg'
                      : 'bg-transparent text-[hsl(var(--background))]'
                  )}
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  {languageLabels[locale]}
                </button>
              ))}
            </div>

            <div className="mt-auto">
              {supportsPositionAware ? (
                <PositionAwareButton
                  buttonColor="hsl(var(--background))"
                  foregroundColor="hsl(var(--foreground))"
                  onClick={handleApply}
                  buttonWidth="100%"
                >
                  {labels.apply[tempLang]}
                </PositionAwareButton>
              ) : (
                <RefinedChronicleButton
                  width="100%"
                  onClick={handleApply}
                  backgroundColor="hsl(var(--background))"
                  textColor="hsl(var(--foreground))"
                  hoverBackgroundColor="hsl(var(--primary))"
                  hoverTextColor="hsl(var(--primary-foreground))"
                >
                  {labels.apply[tempLang]}
                </RefinedChronicleButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}