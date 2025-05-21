import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { i18nConfig } from './i18nConfig';

export default async function initTranslations(locale: string) {
  const i18nInstance = i18n.createInstance();

  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string) => import(`../../../public/locales/${language}.json`)))
    .init({
      lng: locale,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

  return i18nInstance;
} 