import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TranslateButtonProps {
  text: string;
  onTranslated: (translatedText: string) => void;
  isTranslated: boolean;
  originalText: string;
}

export default function TranslateButton({ 
  text, 
  onTranslated, 
  isTranslated, 
  originalText 
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async () => {
    if (isTranslated) {
      // If already translated, switch back to original
      onTranslated(originalText);
      return;
    }

    setIsTranslating(true);
    try {
      // Use Google Translate API via a free service
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=it|en`
      );
      
      if (!response.ok) {
        throw new Error('Translation service unavailable');
      }
      
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        onTranslated(data.responseData.translatedText);
        toast({
          title: "Translation completed",
          description: "Description translated to English"
        });
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed", 
        description: "Unable to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Don't show translate button if text is already in English or empty
  if (!text || text.trim().length < 10) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={translateText}
      disabled={isTranslating}
      className="ml-2"
    >
      {isTranslating ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Languages className="h-4 w-4 mr-2" />
      )}
      {isTranslating 
        ? "Translating..." 
        : isTranslated 
          ? "Show original" 
          : "Translate to English"
      }
    </Button>
  );
}