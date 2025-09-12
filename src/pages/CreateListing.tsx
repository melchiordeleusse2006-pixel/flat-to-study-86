import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, Euro, Home, Camera, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { ListingType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateListing() {
  const { user, profile, loading } = useAuth();
  const { hasCredits, refreshBalance } = useCredits();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    type: '' as ListingType | '',
    description: '',
    addressLine: '',
    city: '',
    country: '',
    rentMonthlyEUR: '',
    depositEUR: '',
    agencyFee: '',
    billsIncluded: false,
    furnished: false,
    bedrooms: '',
    bathrooms: '',
    floor: '',
    sizeSqm: '',
    amenities: [] as string[],
    availabilityDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Handle authentication and authorization
  useEffect(() => {
    if (!loading && user && profile?.user_type !== 'agency') {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show access denied for non-agency users
  if (user && profile?.user_type !== 'agency') {
    return null; // Will redirect via useEffect
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        newImages.push(data.publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    setUploadedImages([...uploadedImages, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }

    // Check if agency has credits for listing
    if (profile.user_type === 'agency' && !hasCredits(1)) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to create a listing. Please purchase credits first.",
        variant: "destructive",
      });
      navigate('/owner-dashboard');
      return;
    }

    // No field validation - allow publishing with any fields filled

    setIsSubmitting(true);

    try {
      // For now, set default coordinates (Milan city center)
      // In a real app, you'd geocode the address
      const defaultLat = 45.4642;
      const defaultLng = 9.1900;

      const listingData = {
        agency_id: profile.id,
        title: formData.title || null,
        type: formData.type || null,
        description: formData.description || null,
        address_line: formData.addressLine || null,
        city: formData.city || null,
        country: formData.country || null,
        lat: defaultLat,
        lng: defaultLng,
        rent_monthly_eur: formData.rentMonthlyEUR ? parseInt(formData.rentMonthlyEUR) : null,
        deposit_eur: formData.depositEUR ? parseInt(formData.depositEUR) : null,
        bills_included: formData.billsIncluded,
        furnished: formData.furnished,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        floor: formData.floor || null,
        size_sqm: formData.sizeSqm ? parseInt(formData.sizeSqm) : null,
        amenities: formData.amenities,
        availability_date: formData.availabilityDate || null,
        agency_fee: formData.agencyFee || null,
        images: uploadedImages,
        status: 'PUBLISHED'
      };

      console.log('Attempting to create listing with data:', listingData);
      console.log('Current user profile:', profile);

      const { data, error } = await supabase
        .from('listings')
        .insert([listingData])
        .select();

      if (error) {
        console.error('Detailed error creating listing:', error);
        toast({
          title: "Error",
          description: `Failed to create listing: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Deduct credit for agency users after successful listing creation
      if (profile.user_type === 'agency' && data?.[0]) {
        const { error: creditError } = await supabase.rpc('deduct_agency_credits', {
          agency_profile_id: profile.id,
          credits_amount: 1,
          listing_id_param: data[0].id,
          description_param: 'Credit used for listing creation'
        });

        if (creditError) {
          console.error('Error deducting credits:', creditError);
          // Note: We don't fail the listing creation if credit deduction fails
          toast({
            title: "Warning",
            description: "Listing created but there was an issue with credit deduction. Please contact support.",
            variant: "destructive",
          });
        } else {
          // Refresh credit balance
          refreshBalance();
        }
      }

      toast({
        title: "Success!",
        description: "Your listing has been published successfully.",
      });

      // Navigate to search page to see the new listing
      navigate('/search');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonAmenities = [
    { key: 'wifi', label: t('amenities.wifi') },
    { key: 'washingMachine', label: t('amenities.washingMachine') },
    { key: 'dishwasher', label: t('amenities.dishwasher') },
    { key: 'parking', label: t('amenities.parking') },
    { key: 'balcony', label: t('amenities.balcony') },
    { key: 'garden', label: t('amenities.garden') },
    { key: 'gym', label: t('amenities.gym') },
    { key: 'swimmingPool', label: t('amenities.swimmingPool') },
    { key: 'airConditioning', label: t('amenities.airConditioning') },
    { key: 'heating', label: t('amenities.heating') }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('createListing.back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('createListing.title')}</h1>
            <p className="text-muted-foreground">{t('createListing.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {t('createListing.basicInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('createListing.propertyTitle')}</Label>
                  <Input
                    id="title"
                    placeholder="es. Monolocale Accogliente vicino all'Università"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('createListing.propertyType')}</Label>
                  <Select value={formData.type} onValueChange={(value: ListingType) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('createListing.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room">{t('propertyType.room')}</SelectItem>
                      <SelectItem value="studio">{t('propertyType.studio')}</SelectItem>
                      <SelectItem value="apartment">{t('propertyType.apartment')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('createListing.description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('createListing.descriptionPlaceholder')}
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t('createListing.propertyImages')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">{t('createListing.uploadImages')}</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-muted-foreground">Uploading images...</p>}
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('createListing.location')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">{t('createListing.address')}</Label>
                <Input
                  id="address"
                  placeholder={t('createListing.addressPlaceholder')}
                  value={formData.addressLine}
                  onChange={(e) => setFormData({...formData, addressLine: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('createListing.city')}</Label>
                  <Input
                    id="city"
                    placeholder={t('createListing.cityPlaceholder')}
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t('createListing.country')}</Label>
                  <Input
                    id="country"
                    placeholder={t('createListing.countryPlaceholder')}
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                {t('createListing.pricingDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">{t('createListing.monthlyRent')}</Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="800"
                    value={formData.rentMonthlyEUR}
                    onChange={(e) => setFormData({...formData, rentMonthlyEUR: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">{t('createListing.deposit')}</Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="1600"
                    value={formData.depositEUR}
                    onChange={(e) => setFormData({...formData, depositEUR: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">{t('createListing.bedrooms')}</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">{t('createListing.bathrooms')}</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">{t('createListing.floor')}</Label>
                  <Input
                    id="floor"
                    placeholder={t('createListing.floorPlaceholder')}
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">{t('createListing.size')}</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="45"
                    value={formData.sizeSqm}
                    onChange={(e) => setFormData({...formData, sizeSqm: e.target.value})}
                  />
                 </div>
               </div>

               <div className="space-y-2">
                <Label htmlFor="agencyFee">{t('createListing.agencyFee')}</Label>
                <Input
                  id="agencyFee"
                  placeholder={t('createListing.agencyFeePlaceholder')}
                  value={formData.agencyFee}
                  onChange={(e) => setFormData({...formData, agencyFee: e.target.value})}
                />
               </div>

               <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={formData.furnished}
                    onCheckedChange={(checked) => setFormData({...formData, furnished: checked as boolean})}
                  />
                  <Label htmlFor="furnished">{t('createListing.furnished')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bills"
                    checked={formData.billsIncluded}
                    onCheckedChange={(checked) => setFormData({...formData, billsIncluded: checked as boolean})}
                  />
                  <Label htmlFor="bills">{t('createListing.billsIncluded')}</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>{t('createListing.amenities')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {commonAmenities.map((amenity) => (
                  <div key={amenity.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.key}
                      checked={formData.amenities.includes(amenity.key)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, amenities: [...formData.amenities, amenity.key]});
                        } else {
                          setFormData({...formData, amenities: formData.amenities.filter(a => a !== amenity.key)});
                        }
                      }}
                    />
                    <Label htmlFor={amenity.key}>{amenity.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('createListing.availability')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="availability">{t('createListing.availableFrom')}</Label>
                <Input
                  id="availability"
                  type="date"
                  value={formData.availabilityDate}
                  onChange={(e) => setFormData({...formData, availabilityDate: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              size="lg" 
              className="hero-gradient text-white border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('createListing.creating') : t('createListing.create')}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/')}>
              {t('createListing.cancel')}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}