'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import PositionAwareButton from '../custom/PositionAwareButton';
import RefinedChronicleButton from '../custom/RefinedChronicleButton'; // 🔥 ADDED
import { useApp } from '@/context/AppContext';

interface QuitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supportsPositionAware?: boolean; // 🔥 ADDED
}

const getBackdropStyle = (): React.CSSProperties => {
  const bodyOpacity = 0.8;
  const blurStrength = 16;
  return {
    background: `rgba(0, 0, 0, ${bodyOpacity})`,
    backdropFilter: `blur(${blurStrength}px)`,
    WebkitBackdropFilter: `blur(${blurStrength}px)`,
    transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
  };
};

const getDialogStyle = (): React.CSSProperties => {
  return {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  };
};

export default function QuitDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  supportsPositionAware = false // 🔥 DEFAULT false
}: QuitDialogProps) {
  const [supportsBackdrop, setSupportsBackdrop] = useState(false);
  const { t } = useApp();

  useEffect(() => {
    setSupportsBackdrop(
      typeof window !== 'undefined' &&
      (CSS.supports('backdrop-filter', 'blur(10px)') ||
       CSS.supports('-webkit-backdrop-filter', 'blur(10px)'))
    );
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={supportsBackdrop ? getBackdropStyle() : { backgroundColor: 'rgba(0,0,0,0.9)' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={getDialogStyle()}
            className="rounded-lg shadow-2xl p-8 w-full max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-headline mb-2 text-foreground">
              {t('quitDialogTitle')}
            </h2>
            <p className="text-muted-foreground mb-8">{t('quitDialogDescription')}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* CANCEL BUTTON - DEFAULT Chronicle styling + 100% width */}
              {supportsPositionAware ? (
                <PositionAwareButton onClick={onClose} buttonWidth='100%'>
                  {t('cancel')}
                </PositionAwareButton>
              ) : (
                <RefinedChronicleButton
                  onClick={onClose}
                  width="100%"
                  buttonHeight="2.5rem"
                  fontSize="1rem"
                  fontWeight={500}
                >
                  {t('cancel')}
                </RefinedChronicleButton>
              )}

              {/* QUIT BUTTON - YOUR EXACT CUSTOM STYLING */}
              {supportsPositionAware ? (
                <PositionAwareButton
                  onClick={onConfirm}
                  buttonWidth='100%'
                  buttonColor='hsl(var(--destructive))'
                  filamentColor='#B040F6'
                  foregroundColor='hsl(var(--primary-foreground))'
                  hoverForegroundColor='hsl(var(--primary-foreground))'
                >
                  {t('quit')}
                </PositionAwareButton>
              ) : (
                <RefinedChronicleButton
                  onClick={onConfirm}
                  width="100%"
                  backgroundColor="hsl(var(--background))"
                  textColor="hsl(var(--foreground))"
                  hoverTextColor="hsl(var(--foreground))"
                  borderColor="hsl(var(--border))"
                  borderVisible
                  hoverBorderVisible
                  hoverBorderColor="hsl(var(--destructive))"
                  hoverBackgroundColor="hsl(var(--destructive))"
                  borderWidth={1}
                >
                  {t('quit')}
                </RefinedChronicleButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
