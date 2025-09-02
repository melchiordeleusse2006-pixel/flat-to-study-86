import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Search, Users, Shield, MapPin, Heart, MessageCircle, BarChart3, Plus, Eye } from 'lucide-react';
import { universities, mockListings } from '@/data/mockData';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Index = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const unreadCount = useUnreadMessagesCount();
  const { activeListingsCount, uniqueInquiriesCount, loading: statsLoading } = useDashboardStats();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const isStudent = profile?.user_type === 'student' || profile?.user_type === 'private';
  const isRealtor = profile?.user_type === 'agency';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Full viewport height */}
      <section className="relative h-screen flex items-center justify-center hero-gradient text-white overflow-hidden">
        <div className="container mx-auto text-center relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {user && profile ? `${t('home.heroWelcome')}, ${profile.full_name || 'User'}!` : t('home.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            {user && profile ? 
              (isStudent ? t('home.heroSubtitleStudent') : t('home.heroSubtitleRealtor')) : 
              t('home.heroSubtitle')
            }
          </p>
          
          <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
            {user && isRealtor ? (
              <>
                <Link to="/create-listing">
                  <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
                    <Plus className="mr-2 h-5 w-5" />
                    Add your listings
                  </Button>
                </Link>
                <div className="text-center">
                  <Link to="/search">
                    <span className="text-white/90 hover:text-white underline cursor-pointer text-lg">
                      {t('home.findPlace')}
                    </span>
                  </Link>
                </div>
              </>
            ) : (
              <Link to="/search">
                <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
                  <Search className="mr-2 h-5 w-5" />
                  {t('home.findPlace')}
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-white/15"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 rounded-full bg-white/25"></div>
        </div>
      </section>

      {/* Conditional Content Based on User Type */}
      {user && profile ? (
        <>
          {isStudent ? (
            <>
              {/* Universities Section for Students */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">{t('home.universitiesTitle')}</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                      {t('home.universitiesSubtitle')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {universities.map(university => (
                      <Card key={university.id} className="text-center hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                          <h3 className="font-semibold mb-2">{university.name}</h3>
                          <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                        </CardContent>
                      </Card>
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
                      {mockListings.slice(0, 6).map(listing => (
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
                              {listing.addressLine}, {listing.city}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-price">
                                {formatPrice(listing.rentMonthlyEUR)}
                                <span className="text-sm text-muted-foreground font-normal">{t('home.month')}</span>
                              </span>
                              <Link to={`/listing/${listing.id}`}>
                                <Button size="sm">{t('home.viewDetails')}</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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

              {/* Quick Actions for Students */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">{t('home.quickActions')}</h2>
                    <p className="text-muted-foreground text-lg">
                      {t('home.quickActionsSubtitle')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link to="/messages">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center relative">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <MessageCircle className="h-8 w-8 text-primary" />
                          </div>
                          {unreadCount > 0 && (
                            <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                              {unreadCount}
                            </Badge>
                          )}
                          <h3 className="text-xl font-semibold mb-3">{t('home.messages')}</h3>
                          <p className="text-muted-foreground">
                            {t('home.messagesDesc')}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/favorites">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Heart className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3">{t('home.savedListings')}</h3>
                          <p className="text-muted-foreground">
                            {t('home.savedListingsDesc')}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/search">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Search className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3">{t('home.explore')}</h3>
                          <p className="text-muted-foreground">
                            {t('home.exploreDesc')}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Card className="h-full">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{t('home.recentActivity')}</h3>
                        <p className="text-muted-foreground text-sm">
                          {t('home.recentActivityDesc')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </>
          ) : isRealtor ? (
            <>
              {/* Realtor Dashboard Content */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">{t('home.quickActions')}</h2>
                    <p className="text-muted-foreground text-lg">
                      {t('home.quickActionsRealtorSubtitle')}
                    </p>
                  </div>
                  
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/create-listing">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Plus className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3">{t('home.addListing')}</h3>
                          <p className="text-muted-foreground">
                            {t('home.addListingDesc')}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/my-listings">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Eye className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3">{t('home.myListings')}</h3>
                          <p className="text-muted-foreground">
                            {t('home.myListingsDesc')}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/messages">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center relative">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <MessageCircle className="h-8 w-8 text-primary" />
                          </div>
                          {unreadCount > 0 && (
                            <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                              {unreadCount}
                            </Badge>
                          )}
                          <h3 className="text-xl font-semibold mb-3">{t('home.messages')}</h3>
                          <p className="text-muted-foreground">
                            {t('home.messagesDescRealtor')}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                  </div>
                </div>
              </section>

              {/* Dashboard Stats */}
              <section className="py-16 px-4">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">{t('home.dashboardStats')}</h2>
                    <p className="text-muted-foreground text-lg">
                      {t('home.dashboardStatsDesc')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {statsLoading ? '...' : activeListingsCount}
                        </div>
                        <p className="text-muted-foreground">{t('home.activeListings')}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {statsLoading ? '...' : uniqueInquiriesCount}
                        </div>
                        <p className="text-muted-foreground">{t('home.inquiries')}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Contact Us */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto text-center">
                  <h2 className="text-3xl font-bold mb-4">{t('home.needHelp')}</h2>
                  <div className="max-w-2xl mx-auto text-lg space-y-4">
                    <p className="font-medium">Contact us at melchior.deleusse@studbocconi.it</p>
                    <p className="text-muted-foreground">
                      {t('home.helpDesc')}
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </>
      ) : (
        <>
          {/* Default content for non-authenticated users */}
          {/* Universities Section */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{t('home.universitiesTitle')}</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {t('home.universitiesSubtitle')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {universities.map(university => (
                  <Card key={university.id} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
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
                  {mockListings.slice(0, 6).map(listing => (
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
                          {listing.addressLine}, {listing.city}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-price">
                            {formatPrice(listing.rentMonthlyEUR)}
                            <span className="text-sm text-muted-foreground font-normal">{t('home.month')}</span>
                          </span>
                          <Link to={`/listing/${listing.id}`}>
                            <Button size="sm">{t('home.viewDetails')}</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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

          {/* Benefits Section */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Why Choose flat2study?</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  We make finding student accommodation in Milan safe, easy, and reliable
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Verified Properties</h3>
                  <p className="text-muted-foreground">
                    All properties are verified and listed by trusted agencies and landlords
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Student-Only</h3>
                  <p className="text-muted-foreground">
                    Exclusive platform for students, ensuring the best experience for all users
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Perfect Locations</h3>
                  <p className="text-muted-foreground">
                    Properties near top Milan universities with easy commute options
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Index;