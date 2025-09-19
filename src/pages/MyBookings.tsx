import React from 'react';
import Header from '@/components/layout/Header';
import { BookingCard } from '@/components/booking/BookingCard';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function MyBookings() {
  const { bookings, loading, updateBookingStatus } = useBookings();
  const { profile } = useAuth();

  const userRole = profile?.user_type === 'student' ? 'tenant' : 'landlord';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {userRole === 'tenant' ? 'My Bookings' : 'Booking Requests'}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'tenant' 
              ? 'Manage your property bookings and reservations'
              : 'Review and manage booking requests for your properties'
            }
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">
              {userRole === 'tenant' ? 'No bookings yet' : 'No booking requests yet'}
            </h2>
            <p className="text-muted-foreground">
              {userRole === 'tenant' 
                ? 'Start exploring properties and make your first booking'
                : 'Booking requests will appear here when students request to book your properties'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                userRole={userRole}
                onStatusUpdate={updateBookingStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}