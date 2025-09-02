import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useDashboardStats() {
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [uniqueInquiriesCount, setUniqueInquiriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile || profile.user_type !== 'agency') {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch active listings count
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id')
          .eq('agency_id', profile.id)
          .eq('status', 'PUBLISHED');

        if (listingsError) {
          console.error('Error fetching listings count:', listingsError);
        } else {
          setActiveListingsCount(listingsData?.length || 0);
        }

        // Fetch unique inquiries count (unique sender_ids who have sent messages)
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('agency_id', profile.id)
          .neq('sender_id', user.id); // Exclude messages sent by the agency itself

        if (messagesError) {
          console.error('Error fetching messages count:', messagesError);
        } else {
          // Count unique sender_ids
          const uniqueSenders = new Set(messagesData?.map(msg => msg.sender_id) || []);
          setUniqueInquiriesCount(uniqueSenders.size);
        }
      } catch (error) {
        console.error('Error in fetchStats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to real-time updates for listings
    const listingsChannel = supabase
      .channel('dashboard-listings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
          filter: `agency_id=eq.${profile.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for messages
    const messagesChannel = supabase
      .channel('dashboard-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `agency_id=eq.${profile.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, profile]);

  return {
    activeListingsCount,
    uniqueInquiriesCount,
    loading
  };
}