import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile-icon';
}

export function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === 'mobile-icon') {
    return (
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'it')}>
        <SelectTrigger className="w-auto border-0 bg-transparent p-1 h-auto">
          <Globe className="h-5 w-5 text-current" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('language.english')}</SelectItem>
          <SelectItem value="it">{t('language.italian')}</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-current opacity-70" />
        <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'it')}>
          <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto text-current">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t('language.english')}</SelectItem>
            <SelectItem value="it">{t('language.italian')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-current opacity-70" />
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'it')}>
        <SelectTrigger className="w-32 text-current">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('language.english')}</SelectItem>
          <SelectItem value="it">{t('language.italian')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}