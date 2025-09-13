import { useLanguage } from '@/contexts/LanguageContext';

// Helper hook to get localized text from multilingual fields
export const useListingText = () => {
  const { language } = useLanguage();
  
  const getLocalizedText = (multilingualField: any, fallback: string = '') => {
    if (!multilingualField) return fallback;
    if (typeof multilingualField === 'string') return multilingualField || fallback;
    if (typeof multilingualField !== 'object') return fallback;

    const lower: Record<string, any> = {};
    for (const [key, value] of Object.entries(multilingualField)) {
      lower[key.toLowerCase()] = value;
    }

    const lang = language.toLowerCase();
    const candidates = Array.from(new Set([
      lang,
      lang.split('-')[0],
      `${lang}-us`,
      'en',
      'en-us',
    ]));

    for (const key of candidates) {
      const val = lower[key];
      if (typeof val === 'string' && val.trim().length > 0) return val;
    }

    const matchKey = Object.keys(lower).find((k) => k.startsWith(lang) || k.startsWith('en'));
    const matchedVal = matchKey ? lower[matchKey] : undefined;
    if (typeof matchedVal === 'string' && matchedVal.trim().length > 0) return matchedVal;

    for (const val of Object.values(lower)) {
      if (typeof val === 'string' && (val as string).trim().length > 0) return val as string;
    }

    return fallback;
  };

  return { getLocalizedText };
};