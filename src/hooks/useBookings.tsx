import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Booking, BookingStatus } from '@/types/booking';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings((data || []).map(booking => ({
        ...booking,
        status: booking.status as BookingStatus
      })));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (
    listingId: string,
    landlordId: string,
    checkInDate: string,
    checkOutDate: string,
    monthlyRent: number,
    securityDeposit: number
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const totalAmount = monthlyRent + securityDeposit;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          listing_id: listingId,
          tenant_id: user.id,
          landlord_id: landlordId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          monthly_rent: monthlyRent,
          security_deposit: securityDeposit,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBookings();
      toast.success('Booking request created successfully');
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking request');
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      toast.success('Booking status updated');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
      throw error;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    loading,
    createBooking,
    updateBookingStatus,
    refetch: fetchBookings
  };
};