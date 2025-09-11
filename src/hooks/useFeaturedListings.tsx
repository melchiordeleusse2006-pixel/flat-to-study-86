import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedListing {
  id: string;
  title: string;
  address_line: string;
  city: string;
  rent_monthly_eur: number;
  images: string[];
  agency_name: string;
}

export const useFeaturedListings = (limit: number = 6) => {
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .rpc('get_listings_with_agency', {
            p_limit: limit,
            p_offset: 0
          });

        if (error) {
          console.error('Error fetching featured listings:', error);
          setError(error.message);
          return;
        }

        if (data) {
          setListings(data.map((listing: any) => ({
            id: listing.id,
            title: listing.title || 'Untitled Property',
            address_line: listing.address_line || '',
            city: listing.city || '',
            rent_monthly_eur: listing.rent_monthly_eur || 0,
            images: Array.isArray(listing.images) ? listing.images : [],
            agency_name: listing.agency_name || 'Agency'
          })));
        }
      } catch (err) {
        console.error('Error fetching featured listings:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, [limit]);

  return { listings, loading, error };
};