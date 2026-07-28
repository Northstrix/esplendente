'use client';

import { AnimatePresence, motion } from 'framer-motion';
import LevelSelector from '@/components/sections/LevelSelector';

export default function Home() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="level"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <main className="bg-background text-foreground min-h-screen">
          <LevelSelector />
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
