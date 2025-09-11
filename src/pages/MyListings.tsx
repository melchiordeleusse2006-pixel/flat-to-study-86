import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, Plus, Eye, Edit, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface AgencyListing {
  id: string;
  title: string;
  type: string;
  city: string;
  rent_monthly_eur: number;
  status: string;
  images: any; // Will be converted to string[]
  created_at: string;
  published_at: string | null;
}

export default function MyListings() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [listings, setListings] = useState<AgencyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showRentedDialog, setShowRentedDialog] = useState(false);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);
  const [showRepostDialog, setShowRepostDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [leaseEndDate, setLeaseEndDate] = useState('');

  // Redirect non-agency users
  useEffect(() => {
    if (!loading && (!user || profile?.user_type !== 'agency')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  // Fetch agency's listings
  useEffect(() => {
    if (profile?.id) {
      fetchListings();
    }
  }, [profile]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('agency_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Error",
          description: t('myListings.loadError'),
          variant: "destructive",
        });
      } else {
        // Convert images from JSON to string array
        const processedListings = (data || []).map(listing => ({
          ...listing,
          images: Array.isArray(listing.images) ? listing.images : []
        }));
        setListings(processedListings);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMarkAsRented = (listingId: string) => {
    setSelectedListing(listingId);
    setShowRentedDialog(true);
  };

  const handleConfirmRented = () => {
    setShowRentedDialog(false);
    setShowCongratsDialog(true);
  };

  const handleLeaseSubmit = () => {
    if (!leaseEndDate) return;
    setShowCongratsDialog(false);
    setShowRepostDialog(true);
  };

  const handleRepostDecision = async (wantRepost: boolean) => {
    if (wantRepost) {
      await markAsRented(true);
    } else {
      setShowRepostDialog(false);
      setShowDeleteDialog(true);
    }
  };

  const markAsRented = async (autoRepost: boolean) => {
    try {
      // Get the full listing details for archiving
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', selectedListing)
        .single();

      if (fetchError || !listing) {
        toast({
          title: "Error",
          description: "Failed to fetch listing details",
          variant: "destructive",
        });
        return;
      }

      // Get agency contact info
      const { data: agencyData } = await supabase
        .from('profiles')
        .select('agency_name, phone, email')
        .eq('id', listing.agency_id)
        .single();

      // Archive the listing
      const { error: archiveError } = await supabase
        .from('archives')
        .insert({
          original_listing_id: listing.id,
          agency_id: listing.agency_id,
          title: listing.title,
          type: listing.type,
          description: listing.description,
          address_line: listing.address_line,
          city: listing.city,
          country: listing.country,
          lat: listing.lat,
          lng: listing.lng,
          rent_monthly_eur: listing.rent_monthly_eur,
          deposit_eur: listing.deposit_eur,
          bills_included: listing.bills_included,
          furnished: listing.furnished,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          floor: listing.floor,
          size_sqm: listing.size_sqm,
          amenities: listing.amenities,
          availability_date: listing.availability_date,
          images: listing.images,
          video_url: listing.video_url,
          agency_fee: listing.agency_fee,
          lease_end_date: leaseEndDate,
          auto_repost: autoRepost,
          archive_reason: 'RENTED',
          original_created_at: listing.created_at,
          original_published_at: listing.published_at,
          agency_contact: agencyData || null
        });

      if (archiveError) {
        toast({
          title: "Error",
          description: "Failed to archive listing",
          variant: "destructive",
        });
        return;
      }

      // Update listing status to rented
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          status: 'RENTED',
          lease_end_date: leaseEndDate,
          auto_repost: autoRepost
        })
        .eq('id', selectedListing);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to update listing status",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Listing marked as rented and archived successfully!",
        });
        fetchListings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error processing rental:', error);
    }
    
    // Reset state
    setShowRepostDialog(false);
    setSelectedListing(null);
    setLeaseEndDate('');
  };

  const handleDeleteListing = async (listingId: string, fromDialog = false) => {
    if (!fromDialog && !confirm(t('myListings.deleteConfirm'))) return;

    try {
      // Get the full listing details for archiving
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (fetchError || !listing) {
        toast({
          title: "Error",
          description: "Failed to fetch listing details",
          variant: "destructive",
        });
        return;
      }

      // Get agency contact info
      const { data: agencyData } = await supabase
        .from('profiles')
        .select('agency_name, phone, email')
        .eq('id', listing.agency_id)
        .single();

      // Archive the listing before deleting
      const { error: archiveError } = await supabase
        .from('archives')
        .insert({
          original_listing_id: listing.id,
          agency_id: listing.agency_id,
          title: listing.title,
          type: listing.type,
          description: listing.description,
          address_line: listing.address_line,
          city: listing.city,
          country: listing.country,
          lat: listing.lat,
          lng: listing.lng,
          rent_monthly_eur: listing.rent_monthly_eur,
          deposit_eur: listing.deposit_eur,
          bills_included: listing.bills_included,
          furnished: listing.furnished,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          floor: listing.floor,
          size_sqm: listing.size_sqm,
          amenities: listing.amenities,
          availability_date: listing.availability_date,
          images: listing.images,
          video_url: listing.video_url,
          agency_fee: listing.agency_fee,
          archive_reason: 'DELETED',
          original_created_at: listing.created_at,
          original_published_at: listing.published_at,
          agency_contact: agencyData || null
        });

      if (archiveError) {
        toast({
          title: "Error",
          description: "Failed to archive listing",
          variant: "destructive",
        });
        return;
      }

      // Delete the listing
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) {
        toast({
          title: "Error",
          description: t('myListings.deleteError'),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Listing deleted and archived successfully!",
        });
        fetchListings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    handleDeleteListing(selectedListing!, true);
    setSelectedListing(null);
    setLeaseEndDate('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PUBLISHED': { variant: 'default' as const, label: t('myListings.status.published') },
      'DRAFT': { variant: 'secondary' as const, label: t('myListings.status.draft') },
      'EXPIRED': { variant: 'destructive' as const, label: t('myListings.status.expired') },
      'ARCHIVED': { variant: 'outline' as const, label: t('myListings.status.archived') },
      'RENTED': { variant: 'secondary' as const, label: 'Rented' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-6xl mx-auto py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('myListings.loadingListings')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-6xl mx-auto py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          {/* Mobile: Stack vertically */}
          <div className="block md:hidden">
            <Link to="/" className="mb-4 inline-flex">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('messages.backToHome')}
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t('myListings.title')}</h1>
              <p className="text-muted-foreground">
                {t('myListings.subtitle')} ({listings.length} {t('myListings.totalCount')})
              </p>
            </div>
          </div>
          
          {/* Desktop: Use relative positioning */}
          <div className="hidden md:block relative flex items-center justify-center">
            <Link to="/" className="absolute left-0">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('messages.backToHome')}
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-bold">{t('myListings.title')}</h1>
              <p className="text-muted-foreground">
                {t('myListings.subtitle')} ({listings.length} {t('myListings.totalCount')})
              </p>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('myListings.noListingsTitle')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('myListings.noListingsDescription')}
              </p>
              <Link to="/create-listing">
                <Button className="hero-gradient text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  {listings.length === 0 ? t('myListings.createFirstListing') : t('myListings.addNewListing')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {listing.images.length > 0 ? (
                    <img 
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Home className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(listing.status)}
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-2 flex-1 mr-2">
                      {listing.title}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-lg text-price">
                        {formatPrice(listing.rent_monthly_eur)}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('myListings.perMonth')}</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)} in {listing.city}
                  </p>

                  {/* Rented Button - Only show for published listings */}
                  {listing.status === 'PUBLISHED' && (
                    <div className="mb-3">
                      <Button 
                        onClick={() => handleMarkAsRented(listing.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        It's Rented!
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      {t('myListings.actions.view')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t('myListings.actions.edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteListing(listing.id, false)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rental Confirmation Dialog */}
        <Dialog open={showRentedDialog} onOpenChange={setShowRentedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as Rented</DialogTitle>
              <DialogDescription>
                Did you rent your apartment?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleConfirmRented} className="flex-1">
                Yes
              </Button>
              <Button variant="outline" onClick={() => setShowRentedDialog(false)} className="flex-1">
                Go Back
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Congratulations Dialog */}
        <Dialog open={showCongratsDialog} onOpenChange={setShowCongratsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Congratulations!</DialogTitle>
              <DialogDescription>
                How long are you renting it for?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="lease-end">Lease End Date</Label>
                <Input 
                  id="lease-end"
                  type="date" 
                  value={leaseEndDate}
                  onChange={(e) => setLeaseEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleLeaseSubmit} 
                className="w-full"
                disabled={!leaseEndDate}
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Repost Dialog */}
        <Dialog open={showRepostDialog} onOpenChange={setShowRepostDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Auto-Repost Option</DialogTitle>
              <DialogDescription>
                Would you like us to post it back here one month before the lease will expire? That way, you will be able to rent it again as quickly as possible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => handleRepostDecision(true)} className="flex-1">
                Yes, auto-repost
              </Button>
              <Button variant="outline" onClick={() => handleRepostDecision(false)} className="flex-1">
                No, thanks
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Listing</DialogTitle>
              <DialogDescription>
                Then we will delete the listing. Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleConfirmDelete} variant="destructive" className="flex-1">
                Confirm Delete
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                Go Back
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}