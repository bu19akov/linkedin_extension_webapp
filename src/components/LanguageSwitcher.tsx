import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import languages from '../lib/i18n/i18nConfig';
import { supabase } from '../lib/supabase';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = async (locale: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // If user is authenticated, update in database
        await supabase
          .from('users')
          .update({ language: locale })
          .eq('id', user.id);
      } else {
        // If user is not authenticated, store in localStorage
        localStorage.setItem('preferredLanguage', locale);
      }
      
      await i18n.changeLanguage(locale);
      setOpen(false);
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const currentLanguage = languages.find(l => l.locale === i18n.language);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-between bg-muted/60 hover:bg-white focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-sm transition-all"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span>{currentLanguage?.name}</span>
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>
      {open && (
        <ul 
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border border-border rounded-lg shadow-lg" 
          role="listbox"
        >
          {languages.map((lang) => (
            <li
              key={lang.locale}
              className={cn(
                'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/10',
                i18n.language === lang.locale && 'bg-primary/10 font-semibold'
              )}
              onClick={() => handleLanguageChange(lang.locale)}
              role="option"
              aria-selected={i18n.language === lang.locale}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 