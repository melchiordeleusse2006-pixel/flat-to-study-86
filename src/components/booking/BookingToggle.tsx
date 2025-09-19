import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Clock, Settings } from 'lucide-react';

interface BookingToggleProps {
  listingId: string;
  bookingEnabled: boolean;
  instantBooking?: boolean;
  minimumStayDays?: number;
  maximumStayDays?: number;
  advanceBookingDays?: number;
  onUpdate?: () => void;
}

export const BookingToggle: React.FC<BookingToggleProps> = ({
  listingId,
  bookingEnabled,
  instantBooking = false,
  minimumStayDays = 30,
  maximumStayDays = 365,
  advanceBookingDays = 90,
  onUpdate
}) => {
  const [settings, setSettings] = React.useState({
    booking_enabled: bookingEnabled,
    instant_booking: instantBooking,
    minimum_stay_days: minimumStayDays,
    maximum_stay_days: maximumStayDays,
    advance_booking_days: advanceBookingDays
  });
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('listings')
        .update(settings)
        .eq('id', listingId);

      if (error) throw error;

      toast.success('Booking settings updated successfully');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating booking settings:', error);
      toast.error('Failed to update booking settings');
    } finally {
      setSaving(false);
    }
  };

  const generateAvailability = async () => {
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + (advanceBookingDays * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0];

      const { error } = await supabase
        .rpc('generate_listing_availability', {
          p_listing_id: listingId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;

      toast.success('Availability calendar generated');
    } catch (error) {
      console.error('Error generating availability:', error);
      toast.error('Failed to generate availability');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Booking Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="booking-enabled">Enable Direct Booking</Label>
            <p className="text-sm text-muted-foreground">
              Allow students to book this property directly through the platform
            </p>
          </div>
          <Switch
            id="booking-enabled"
            checked={settings.booking_enabled}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, booking_enabled: checked }))
            }
          />
        </div>

        {settings.booking_enabled && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="instant-booking">Instant Booking</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically confirm bookings without manual approval
                </p>
              </div>
              <Switch
                id="instant-booking"
                checked={settings.instant_booking}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, instant_booking: checked }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-stay">Minimum Stay (days)</Label>
                <Input
                  id="min-stay"
                  type="number"
                  min={1}
                  value={settings.minimum_stay_days}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      minimum_stay_days: parseInt(e.target.value) || 1 
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-stay">Maximum Stay (days)</Label>
                <Input
                  id="max-stay"
                  type="number"
                  min={1}
                  value={settings.maximum_stay_days}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      maximum_stay_days: parseInt(e.target.value) || 365 
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance-booking">Advance Booking (days)</Label>
              <Input
                id="advance-booking"
                type="number"
                min={1}
                value={settings.advance_booking_days}
                onChange={(e) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    advance_booking_days: parseInt(e.target.value) || 90 
                  }))
                }
              />
              <p className="text-sm text-muted-foreground">
                How far in advance students can book
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button onClick={generateAvailability} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Generate Calendar
              </Button>
            </div>
          </>
        )}

        {!settings.booking_enabled && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};