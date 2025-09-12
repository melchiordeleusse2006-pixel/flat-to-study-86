import { useLanguage } from '@/contexts/LanguageContext';

// Helper hook to get localized text from multilingual fields
export const useListingText = () => {
  const { language } = useLanguage();
  
  const getLocalizedText = (multilingualField: any, fallback: string = '') => {
    if (!multilingualField || typeof multilingualField !== 'object') {
      return fallback;
    }
    return multilingualField[language] || multilingualField['en'] || fallback;
  };

  return { getLocalizedText };
};