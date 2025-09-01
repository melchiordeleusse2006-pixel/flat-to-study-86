import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
}

export function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'it')}>
          <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto">
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
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'it')}>
        <SelectTrigger className="w-32">
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