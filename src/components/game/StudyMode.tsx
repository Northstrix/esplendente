'use client';

import { motion } from 'framer-motion';
import type { Level } from '@/lib/types';
import StudyModeList from './StudyModeList';
import { useApp } from '@/context/AppContext';

interface StudyModeProps {
  level: Level;
}

export default function StudyMode({ level }: StudyModeProps) {
  const { t } = useApp();

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="font-headline text-4xl font-bold text-center mb-8">
        {t('studyModeTitle', { title: level.title })}
      </h2>
      <StudyModeList level={level} />
    </motion.div>
  );
}
