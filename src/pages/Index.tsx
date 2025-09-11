import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Search, Users, Shield, MapPin, Heart, MessageCircle, BarChart3, Plus, Eye, ChevronDown } from 'lucide-react';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import { universities } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { LanguageSelector } from '@/components/ui/language-selector';
import OwnerAccess from '@/components/OwnerAccess';
import OwnerDashboard from '@/pages/OwnerDashboard';
import { useState, useEffect } from 'react';

interface FeaturedListing {
  id: string;
  title: string;
  address_line: string;
  city: string;
  rent_monthly_eur: number;
  images: string[];
}

const Index = () => {
  const { user, profile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const unreadCount = useUnreadMessagesCount();
  const { activeListingsCount, uniqueInquiriesCount, loading: statsLoading } = useDashboardStats();
  const isMobile = useIsMobile();
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Fetch featured listings from database
  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, address_line, city, rent_monthly_eur, images')
          .eq('status', 'PUBLISHED')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching listings:', error);
        } else {
          const processedListings = (data || []).map(listing => ({
            ...listing,
            images: Array.isArray(listing.images) ? (listing.images as string[]) : []
          })) as FeaturedListing[];
          setFeaturedListings(processedListings);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingListings(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (profile?.user_type === 'admin') {
    return <OwnerDashboard onLogout={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ScrollIndicator />
      <Header />
      <main>
        {profile?.user_type === 'student' ? (
          <>
            {/* Hero Section for Students */}
            <section className="pt-20 pb-12 px-4 bg-gradient-to-br from-background to-secondary/20">
              <div className="container mx-auto text-center">
                <div className="mb-8">
                  <div className="mb-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 hero-gradient bg-clip-text text-transparent">
                      {user ? t('home.heroWelcome') : t('home.heroTitle')}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                      {t('home.heroSubtitleStudent')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Link to="/search">
                    <Button size="lg" className="hero-gradient text-white border-0 px-8">
                      <Search className="h-5 w-5 mr-2" />
                      {t('home.findPlace')}
                    </Button>
                  </Link>
                  <Link to="/favorites">
                    <Button size="lg" variant="outline" className="px-8">
                      <Heart className="h-5 w-5 mr-2" />
                      {t('home.favorites')}
                    </Button>
                  </Link>
                </div>

                {/* Quick Actions Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  <Link to="/messages" className="group">
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <CardContent className="p-0 text-center">
                        <div className="relative mb-4">
                          <MessageCircle className="h-12 w-12 mx-auto text-primary" />
                          {unreadCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">{t('home.messages')}</h3>
                        <p className="text-sm text-muted-foreground">{t('home.messagesDesc')}</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/search" className="group">
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <CardContent className="p-0 text-center">
                        <Search className="h-12 w-12 mx-auto text-primary mb-4" />
                        <h3 className="font-semibold mb-2">{t('home.search')}</h3>
                        <p className="text-sm text-muted-foreground">{t('home.searchDesc')}</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/favorites" className="group">
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <CardContent className="p-0 text-center">
                        <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
                        <h3 className="font-semibold mb-2">{t('home.favorites')}</h3>
                        <p className="text-sm text-muted-foreground">{t('home.favoritesDesc')}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </section>

            {/* Universities Section */}
            <section className="py-16 px-4 bg-secondary/5">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.universitiesTitle')}</h2>
                  <p className="text-muted-foreground text-lg">{t('home.universitiesSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {universities.map((university) => (
                    <Link key={university.id} to={`/search?university=${encodeURIComponent(university.name)}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <h3 className="font-semibold mb-2">{university.name}</h3>
                          <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Listings for Students */}
            <section className="py-16 px-4">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.featuredTitle')}</h2>
                  <p className="text-muted-foreground text-lg">
                    {t('home.featuredSubtitle')}
                  </p>
                </div>
                
                <div className="relative mb-8">
                  <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {isLoadingListings ? (
                      <div className="flex items-center justify-center py-8 w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : featuredListings.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <p className="text-muted-foreground">No featured properties available</p>
                      </div>
                    ) : (
                      featuredListings.map(listing => (
                        <Card key={listing.id} className="min-w-[300px] md:min-w-[350px] flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow snap-start">
                          <div className="relative h-48">
                            <img 
                              src={listing.images[0] || '/placeholder.svg'} 
                              alt={listing.title} 
                              className="w-full h-full object-cover" 
                            />
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                              {t('home.featured')}
                            </Badge>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="font-semibold mb-2 line-clamp-2">{listing.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {listing.address_line}, {listing.city}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-price">
                                {formatPrice(listing.rent_monthly_eur)}
                                <span className="text-sm text-muted-foreground font-normal">{t('home.month')}</span>
                              </span>
                              <Link to={`/listing/${listing.id}`}>
                                <Button size="sm">{t('home.viewDetails')}</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <Link to="/search">
                    <Button size="lg" variant="outline">
                      {t('home.viewAll')}
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        ) : profile?.user_type === 'agency' ? (
          <>
            {/* Hero Section for Agencies */}
            <section className="pt-20 pb-12 px-4 bg-gradient-to-br from-background to-secondary/20">
              <div className="container mx-auto text-center">
                <div className="mb-8">
                  <div className="mb-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 hero-gradient bg-clip-text text-transparent">
                      {user ? t('home.heroWelcome') : t('home.heroTitle')}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                      {t('home.heroSubtitleRealtor')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Link to="/create-listing">
                    <Button size="lg" className="hero-gradient text-white border-0 px-8">
                      <Plus className="h-5 w-5 mr-2" />
                      {t('dashboard.createListing')}
                    </Button>
                  </Link>
                  <Link to="/my-listings">
                    <Button size="lg" variant="outline" className="px-8">
                      <Eye className="h-5 w-5 mr-2" />
                      {t('dashboard.viewListings')}
                    </Button>
                  </Link>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  <Card className="p-6">
                    <CardContent className="p-0 text-center">
                      <Plus className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('dashboard.totalListings')}</h3>
                      <p className="text-2xl font-bold text-primary">
                        {statsLoading ? '...' : activeListingsCount}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Link to="/messages" className="group">
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <CardContent className="p-0 text-center">
                        <div className="relative mb-4">
                          <MessageCircle className="h-12 w-12 mx-auto text-primary" />
                          {unreadCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">{t('dashboard.totalMessages')}</h3>
                        <p className="text-2xl font-bold text-primary">
                          {statsLoading ? '...' : uniqueInquiriesCount}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Card className="p-6">
                    <CardContent className="p-0 text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('dashboard.performance')}</h3>
                      <p className="text-sm text-muted-foreground">{t('dashboard.viewAnalytics')}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Features Section for Agencies */}
            <section className="py-16 px-4 bg-secondary/5">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.whyChooseUs')}</h2>
                  <p className="text-muted-foreground text-lg">{t('home.whyChooseUsSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="p-6 text-center">
                    <CardContent className="p-0">
                      <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('home.verifiedStudents')}</h3>
                      <p className="text-muted-foreground">{t('home.verifiedStudentsDesc')}</p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 text-center">
                    <CardContent className="p-0">
                      <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('home.securePayments')}</h3>
                      <p className="text-muted-foreground">{t('home.securePaymentsDesc')}</p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 text-center">
                    <CardContent className="p-0">
                      <BarChart3 className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('home.analytics')}</h3>
                      <p className="text-muted-foreground">{t('home.analyticsDesc')}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Universities Section */}
            <section className="py-16 px-4">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.universitiesTitle')}</h2>
                  <p className="text-muted-foreground text-lg">{t('home.universitiesSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {universities.map((university) => (
                    <Card key={university.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <h3 className="font-semibold mb-2">{university.name}</h3>
                        <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Listings */}
            <section className="py-16 px-4">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.featuredTitle')}</h2>
                  <p className="text-muted-foreground text-lg">
                    {t('home.featuredSubtitle')}
                  </p>
                </div>
                
                <div className="relative mb-8">
                  <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {isLoadingListings ? (
                      <div className="flex items-center justify-center py-8 w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : featuredListings.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <p className="text-muted-foreground">No featured properties available</p>
                      </div>
                    ) : (
                      featuredListings.map(listing => (
                        <Card key={listing.id} className="min-w-[300px] md:min-w-[350px] flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow snap-start">
                          <div className="relative h-48">
                            <img 
                              src={listing.images[0] || '/placeholder.svg'} 
                              alt={listing.title} 
                              className="w-full h-full object-cover" 
                            />
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                              {t('home.featured')}
                            </Badge>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="font-semibold mb-2 line-clamp-2">{listing.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {listing.address_line}, {listing.city}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-price">
                                {formatPrice(listing.rent_monthly_eur)}
                                <span className="text-sm text-muted-foreground font-normal">{t('home.month')}</span>
                              </span>
                              <Link to={`/listing/${listing.id}`}>
                                <Button size="sm">{t('home.viewDetails')}</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <Link to="/search">
                    <Button size="lg" variant="outline">
                      {t('home.viewAll')}
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Generic Hero Section */}
            <section className="pt-20 pb-12 px-4 bg-gradient-to-br from-background to-secondary/20">
              <div className="container mx-auto text-center">
                <div className="mb-8">
                  <Logo className="mx-auto mb-6" />
                  <div className="mb-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 hero-gradient bg-clip-text text-transparent">
                      {t('home.heroTitle')}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                      {t('home.heroSubtitle')}
                    </p>
                  </div>
                </div>

                {/* User Type Selection */}
                <div className="max-w-2xl mx-auto mb-12">
                  <h2 className="text-2xl font-semibold mb-6">{t('common.getStarted')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/auth?type=student">
                      <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                        <CardContent className="p-0 text-center">
                          <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                          <h3 className="font-semibold mb-2">{t('common.student')}</h3>
                          <p className="text-sm text-muted-foreground">{t('home.studentDescription')}</p>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link to="/auth?type=agency">
                      <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                        <CardContent className="p-0 text-center">
                          <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                          <h3 className="font-semibold mb-2">{t('common.agency')}</h3>
                          <p className="text-sm text-muted-foreground">{t('home.agencyDescription')}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>

                {/* Language Selector */}
                <div className="flex justify-center mb-8">
                  <LanguageSelector />
                </div>

                {/* Owner Access */}
                <OwnerAccess onAuthenticated={() => {}} />
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-secondary/5">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.whyChooseUs')}</h2>
                  <p className="text-muted-foreground text-lg">{t('home.whyChooseUsSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="p-6 text-center">
                    <CardContent className="p-0">
                      <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('home.verifiedStudents')}</h3>
                      <p className="text-muted-foreground">{t('home.verifiedStudentsDesc')}</p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 text-center">
                    <CardContent className="p-0">
                      <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('home.securePayments')}</h3>
                      <p className="text-muted-foreground">{t('home.securePaymentsDesc')}</p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 text-center">
                    <CardContent className="p-0">
                      <BarChart3 className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{t('home.analytics')}</h3>
                      <p className="text-muted-foreground">{t('home.analyticsDesc')}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Universities Section */}
            <section className="py-16 px-4">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.universitiesTitle')}</h2>
                  <p className="text-muted-foreground text-lg">{t('home.universitiesSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {universities.map((university) => (
                    <Card key={university.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <h3 className="font-semibold mb-2">{university.name}</h3>
                        <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Listings */}
            <section className="py-16 px-4">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('home.featuredTitle')}</h2>
                  <p className="text-muted-foreground text-lg">
                    {t('home.featuredSubtitle')}
                  </p>
                </div>
                
                <div className="relative mb-8">
                  <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {isLoadingListings ? (
                      <div className="flex items-center justify-center py-8 w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : featuredListings.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <p className="text-muted-foreground">No featured properties available</p>
                      </div>
                    ) : (
                      featuredListings.map(listing => (
                        <Card key={listing.id} className="min-w-[300px] md:min-w-[350px] flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow snap-start">
                          <div className="relative h-48">
                            <img 
                              src={listing.images[0] || '/placeholder.svg'} 
                              alt={listing.title} 
                              className="w-full h-full object-cover" 
                            />
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                              {t('home.featured')}
                            </Badge>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="font-semibold mb-2 line-clamp-2">{listing.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {listing.address_line}, {listing.city}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-price">
                                {formatPrice(listing.rent_monthly_eur)}
                                <span className="text-sm text-muted-foreground font-normal">{t('home.month')}</span>
                              </span>
                              <Link to={`/listing/${listing.id}`}>
                                <Button size="sm">{t('home.viewDetails')}</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <Link to="/search">
                    <Button size="lg" variant="outline">
                      {t('home.viewAll')}
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;