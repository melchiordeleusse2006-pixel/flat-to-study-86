import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

interface MultilingualInputProps {
  label: string;
  value: { en: string; it: string };
  onChange: (value: { en: string; it: string }) => void;
  type?: 'input' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

export function MultilingualInput({ 
  label, 
  value, 
  onChange, 
  type = 'input', 
  placeholder = '', 
  required = false 
}: MultilingualInputProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState(language);

  const handleChange = (lang: 'en' | 'it', newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue
    });
  };

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'en' | 'it')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en" className="text-sm">
            🇬🇧 English
          </TabsTrigger>
          <TabsTrigger value="it" className="text-sm">
            🇮🇹 Italiano
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="en" className="mt-2">
          <InputComponent
            value={value.en}
            onChange={(e) => handleChange('en', e.target.value)}
            placeholder={`${placeholder} (English)`}
            className="w-full"
            rows={type === 'textarea' ? 4 : undefined}
          />
        </TabsContent>
        
        <TabsContent value="it" className="mt-2">
          <InputComponent
            value={value.it}
            onChange={(e) => handleChange('it', e.target.value)}
            placeholder={`${placeholder} (Italiano)`}
            className="w-full"
            rows={type === 'textarea' ? 4 : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}