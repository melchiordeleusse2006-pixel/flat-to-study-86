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

  const splitIntoChunks = (input: string, maxLen = 480) => {
    const words = input.split(/(\s+)/); // keep spaces
    const chunks: string[] = [];
    let current = '';
    for (const part of words) {
      if ((current + part).length > maxLen) {
        if (current.trim()) chunks.push(current);
        // If a single word is longer than maxLen, hard split it
        if (part.length > maxLen) {
          for (let i = 0; i < part.length; i += maxLen) {
            chunks.push(part.slice(i, i + maxLen));
          }
          current = '';
        } else {
          current = part;
        }
      } else {
        current += part;
      }
    }
    if (current.trim()) chunks.push(current);
    return chunks;
  };

  const translateChunk = async (chunk: string) => {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=it|en`
    );
    if (!res.ok) throw new Error('Translation service unavailable');
    const data = await res.json();
    const status = typeof data.responseStatus === 'string' ? parseInt(data.responseStatus, 10) : data.responseStatus;
    if (status === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText as string;
    }
    throw new Error(data.responseDetails || 'Translation failed');
  };

  const translateText = async () => {
    if (isTranslated) {
      onTranslated(originalText);
      return;
    }

    setIsTranslating(true);
    try {
      const chunks = splitIntoChunks(text);
      const translatedParts: string[] = [];
      for (const chunk of chunks) {
        const translated = await translateChunk(chunk);
        translatedParts.push(translated);
      }
      const finalText = translatedParts.join('');
      onTranslated(finalText);
      toast({ title: 'Translation completed', description: 'Description translated to English' });
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation failed',
        description: error?.message || 'Unable to translate text. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Show translate button for non-empty text
  if (!text || text.trim().length < 3) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={translateText}
      disabled={isTranslating}
      className="flex items-center gap-2 text-xs"
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