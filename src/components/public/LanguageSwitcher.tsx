import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale, type Locale } from '../../contexts/LocaleContext';

import { cn } from '../ui/utils';

const LANGUAGES: { code: Locale; labelKey: string }[] = [
  { code: 'en', labelKey: 'public.language.english' },
  { code: 'ar', labelKey: 'public.language.arabic' },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = t(
    locale === 'ar' ? 'public.language.arabic' : 'public.language.english',
  );

  const handleSelect = (code: Locale) => {
    void setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('relative', className ?? 'hidden md:block')}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-md px-1 py-1 text-[15px] font-medium text-black transition-colors hover:text-[#019839] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#019839]/40"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('public.language.select')}
          className="absolute end-0 top-full z-[130] mt-2 min-w-[140px] overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
        >
          {LANGUAGES.map(({ code, labelKey }) => (
            <li key={code} role="option" aria-selected={locale === code}>
              <button
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center px-4 py-2.5 text-start text-[15px] transition-colors hover:bg-[#019839]/10 ${
                  locale === code
                    ? 'font-semibold text-[#019839]'
                    : 'font-medium text-black'
                }`}
              >
                {t(labelKey)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
