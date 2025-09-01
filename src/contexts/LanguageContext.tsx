import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.favorites': 'Favorites',
    'header.signOut': 'Sign Out',
    'header.signIn': 'Sign In',
    'header.postListing': 'Post Listing',
    'header.getStarted': 'Get Started',
    'header.publishListings': 'Publish Listings',
    'header.myListings': 'My Listings',
    'header.messages': 'Messages',
    'header.about': 'About Us',
    'header.profile': 'Profile',
    'header.profileInfo': 'Profile Information',
    'header.language': 'Language',
    'header.hello': 'Hello',
    
    // Languages
    'language.english': 'English',
    'language.italian': 'Italian',
  },
  it: {
    // Header
    'header.favorites': 'Preferiti',
    'header.signOut': 'Esci',
    'header.signIn': 'Accedi',
    'header.postListing': 'Pubblica Annuncio',
    'header.getStarted': 'Inizia',
    'header.publishListings': 'Pubblica Annunci',
    'header.myListings': 'I Miei Annunci',
    'header.messages': 'Messaggi',
    'header.about': 'Chi Siamo',
    'header.profile': 'Profilo',
    'header.profileInfo': 'Informazioni Profilo',
    'header.language': 'Lingua',
    'header.hello': 'Ciao',
    
    // Languages
    'language.english': 'Inglese',
    'language.italian': 'Italiano',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'it')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}