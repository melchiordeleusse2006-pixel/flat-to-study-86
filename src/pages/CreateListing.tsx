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
import { ListingType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function CreateListing() {
  const { user, profile, loading } = useAuth();
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
    billsIncluded: false,
    furnished: false,
    bedrooms: '',
    bathrooms: '',
    floor: '',
    sizeSqm: '',
    amenities: [] as string[],
    availabilityDate: '',
  });

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

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Validate required fields
    if (!formData.title || !formData.type || !formData.description || !formData.addressLine || 
        !formData.city || !formData.country || !formData.rentMonthlyEUR || !formData.depositEUR ||
        !formData.bedrooms || !formData.bathrooms || !formData.availabilityDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, set default coordinates (Milan city center)
      // In a real app, you'd geocode the address
      const defaultLat = 45.4642;
      const defaultLng = 9.1900;

      const listingData = {
        agency_id: profile.id,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        address_line: formData.addressLine,
        city: formData.city,
        country: formData.country,
        lat: defaultLat,
        lng: defaultLng,
        rent_monthly_eur: parseInt(formData.rentMonthlyEUR),
        deposit_eur: parseInt(formData.depositEUR),
        bills_included: formData.billsIncluded,
        furnished: formData.furnished,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        floor: formData.floor || null,
        size_sqm: formData.sizeSqm ? parseInt(formData.sizeSqm) : null,
        amenities: formData.amenities,
        availability_date: formData.availabilityDate,
        status: 'PUBLISHED'
      };

      const { error } = await supabase
        .from('listings')
        .insert([listingData]);

      if (error) {
        console.error('Error creating listing:', error);
        toast({
          title: "Error",
          description: "Failed to create listing. Please try again.",
          variant: "destructive",
        });
        return;
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
    'WiFi', 'Washing Machine', 'Dishwasher', 'Parking', 'Balcony', 
    'Garden', 'Gym', 'Swimming Pool', 'Air Conditioning', 'Heating'
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
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create New Listing</h1>
            <p className="text-muted-foreground">Add a new property to your portfolio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Cozy Studio Near University"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Select value={formData.type} onValueChange={(value: ListingType) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.addressLine}
                  onChange={(e) => setFormData({...formData, addressLine: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country"
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
                Pricing & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">Monthly Rent (EUR)</Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="800"
                    value={formData.rentMonthlyEUR}
                    onChange={(e) => setFormData({...formData, rentMonthlyEUR: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Deposit (EUR)</Label>
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
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    placeholder="2nd"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sqm)</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="45"
                    value={formData.sizeSqm}
                    onChange={(e) => setFormData({...formData, sizeSqm: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={formData.furnished}
                    onCheckedChange={(checked) => setFormData({...formData, furnished: checked as boolean})}
                  />
                  <Label htmlFor="furnished">Furnished</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bills"
                    checked={formData.billsIncluded}
                    onCheckedChange={(checked) => setFormData({...formData, billsIncluded: checked as boolean})}
                  />
                  <Label htmlFor="bills">Bills Included</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {commonAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, amenities: [...formData.amenities, amenity]});
                        } else {
                          setFormData({...formData, amenities: formData.amenities.filter(a => a !== amenity)});
                        }
                      }}
                    />
                    <Label htmlFor={amenity}>{amenity}</Label>
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
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="availability">Available From</Label>
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
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}