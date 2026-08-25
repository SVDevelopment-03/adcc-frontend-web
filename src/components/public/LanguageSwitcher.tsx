import React from 'react';
import { useLocale, type Locale } from '../../contexts/LocaleContext';

import { cn } from '../ui/utils';

const NATIVE_LABEL: Record<Locale, string> = {
  en: 'English',
  ar: 'عربي',
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  const nextLocale: Locale = locale === 'ar' ? 'en' : 'ar';
  const nextLabel = NATIVE_LABEL[nextLocale];

  const handleToggle = () => {
    void setLocale(nextLocale);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'text-[15px] font-medium text-white transition-colors hover:text-[#019839] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#019839]/40 rounded-md px-1 py-1',
        className ?? 'hidden md:block',
      )}
    >
      {nextLabel}
    </button>
  );
}
