import { useState, useEffect } from 'react';
import { Button } from './button';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

const LOVABLE_DOMAIN = 'https://flat2study.lovable.app';

export function DomainFallback() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if we're on the custom domain and if there are connectivity issues
    const isCustomDomain = window.location.hostname === 'flat2study.com';
    
    if (isCustomDomain) {
      // Test connectivity by trying to load a small resource
      const testConnectivity = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          await fetch(window.location.origin + '/favicon.ico', { 
            signal: controller.signal,
            cache: 'no-cache'
          });
          
          clearTimeout(timeoutId);
        } catch (error) {
          console.warn('Connectivity issue detected, showing fallback option');
          setShowFallback(true);
        }
      };

      // Show fallback option after a delay to detect slow loading
      const fallbackTimer = setTimeout(() => {
        setShowFallback(true);
      }, 8000);

      testConnectivity();

      return () => clearTimeout(fallbackTimer);
    }
  }, []);

  const handleFallbackRedirect = () => {
    window.open(LOVABLE_DOMAIN, '_blank');
  };

  if (!showFallback) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-sm">
          <div className="space-y-2">
            <p className="text-yellow-800 dark:text-yellow-200">
              Problème de connexion détecté. Vous pouvez accéder au site via notre domaine de secours.
            </p>
            <Button 
              onClick={handleFallbackRedirect}
              variant="outline"
              size="sm"
              className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Ouvrir flat2study.lovable.app
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}