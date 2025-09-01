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
    
    // About Page
    'about.title': 'About Us',
    'about.backHome': 'Back Home',
    'about.intro1': 'Tired of the low quality of real estate services in Milan, we decided to build a platform to make it safer and easier for students who move to University to find a place to live.',
    'about.intro2': 'We carefully select the real estate companies and landowners who share their announcements on this platform based on various criteria–quality-price ratio, responsiveness, comfort–in order to reduce the stress of students as much as possible. We also make sure that only students can make purchases on this platform in order to protect landowners. Enjoy the website and good luck finding your perfect home!',
    'about.founders': 'Melchior and Teo',
    'about.contactInfo': 'Contact Information',
    'about.email': 'Email:',
    'about.partnerTitle': 'Want to partner with us?',
    'about.partnerText': 'Write at',
    'about.partnerOr': 'or schedule a meeting right now',
    'about.scheduleMeeting': 'Schedule Meeting',
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
    
    // About Page
    'about.title': 'Chi Siamo',
    'about.backHome': 'Torna alla Home',
    'about.intro1': 'Stanchi della bassa qualità dei servizi immobiliari a Milano, abbiamo deciso di costruire una piattaforma per rendere più sicuro e facile per gli studenti che si trasferiscono all\'Università trovare un posto dove vivere.',
    'about.intro2': 'Selezioniamo attentamente le società immobiliari e i proprietari di case che condividono i loro annunci su questa piattaforma basandoci su vari criteri: rapporto qualità-prezzo, reattività, comfort, al fine di ridurre il più possibile lo stress degli studenti. Ci assicuriamo anche che solo gli studenti possano effettuare acquisti su questa piattaforma per proteggere i proprietari. Godetevi il sito web e buona fortuna nel trovare la vostra casa perfetta!',
    'about.founders': 'Melchior e Teo',
    'about.contactInfo': 'Informazioni di Contatto',
    'about.email': 'Email:',
    'about.partnerTitle': 'Vuoi collaborare con noi?',
    'about.partnerText': 'Scrivi a',
    'about.partnerOr': 'o programma un incontro subito',
    'about.scheduleMeeting': 'Programma Incontro',
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