import { supabase } from '@/integrations/supabase/client';

export async function geocodeAllListings() {
  try {
    const { data, error } = await supabase.functions.invoke('geocode-all-listings', {
      body: {}
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error geocoding listings:', error);
    throw error;
  }
}

export async function geocodeSingleListing(listingId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('geocode-addresses', {
      body: { listingId }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error geocoding listing:', error);
    throw error;
  }
}