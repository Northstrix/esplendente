'use client';

import { useEffect, useState, useCallback } from 'react';

interface CardSize {
  width: number;
  height: number;
}

export function useResponsiveCardSize(baseWidth: number, baseHeight: number): CardSize {
  const [size, setSize] = useState<CardSize>({ width: baseWidth, height: baseHeight });

  const calculateSize = useCallback(() => {
    const screenWidth = window.innerWidth;
    let scale = 1;

    if (screenWidth < 300) scale = 0.64;      // Very small screens
    else if (screenWidth < 320) scale = 0.68;
    else if (screenWidth < 340) scale = 0.70;
    else if (screenWidth < 360) scale = 0.72;
    else if (screenWidth < 370) scale = 0.74;
    else if (screenWidth < 380) scale = 0.76;
    else if (screenWidth < 400) scale = 0.80;
    else if (screenWidth < 420) scale = 0.90;
    else if (screenWidth < 440) scale = 0.94;
    else if (screenWidth < 768) scale = 0.98;
    else scale = 1;

    const width = Math.round(baseWidth * scale);
    const height = Math.round(baseHeight * scale);

    setSize({ width, height });
  }, [baseWidth, baseHeight]);

  useEffect(() => {
    calculateSize();
    
    // Throttle resize events
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateSize, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [calculateSize]);

  return size;
}
