import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { supabase } from '../lib/supabase';
import { I18nextProvider } from 'react-i18next';
import { i18nConfig } from '../lib/i18n/i18nConfig';
import initTranslations from '../lib/i18n/i18n';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const initI18n = async () => {
      try {
        // First try to get language from database for authenticated users
        const { data: { session } } = await supabase.auth.getSession();
        let language = i18nConfig.defaultLocale;

        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('language')
            .eq('id', session.user.id)
            .single();

          if (userData?.language) {
            language = userData.language;
          }
        } else {
          // Fallback to localStorage for unauthenticated users
          const storedLanguage = localStorage.getItem('preferredLanguage');
          if (storedLanguage) {
            language = storedLanguage;
          }
        }

        const i18n = await initTranslations(language);
        setI18nInstance(i18n);
      } catch (error) {
        console.error('Error initializing i18n:', error);
        const i18n = await initTranslations(i18nConfig.defaultLocale);
        setI18nInstance(i18n);
      }
    };

    initI18n();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Update language when user signs in
        supabase
          .from('users')
          .select('language')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userData }) => {
            if (userData?.language && i18nInstance) {
              i18nInstance.changeLanguage(userData.language);
              localStorage.removeItem('preferredLanguage');
            }
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SESSION_UPDATE') {
        console.log('Received session update from extension:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!i18nInstance) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      <Component {...pageProps} />
    </I18nextProvider>
  );
} 