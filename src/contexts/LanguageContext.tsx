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
    'header.logIn': 'Log In',
    'header.start': 'Start',
    'header.account': 'Account',
    
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
    
    // Homepage
    'home.heroWelcome': 'Welcome back',
    'home.heroTitle': 'Find Your Perfect Student Home in Milan',
    'home.heroSubtitle': 'Connecting students with verified housing near Bocconi University and other top Milan universities. Trusted by agencies, loved by students.',
    'home.heroSubtitleStudent': 'Ready to find your perfect student accommodation?',
    'home.heroSubtitleRealtor': 'Manage your listings and connect with potential tenants.',
    'home.findPlace': 'Find a Place',
    'home.universitiesTitle': 'Perfect for Students Near Top Universities',
    'home.universitiesSubtitle': 'Find housing within walking distance or easy commute to Milan\'s best universities',
    'home.featuredTitle': 'Featured Properties',
    'home.featuredSubtitle': 'Hand-picked accommodations from trusted agencies',
    'home.featured': 'Featured',
    'home.month': '/month',
    'home.viewDetails': 'View Details',
    'home.viewAll': 'View All Properties',
    'home.quickActions': 'Quick Actions',
    'home.quickActionsSubtitle': 'Access your most important features',
    'home.messages': 'Messages',
    'home.messagesDesc': 'Chat with landlords and agencies',
    'home.messagesDescRealtor': 'Chat with potential tenants',
    'home.savedListings': 'Saved Listings',
    'home.savedListingsDesc': 'View your favorite properties',
    'home.explore': 'Explore',
    'home.exploreDesc': 'Discover new properties',
    'home.addListing': 'Add Listing',
    'home.addListingDesc': 'Create a new property listing',
    'home.myListings': 'My Listings',
    'home.myListingsDesc': 'View and manage your properties',
    'home.analytics': 'Analytics',
    'home.analyticsDesc': 'View listing performance',
    'home.recentActivity': 'Recent Activity',
    'home.recentActivityDesc': 'No recent activity yet. Start exploring to see your activity here!',
    'home.dashboardStats': 'Dashboard Stats',
    'home.dashboardStatsDesc': 'Overview of your listing performance',
    'home.activeListings': 'Active Listings',
    'home.totalViews': 'Total Views',
    'home.inquiries': 'Inquiries',
    'home.needHelp': 'Need Help?',
    'home.contactUs': 'Contact us at teodor.cosmovici@studbocconi.it',
    'home.helpDesc': 'We are here to help you with anything you need. We answer in 24 hours or less.',
    'home.quickActionsRealtorSubtitle': 'Manage your property listings and business',
    
    // Search Page
    'search.placeholder': 'Search by location, university, or amenities...',
    'search.sortBy': 'Sort by:',
    'search.relevance': 'Relevance',
    'search.priceLowHigh': 'Price: Low to High',
    'search.priceHighLow': 'Price: High to Low',
    'search.newest': 'Newest First',
    'search.distance': 'Distance',
    'search.loading': 'Loading listings...',
    'search.propertiesInView': 'properties in current view',
    'search.noPropertiesView': 'No properties in current view.',
    'search.moveMap': 'Move the map to see listings in different areas',
    'search.noResults': 'No properties match your search criteria.',
    'search.clearFilters': 'Clear Filters',
    
    // Profile Page
    'profile.back': 'Back',
    'profile.about': 'About',
    'profile.agency': 'Agency',
    'profile.student': 'Student',
    'profile.tellAbout': 'Tell us about yourself...',
    'profile.characters': 'characters',
    'profile.cancel': 'Cancel',
    'profile.save': 'Save',
    'profile.saving': 'Saving...',
    'profile.noDescription': 'No description added yet. Click the edit button to add one.',
    'profile.contact': 'Contact',
    'profile.memberSince': 'Member since',
    'profile.pleaseSignIn': 'Please sign in to view your profile.',
    
    // Common
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.city': 'City',
    'common.country': 'Country',
    'common.price': 'Price',
    'common.bedrooms': 'Bedrooms',
    'common.bathrooms': 'Bathrooms',
    'common.furnished': 'Furnished',
    'common.available': 'Available',
    'common.contact': 'Contact',
    'common.viewDetails': 'View Details',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
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
    'header.logIn': 'Accedi',
    'header.start': 'Inizia',
    'header.account': 'Account',
    
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
    
    // Homepage
    'home.heroWelcome': 'Bentornato',
    'home.heroTitle': 'Trova la Tua Casa Perfetta per Studenti a Milano',
    'home.heroSubtitle': 'Colleghiamo studenti con alloggi verificati vicino all\'Università Bocconi e altre università top di Milano. Fidato dalle agenzie, amato dagli studenti.',
    'home.heroSubtitleStudent': 'Pronto a trovare il tuo alloggio perfetto per studenti?',
    'home.heroSubtitleRealtor': 'Gestisci i tuoi annunci e connettiti con inquilini potenziali.',
    'home.findPlace': 'Trova un Posto',
    'home.universitiesTitle': 'Perfetto per Studenti Vicino alle Migliori Università',
    'home.universitiesSubtitle': 'Trova alloggi a distanza pedonale o con facile collegamento alle migliori università di Milano',
    'home.featuredTitle': 'Proprietà in Evidenza',
    'home.featuredSubtitle': 'Alloggi selezionati da agenzie di fiducia',
    'home.featured': 'In Evidenza',
    'home.month': '/mese',
    'home.viewDetails': 'Vedi Dettagli',
    'home.viewAll': 'Vedi Tutte le Proprietà',
    'home.quickActions': 'Azioni Rapide',
    'home.quickActionsSubtitle': 'Accedi alle tue funzioni più importanti',
    'home.messages': 'Messaggi',
    'home.messagesDesc': 'Chatta con proprietari e agenzie',
    'home.messagesDescRealtor': 'Chatta con inquilini potenziali',
    'home.savedListings': 'Annunci Salvati',
    'home.savedListingsDesc': 'Visualizza le tue proprietà preferite',
    'home.explore': 'Esplora',
    'home.exploreDesc': 'Scopri nuove proprietà',
    'home.addListing': 'Aggiungi Annuncio',
    'home.addListingDesc': 'Crea un nuovo annuncio immobiliare',
    'home.myListings': 'I Miei Annunci',
    'home.myListingsDesc': 'Visualizza e gestisci le tue proprietà',
    'home.analytics': 'Analisi',
    'home.analyticsDesc': 'Visualizza le prestazioni degli annunci',
    'home.recentActivity': 'Attività Recente',
    'home.recentActivityDesc': 'Nessuna attività recente ancora. Inizia a esplorare per vedere la tua attività qui!',
    'home.dashboardStats': 'Statistiche Dashboard',
    'home.dashboardStatsDesc': 'Panoramica delle prestazioni dei tuoi annunci',
    'home.activeListings': 'Annunci Attivi',
    'home.totalViews': 'Visualizzazioni Totali',
    'home.inquiries': 'Richieste',
    'home.needHelp': 'Hai Bisogno di Aiuto?',
    'home.contactUs': 'Contattaci a teodor.cosmovici@studbocconi.it',
    'home.helpDesc': 'Siamo qui per aiutarti con tutto quello di cui hai bisogno. Rispondiamo entro 24 ore o meno.',
    'home.quickActionsRealtorSubtitle': 'Gestisci i tuoi annunci immobiliari e il tuo business',
    
    // Search Page
    'search.placeholder': 'Cerca per posizione, università o servizi...',
    'search.sortBy': 'Ordina per:',
    'search.relevance': 'Rilevanza',
    'search.priceLowHigh': 'Prezzo: Dal Basso all\'Alto',
    'search.priceHighLow': 'Prezzo: Dall\'Alto al Basso',
    'search.newest': 'Più Recenti Prima',
    'search.distance': 'Distanza',
    'search.loading': 'Caricamento annunci...',
    'search.propertiesInView': 'proprietà nella vista corrente',
    'search.noPropertiesView': 'Nessuna proprietà nella vista corrente.',
    'search.moveMap': 'Sposta la mappa per vedere annunci in aree diverse',
    'search.noResults': 'Nessuna proprietà corrisponde ai tuoi criteri di ricerca.',
    'search.clearFilters': 'Cancella Filtri',
    
    // Profile Page
    'profile.back': 'Indietro',
    'profile.about': 'Info',
    'profile.agency': 'Agenzia',
    'profile.student': 'Studente',
    'profile.tellAbout': 'Raccontaci di te...',
    'profile.characters': 'caratteri',
    'profile.cancel': 'Annulla',
    'profile.save': 'Salva',
    'profile.saving': 'Salvando...',
    'profile.noDescription': 'Nessuna descrizione aggiunta ancora. Clicca il pulsante modifica per aggiungerne una.',
    'profile.contact': 'Contatta',
    'profile.memberSince': 'Membro dal',
    'profile.pleaseSignIn': 'Effettua l\'accesso per visualizzare il tuo profilo.',
    
    // Common
    'common.email': 'Email',
    'common.phone': 'Telefono',
    'common.address': 'Indirizzo',
    'common.city': 'Città',
    'common.country': 'Paese',
    'common.price': 'Prezzo',
    'common.bedrooms': 'Camere da Letto',
    'common.bathrooms': 'Bagni',
    'common.furnished': 'Arredato',
    'common.available': 'Disponibile',
    'common.contact': 'Contatta',
    'common.viewDetails': 'Vedi Dettagli',
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.success': 'Successo',
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