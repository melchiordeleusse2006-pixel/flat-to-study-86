import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Search, Users, Shield, MapPin, Heart, MessageCircle, BarChart3, Plus, Eye } from 'lucide-react';
import { universities, mockListings } from '@/data/mockData';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
const Index = () => {
  const {
    user,
    profile
  } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };
  const isStudent = profile?.user_type === 'student' || profile?.user_type === 'private';
  const isRealtor = profile?.user_type === 'agency';
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Full viewport height */}
      <section className="relative h-screen flex items-center justify-center hero-gradient text-white overflow-hidden">
        <div className="container mx-auto text-center relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {user && profile ? `Welcome back, ${profile.full_name || 'User'}!` : 'Find Your Perfect Student Home in Milan'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            {user && profile ? isStudent ? 'Ready to find your perfect student accommodation?' : 'Manage your listings and connect with potential tenants.' : 'Connecting students with verified housing near Bocconi University and other top Milan universities. Trusted by agencies, loved by students.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link to="/search" className="flex-1">
              <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
                <Search className="mr-2 h-5 w-5" />
                Find a Place
              </Button>
            </Link>
            
            
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
      {user && profile ? <>
          {isStudent ? <>
              {/* Universities Section for Students */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Perfect for Students Near Top Universities</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                      Find housing within walking distance or easy commute to Milan's best universities
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {universities.map(university => <Card key={university.id} className="text-center hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                          <h3 className="font-semibold mb-2">{university.name}</h3>
                          <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                        </CardContent>
                      </Card>)}
                  </div>
                </div>
              </section>

              {/* Featured Listings for Students */}
              <section className="py-16 px-4">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
                    <p className="text-muted-foreground text-lg">
                      Hand-picked accommodations from trusted agencies
                    </p>
                  </div>
                  
                  <div className="relative mb-8">
                    <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                      {mockListings.slice(0, 6).map(listing => <Card key={listing.id} className="min-w-[300px] md:min-w-[350px] flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow snap-start">
                          <div className="relative h-48">
                            <img src={listing.images[0] || '/placeholder.svg'} alt={listing.title} className="w-full h-full object-cover" />
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                              Featured
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
                                <span className="text-sm text-muted-foreground font-normal">/month</span>
                              </span>
                              <Link to={`/listing/${listing.id}`}>
                                <Button size="sm">View Details</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link to="/search">
                      <Button size="lg" variant="outline">
                        View All Properties
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>

              {/* Quick Actions for Students */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
                    <p className="text-muted-foreground text-lg">
                      Access your most important features
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link to="/messages">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center relative">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <MessageCircle className="h-8 w-8 text-primary" />
                          </div>
                          {unreadCount > 0 && <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                              {unreadCount}
                            </Badge>}
                          <h3 className="text-xl font-semibold mb-3">Messages</h3>
                          <p className="text-muted-foreground">
                            Chat with landlords and agencies
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
                          <h3 className="text-xl font-semibold mb-3">Saved Listings</h3>
                          <p className="text-muted-foreground">
                            View your favorite properties
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
                          <h3 className="text-xl font-semibold mb-3">Explore</h3>
                          <p className="text-muted-foreground">
                            Discover new properties
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Card className="h-full">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Recent Activity</h3>
                        <p className="text-muted-foreground text-sm">
                          No recent activity yet. Start exploring to see your activity here!
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </> : isRealtor ? <>
              {/* Realtor Dashboard Content */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
                    <p className="text-muted-foreground text-lg">
                      Manage your property listings and business
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link to="/create-listing">
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Plus className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3">Add Listing</h3>
                          <p className="text-muted-foreground">
                            Create a new property listing
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
                          <h3 className="text-xl font-semibold mb-3">My Listings</h3>
                          <p className="text-muted-foreground">
                            View and manage your properties
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
                          {unreadCount > 0 && <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                              {unreadCount}
                            </Badge>}
                          <h3 className="text-xl font-semibold mb-3">Messages</h3>
                          <p className="text-muted-foreground">
                            Chat with potential tenants
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Card className="h-full">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Analytics</h3>
                        <p className="text-muted-foreground">
                          View listing performance
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Dashboard Stats */}
              <section className="py-16 px-4">
                <div className="container mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Dashboard Stats</h2>
                    <p className="text-muted-foreground text-lg">
                      Overview of your listing performance
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">0</div>
                        <p className="text-muted-foreground">Active Listings</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">0</div>
                        <p className="text-muted-foreground">Total Views</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">0</div>
                        <p className="text-muted-foreground">Inquiries</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Contact Us */}
              <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto text-center">
                  <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
                  <div className="max-w-2xl mx-auto text-lg space-y-4">
                    <p className="font-medium">Contact us at teodor.cosmovici@studbocconi.it</p>
                    <p className="text-muted-foreground">
                      We are here to help you with anything you need. We answer in 24 hours or less.
                    </p>
                  </div>
                </div>
              </section>
            </> : null}
        </> : <>
          {/* Default content for non-authenticated users */}
          {/* Universities Section */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Perfect for Students Near Top Universities</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Find housing within walking distance or easy commute to Milan's best universities
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {universities.map(university => <Card key={university.id} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">{university.name}</h3>
                      <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </section>

          {/* Featured Listings */}
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
                <p className="text-muted-foreground text-lg">
                  Hand-picked accommodations from trusted agencies
                </p>
              </div>
              
              <div className="relative mb-8">
                <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                  {mockListings.slice(0, 6).map(listing => <Card key={listing.id} className="min-w-[300px] md:min-w-[350px] flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow snap-start">
                      <div className="relative h-48">
                        <img src={listing.images[0] || '/placeholder.svg'} alt={listing.title} className="w-full h-full object-cover" />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                          Featured
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
                            <span className="text-sm text-muted-foreground font-normal">/month</span>
                          </span>
                          <Link to={`/listing/${listing.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
              </div>
              
              <div className="text-center">
                <Link to="/search">
                  <Button size="lg" variant="outline">
                    View All Properties
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Properties selected by hand specifically for students by looking at campus proximity and student-friendly amenities.</h2>
                <p className="text-muted-foreground text-lg">
                  Your trusted partner in finding the perfect student accommodation
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Verified Listings</h3>
                  <p className="text-muted-foreground">All properties are verified by our team. We only work with trusted agencies and landlords.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Student-Focused</h3>
                  <p className="text-muted-foreground">
                    Designed specifically for students with features like university proximity and student-friendly amenities.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Easy Process</h3>
                  <p className="text-muted-foreground">We believe that simplicity is your greatest tool your housing search. Less buttons, more efficiency.</p>
                </div>
              </div>
            </div>
          </section>
        </>}

      {/* CTA Section - Only for non-authenticated users or students */}
      {(!user || !profile || isStudent) && <section className="py-20 px-4 hero-gradient text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Student Home?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">Join the thousands of students who have found their perfect accommodation through flat2study.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link to="/search" className="flex-1">
                <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
                  <Search className="mr-2 h-5 w-5" />
                  Start Searching
                </Button>
              </Link>
              
            </div>
          </div>
        </section>}

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg hero-gradient text-white">
                <Logo size={20} />
              </div>
              <span className="text-xl font-bold">flat2study</span>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground">About</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            © 2024 flat2study. All rights reserved. Connecting students with quality housing since 2024.
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;