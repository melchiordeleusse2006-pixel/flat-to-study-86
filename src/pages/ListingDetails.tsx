import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Listing, ListingType, ListingStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Calendar, 
  Euro, 
  Wifi, 
  Car, 
  Users, 
  Phone, 
  Mail, 
  Building,
  Send
} from 'lucide-react';
import Header from '@/components/layout/Header';
import SimpleMapView from '@/components/map/SimpleMapView';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Set default message when language changes
  useEffect(() => {
    setMessage(t('listing.messageDefault'));
  }, [t]);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      // First, get basic listing from direct query since we need all fields
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'PUBLISHED')
        .single();

      if (listingError) throw listingError;

      // Get the agency profile information directly
      const { data: agencyProfile, error: agencyError } = await supabase
        .from('profiles')
        .select('agency_name, phone, email')
        .eq('id', listingData.agency_id)
        .eq('user_type', 'agency')
        .single();

      if (agencyError) {
        console.error('Error fetching agency profile:', agencyError);
      }

      // Transform the data to match the Listing type
      const transformedListing: Listing = {
        id: listingData.id,
        title: listingData.title,
        type: listingData.type as ListingType,
        description: listingData.description,
        addressLine: listingData.address_line,
        city: listingData.city,
        country: listingData.country,
        lat: listingData.lat,
        lng: listingData.lng,
        rentMonthlyEUR: listingData.rent_monthly_eur,
        depositEUR: listingData.deposit_eur,
        agencyFee: listingData.agency_fee,
        billsIncluded: listingData.bills_included,
        furnished: listingData.furnished,
        bedrooms: listingData.bedrooms,
        bathrooms: listingData.bathrooms,
        floor: listingData.floor,
        sizeSqm: listingData.size_sqm,
        amenities: Array.isArray(listingData.amenities) ? listingData.amenities.map(item => String(item)) : [],
        availabilityDate: listingData.availability_date,
        images: Array.isArray(listingData.images) ? listingData.images.map(item => String(item)) : [],
        videoUrl: listingData.video_url,
        createdAt: listingData.created_at,
        publishedAt: listingData.published_at,
        status: listingData.status as ListingStatus,
        expiresAt: listingData.expires_at,
        agency: {
          id: listingData.agency_id,
          name: agencyProfile?.agency_name || 'Agency',
          phone: agencyProfile?.phone || '',
          logoUrl: undefined,
          ownerUserId: '',
          website: undefined,
          billingEmail: agencyProfile?.email || '',
          createdAt: ''
        }
      };

      setListing(transformedListing);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: t('listing.error'),
        description: t('listing.loadingDetails'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !listing || !profile) {
      toast({
        title: t('listing.authRequired'),
        description: t('listing.authRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: t('listing.messageRequired'),
        description: t('listing.messageRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    // Debug logging
    console.log('Sending message with data:', {
      listing_id: listing.id,
      sender_id: user.id,
      agency_id: listing.agency.id,
      agency: listing.agency,
      message: message.trim(),
      sender_name: profile.full_name || 'Student',
      sender_phone: profile.phone,
      sender_university: profile.university
    });

    if (!listing.agency.id) {
      toast({
        title: "Error",
        description: "Agency information is missing. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          listing_id: listing.id,
          sender_id: user.id,
          agency_id: listing.agency.id,
          message: message.trim(),
          sender_name: profile.full_name || 'Student',
          sender_phone: profile.phone,
          sender_university: profile.university
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: t('listing.messageSent'),
        description: t('listing.messageSentDesc')
      });

      setMessage(t('listing.messageDefault'));
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('listing.error'),
        description: t('listing.messageError'),
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTypeDisplayName = (type: string) => {
    const types: Record<string, string> = {
      room: t('propertyType.room'),
      studio: t('propertyType.studio'),
      apartment: t('propertyType.apartment'),
      flat: t('propertyType.flat')
    };
    return types[type] || type;
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
      'WiFi': <Wifi className="h-4 w-4" />,
      'Parking Space': <Car className="h-4 w-4" />,
      'Shared Kitchen': <Users className="h-4 w-4" />,
    };
    return icons[amenity];
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-pulse text-lg">{t('listing.loadingDetails')}</div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="text-lg text-muted-foreground mb-4">{t('listing.notFound')}</div>
          <Button onClick={() => navigate('/search')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('listing.backToSearch')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/search')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('listing.backToSearch')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card>
                <CardContent className="p-0">
                  {listing.images.length > 0 ? (
                    <div className="relative">
                      <img 
                        src={listing.images[currentImageIndex]}
                        alt={listing.title}
                        className="w-full h-64 md:h-96 object-cover rounded-lg"
                      />
                      
                      {/* Image Navigation */}
                      {listing.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {listing.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <Badge className="absolute top-4 left-4 bg-background/90 text-foreground">
                        {getTypeDisplayName(listing.type)}
                      </Badge>
                    </div>
                  ) : (
                    <div className="w-full h-64 md:h-96 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-muted-foreground">No images available</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{listing.addressLine}, {listing.city}, {listing.country}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-price">
                        {formatPrice(listing.rentMonthlyEUR)}
                      </div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {listing.bedrooms > 0 && (
                      <div className="flex items-center space-x-2">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                        <span>{listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {listing.bathrooms > 0 && (
                      <div className="flex items-center space-x-2">
                        <Bath className="h-5 w-5 text-muted-foreground" />
                        <span>{listing.bathrooms} bathroom{listing.bathrooms > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {listing.sizeSqm && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <span>{listing.sizeSqm}m²</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Euro className="h-5 w-5 text-muted-foreground" />
                      <span>€{listing.depositEUR} deposit</span>
                    </div>
                  </div>

                  {/* Financial Information */}
                  {listing.agencyFee && (
                    <div className="flex items-center space-x-2">
                      <Euro className="h-5 w-5 text-muted-foreground" />
                      <span>Agency Fee: {listing.agencyFee}</span>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>Available from {formatDate(listing.availabilityDate)}</span>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2">
                    {listing.furnished && (
                      <Badge variant="secondary">Furnished</Badge>
                    )}
                    {listing.billsIncluded && (
                      <Badge variant="secondary">Bills Included</Badge>
                    )}
                    {listing.floor && (
                      <Badge variant="secondary">Floor {listing.floor}</Badge>
                    )}
                  </div>

                  {/* Amenities */}
                  {listing.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity) => (
                          <Badge key={amenity} variant="outline" className="flex items-center space-x-1">
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6 pb-0">
                    <p className="text-muted-foreground text-sm mb-4">
                      📍 {listing.addressLine}, {listing.city}
                    </p>
                  </div>
                  <div className="p-6">
                    <SimpleMapView 
                      listings={[listing]}
                      className="h-80 w-full overflow-hidden rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Message Form */}
              {user && profile?.user_type === 'student' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Send Message</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your message..."
                      rows={4}
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={sendingMessage}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Agency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Agency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{listing.agency.name}</h4>
                  </div>
                  
                  {/* Always show contact information */}
                  <div className="space-y-2">
                    {listing.agency.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{listing.agency.phone}</span>
                      </div>
                    )}
                    {listing.agency.billingEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{listing.agency.billingEmail}</span>
                      </div>
                    )}
                  </div>

                  {!user && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-3">
                        Please log in to send a message to this agency.
                      </p>
                      <Button 
                        onClick={() => navigate('/auth')}
                        className="w-full"
                      >
                        Log In to Contact
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}