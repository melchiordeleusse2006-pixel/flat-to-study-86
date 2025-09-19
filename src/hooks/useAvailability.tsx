import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ListingAvailability } from '@/types/booking';
import { toast } from 'sonner';

export const useAvailability = (listingId: string) => {
  const [availability, setAvailability] = useState<ListingAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listing_availability')
        .select('*')
        .eq('listing_id', listingId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (checkIn: string, checkOut: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('check_availability', {
          p_listing_id: listingId,
          p_check_in: checkIn,
          p_check_out: checkOut
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const generateAvailability = async (startDate: string, endDate: string) => {
    try {
      const { error } = await supabase
        .rpc('generate_listing_availability', {
          p_listing_id: listingId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;

      await fetchAvailability();
      toast.success('Availability generated successfully');
    } catch (error) {
      console.error('Error generating availability:', error);
      toast.error('Failed to generate availability');
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [listingId]);

  return {
    availability,
    loading,
    checkAvailability,
    generateAvailability,
    refetch: fetchAvailability
  };
};