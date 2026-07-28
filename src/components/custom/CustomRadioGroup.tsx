'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomCheckbox from './CustomCheckbox';
import { useIsRTL } from '@/hooks/use-is-rtl';

interface RadioOption {
  value: string;
}

interface CustomRadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  direction: 'ltr' | 'rtl';
  className?: string;
}

export default function CustomRadioGroup({
  value,
  onChange,
  options,
  direction,
  className = '',
}: CustomRadioGroupProps) {
  const { t } = useApp();
  const isMobile = useIsMobile();
  const isRTL = useIsRTL();

  const isChecked = (optionValue: string) => value === optionValue;

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
  };

  const getLabel = (optionValue: string) => {
    const currentAppLang = t('currentAppLanguage');  // "English"
    const targetLang = t('targetLanguageName');      // "Spanish"
    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
    
    switch (optionValue) {
      case 'it-en':  // DEFAULT: Spanish → English
        return (
          <>
            {targetLang}  {/* Spanish */}
            <ArrowIcon className="w-3.5 h-3.5 mx-1 inline-flex flex-shrink-0" />
            {currentAppLang}  {/* English */}
          </>
        );
      case 'en-it':  // English → Spanish
        return (
          <>
            {currentAppLang}  {/* English */}
            <ArrowIcon className="w-3.5 h-3.5 mx-1 inline-flex flex-shrink-0" />
            {targetLang}  {/* Spanish */}
          </>
        );
      case 'study':
        return t('gameMode_study') || 'Study';
      default:
        return optionValue;
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto ${className}`}
      dir={direction}
    >
      <div
        className={`flex transition-all duration-200 w-full ${
          isMobile
            ? 'flex-col items-stretch gap-0 justify-center'
            : 'flex-row items-center justify-center gap-4'
        }`}
      >
        {options.map((option, index) => {
          const checked = isChecked(option.value);

          return (
            <label
              key={option.value}
              className={`flex-1 group relative md:mb-2 cursor-pointer w-full ${
                isRTL ? 'flex-row' : 'flex-row'
              }`}
            >
              <CustomCheckbox
                options={[
                  {
                    value: option.value,
                    label: (
                      <div className="flex items-center justify-center gap-2 min-h-[60px] p-3 w-full">
                        <span
                          className="text-sm font-medium text-foreground leading-tight flex-shrink-0"
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {getLabel(option.value)}
                        </span>
                      </div>
                    ),
                    checkboxProps: {
                      accentColor: 'hsl(var(--primary))',
                      checkmarkColor: 'hsl(var(--primary-foreground))',
                      backgroundColor: 'hsl(var(--secondary))',
                      borderColor: 'hsl(var(--border))',
                      size: 20,
                      labelSpacing: 0,
                      labelFontSize: 14,
                      labelFontWeight: 500,
                      checkedCoversOutline: true,
                    },
                  },
                ]}
                values={checked ? [option.value] : []}
                onGroupChange={(values) => handleOptionClick(option.value)}
                maxSelected={1}
                groupDirection={isMobile ? 'column' : 'row'}
                className="!flex-1 w-full"
                swapCheckboxOrder={isRTL}
                borderRadius="var(--radius)"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
