// hooks/useBrowserSupportDecision.ts
'use client';
import { useState, useEffect } from 'react';

function getBrowserInfo(): { name: string; version: number | null } | null {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent.toLowerCase();
  
  const chromeMatch = ua.match(/chrome\/(\d+)/);
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1]);
    console.log(`🔍 Detected Chrome ${version}`);
    return { name: 'chrome', version };
  }
  
  const firefoxMatch = ua.match(/firefox\/(\d+)/);
  if (firefoxMatch) {
    const version = parseInt(firefoxMatch[1]);
    console.log(`🔍 Detected Firefox ${version}`);
    return { name: 'firefox', version };
  }
  
  console.log('🔍 Unknown browser:', navigator.userAgent);
  return null;
}

export function useBrowserSupportDecision() {
  const [supportsPositionAware, setSupportsPositionAware] = useState(false);

  useEffect(() => {
    console.log('🎣 Browser support detection running...');
    const browserInfo = getBrowserInfo();
    
    if (!browserInfo) {
      console.log('🚫 No browser info (SSR)');
      return;
    }

    const { name, version } = browserInfo;
    
    if (name === 'chrome' && version && version >= 131) {
      console.log('✅ PositionAwareButton SUPPORTED (Chrome)');
      setSupportsPositionAware(true);
      return;
    }
    
    if (name === 'firefox' && version && version >= 141) {
      console.log('✅ PositionAwareButton SUPPORTED (Firefox)');
      setSupportsPositionAware(true);
      return;
    }
    
    console.log(`❌ PositionAwareButton NOT SUPPORTED (${name} ${version || 'unknown'})`);
    setSupportsPositionAware(false);
  }, []);

  return { supportsPositionAware };
}
